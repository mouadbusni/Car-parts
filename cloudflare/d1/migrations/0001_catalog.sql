-- AutoPro Cloudflare D1 catalog, staging schema v1
-- No authentication, customer data, orders, payments, or checkout tables are created.
-- The deployed Worker provides public read-only catalog access.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 160),
  slug TEXT NOT NULL UNIQUE CHECK(length(slug) BETWEEN 1 AND 180),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 220),
  slug TEXT NOT NULL UNIQUE CHECK(length(slug) BETWEEN 1 AND 180),
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0 CHECK(price >= 0 AND price < 100000000),
  compare_price REAL CHECK(compare_price IS NULL OR compare_price >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(gallery) AND json_type(gallery) = 'array'),
  specifications TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(specifications) AND json_type(specifications) = 'object'),
  compatibility TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(compatibility) AND json_type(compatibility) = 'array'),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
  sku TEXT NOT NULL UNIQUE CHECK(length(sku) BETWEEN 1 AND 120),
  brand TEXT NOT NULL DEFAULT '',
  rating REAL NOT NULL DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK(reviews_count >= 0),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_autopro_category_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_autopro_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_autopro_products_featured ON products(is_featured, rating DESC);
CREATE INDEX IF NOT EXISTS idx_autopro_products_name ON products(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_autopro_products_created ON products(created_at DESC);

CREATE TABLE IF NOT EXISTS _autopro_schema_versions (
  id INTEGER PRIMARY KEY NOT NULL,
  migration TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO _autopro_schema_versions(id,migration) VALUES (1,'0001_catalog');
