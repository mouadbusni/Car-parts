// AutoPro public catalog API — Cloudflare Workers + D1
// Read-only by design. No admin, customer identity, cart or payment endpoints.

const MAX_PAGE_SIZE = 48;
const SORT_SQL = Object.freeze({
  featured: 'is_featured DESC, rating DESC, name COLLATE NOCASE ASC',
  newest: 'created_at DESC, name COLLATE NOCASE ASC',
  rating: 'rating DESC, reviews_count DESC, name COLLATE NOCASE ASC',
  'price-low': 'price ASC, name COLLATE NOCASE ASC',
  'price-high': 'price DESC, name COLLATE NOCASE ASC',
});
const PRODUCT_COLUMNS = 'id, category_id, name, slug, description, price, compare_price, image_url, gallery, specifications, compatibility, stock_quantity, sku, brand, rating, reviews_count, is_featured, created_at, updated_at';
const CATEGORY_COLUMNS = 'id, name, slug, description, image_url, created_at';

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': status === 200 ? 'public, max-age=30, s-maxage=60' : 'no-store',
      ...extraHeaders,
    },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};
  const allowed = (env.PUBLIC_ORIGINS || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (!allowed.includes(origin)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    Vary: 'Origin',
  };
}

const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 180;

function normalizeProduct(product) {
  if (!product) return null;
  return {
    ...product,
    gallery: JSON.parse(product.gallery || '[]'),
    specifications: JSON.parse(product.specifications || '{}'),
    compatibility: JSON.parse(product.compatibility || '[]'),
    is_featured: product.is_featured === 1,
  };
}

function intParam(value, fallback, max) {
  if (value === null) return fallback;
  if (!/^(0|[1-9][0-9]{0,5})$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= max ? number : null;
}

function escapeLike(input) {
  return input.replace(/[\\%_]/g, '\\$&');
}

export async function handleCatalogRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const cors = corsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    if (!request.headers.has('Origin') || !cors['Access-Control-Allow-Origin']) {
      return json({ error: 'Origin is not allowed.' }, 403, cors);
    }
    return new Response(null, { status: 204, headers: cors });
  }
  if (!path.startsWith('/api/')) return json({ error: 'Not found.' }, 404, cors);
  if (!['GET', 'HEAD'].includes(request.method)) {
    return json({ error: 'This API is read-only.' }, 405, { ...cors, Allow: 'GET, HEAD, OPTIONS' });
  }
  if (!env.DB || typeof env.DB.prepare !== 'function') {
    return json({ error: 'Catalog database is not configured.' }, 503, cors);
  }

  try {
    let output;
    if (path === '/api/health') {
      const query = await env.DB.prepare('SELECT 1 AS ok').first();
      output = json({ ok: query?.ok === 1, service: 'autopro-catalog', environment: 'staging' }, 200, cors);
    } else if (path === '/api/categories') {
      const result = await env.DB.prepare(`SELECT ${CATEGORY_COLUMNS} FROM categories ORDER BY name COLLATE NOCASE ASC`).all();
      output = json({ data: result.results || [] }, 200, cors);
    } else if (path.startsWith('/api/categories/')) {
      const slug = path.slice('/api/categories/'.length);
      if (!validSlug(slug)) return json({ error: 'Invalid category slug.' }, 400, cors);
      const item = await env.DB.prepare(`SELECT ${CATEGORY_COLUMNS} FROM categories WHERE slug = ? LIMIT 1`).bind(slug).first();
      output = item ? json({ data: item }, 200, cors) : json({ error: 'Category not found.' }, 404, cors);
    } else if (path === '/api/products') {
      const limit = intParam(url.searchParams.get('limit'), 24, MAX_PAGE_SIZE);
      const offset = intParam(url.searchParams.get('offset'), 0, 2000);
      if (limit === null || limit < 1 || offset === null) return json({ error: 'Invalid pagination parameters.' }, 400, cors);

      const search = (url.searchParams.get('search') || '').trim();
      if (search.length > 80) return json({ error: 'Search is too long.' }, 400, cors);

      const category = url.searchParams.get('category') || '';
      if (category && (category.length > 120 || !/^[a-zA-Z0-9-]+$/.test(category))) {
        return json({ error: 'Invalid category filter.' }, 400, cors);
      }

      const featured = url.searchParams.get('featured');
      if (featured !== null && featured !== 'true' && featured !== 'false') {
        return json({ error: 'Invalid featured filter.' }, 400, cors);
      }

      const sort = url.searchParams.get('sort') || 'featured';
      if (!Object.prototype.hasOwnProperty.call(SORT_SQL, sort)) {
        return json({ error: 'Invalid sort order.' }, 400, cors);
      }

      const where = [];
      const bindings = [];
      if (search) {
        where.push("name LIKE ? ESCAPE '\\' COLLATE NOCASE");
        bindings.push('%' + escapeLike(search) + '%');
      }
      if (category) {
        where.push('category_id = ?');
        bindings.push(category);
      }
      if (featured !== null) {
        where.push('is_featured = ?');
        bindings.push(featured === 'true' ? 1 : 0);
      }
      const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';
      const query = `SELECT ${PRODUCT_COLUMNS} FROM products${clause} ORDER BY ${SORT_SQL[sort]} LIMIT ? OFFSET ?`;
      const result = await env.DB.prepare(query).bind(...bindings, limit + 1, offset).all();
      const rows = result.results || [];
      output = json({
        data: rows.slice(0, limit).map(normalizeProduct),
        pagination: { limit, offset, hasMore: rows.length > limit },
      }, 200, cors);
    } else if (path.startsWith('/api/products/')) {
      const slug = path.slice('/api/products/'.length);
      if (!validSlug(slug)) return json({ error: 'Invalid product slug.' }, 400, cors);
      const item = await env.DB.prepare(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE slug = ? LIMIT 1`).bind(slug).first();
      output = item ? json({ data: normalizeProduct(item) }, 200, cors) : json({ error: 'Product not found.' }, 404, cors);
    } else {
      output = json({ error: 'Not found.' }, 404, cors);
    }

    return request.method === 'HEAD'
      ? new Response(null, { status: output.status, headers: output.headers })
      : output;
  } catch {
    return json({ error: 'Catalog temporarily unavailable.' }, 503, cors);
  }
}

export default {
  fetch: handleCatalogRequest,
};
