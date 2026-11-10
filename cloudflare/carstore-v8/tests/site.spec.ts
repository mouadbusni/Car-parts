import {test,expect} from '@playwright/test';
const pages=['/','/catalog','/categories','/cart','/about','/product/vented-performance-rotor'];


test('header is aligned, legible and without overlapping controls from 320px to desktop',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.logo-main')).toHaveText('Auto');
  await expect(page.locator('.logo-accent')).toHaveText('Pro');
  await expect(page.locator('.header-tools .tool-link')).toHaveCount(3);
  await expect(page.locator('.header-tools a[href="/categories"]')).toHaveAttribute('aria-label','Browse product categories');
  await expect(page.locator('.header-tools a[href="/catalog"]')).toHaveAttribute('aria-label','Explore the parts catalogue');
  await expect(page.locator('.header-tools a[href="/cart"]')).toHaveAttribute('aria-label','Saved parts shortlist');
  for(const width of [1440,1100,1024,820,768,760,390,360,320]){
    await page.setViewportSize({width,height:820});
    const geometry=await page.evaluate(()=>{
      const rect=selector=>{
        const el=document.querySelector(selector);
        if(!el)throw Error('Missing '+selector);
        const b=el.getBoundingClientRect();
        return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,visible:getComputedStyle(el).display!=='none'};
      };
      return {
        logo:rect('.logo'),
        logoMain:rect('.logo-main'),logoAccent:rect('.logo-accent'),
        slogan:rect('.contact-identity'),tools:rect('.header-tools'),
        menu:rect('#menu-toggle'),
        nav:rect('.nav-strip'),
        links: Array.from(document.querySelectorAll('.nav-links a')).map(el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right};}),
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth
      };
    });
    expect(geometry.logoAccent.left,width+' logo letter collision').toBeGreaterThanOrEqual(geometry.logoMain.right-1.5);
    expect(geometry.logo.right,width+' logo/tools').toBeLessThanOrEqual(geometry.tools.left+2);
    if(geometry.slogan.visible){
      expect(geometry.logo.right,width+' logo/slogan').toBeLessThanOrEqual(geometry.slogan.left+2);
      expect(geometry.slogan.right,width+' slogan/tools').toBeLessThanOrEqual(geometry.tools.left+2);
    }
    if(geometry.menu.visible){
      expect(geometry.tools.right,width+' tools/menu').toBeLessThanOrEqual(geometry.menu.left+8);
      expect(geometry.nav.visible,width+' hidden mobile nav').toBe(false);
      expect(geometry.logo.left,width+' logo must meet left side').toBeLessThanOrEqual(18);
      expect(geometry.clientWidth-geometry.menu.right,width+' menu must meet right side').toBeLessThanOrEqual(18);
    }else{
      expect(geometry.nav.visible,width+' desktop nav').toBe(true);
      expect(geometry.logo.left,width+' logo must meet left side').toBeLessThanOrEqual(32);
      expect(geometry.clientWidth-geometry.tools.right,width+' icons must meet right side').toBeLessThanOrEqual(32);
      const left=geometry.links[0].left;
      const right=geometry.links[geometry.links.length-1].right;
      expect(Math.abs((left+right)/2-geometry.clientWidth/2),width+' lower nav must be page-centered').toBeLessThanOrEqual(2);
      if(geometry.slogan.visible){
        expect(Math.abs((geometry.slogan.left+geometry.slogan.right)/2-geometry.clientWidth/2),width+' header tagline must be page-centered').toBeLessThanOrEqual(2);
      }
    }
    expect(geometry.scrollWidth,width+' document overflow').toBeLessThanOrEqual(geometry.clientWidth+2);
  }
});
test('organized header action links lead to distinct working sections',async({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'Browse product categories'}).click();
  await expect(page).toHaveURL(/\/categories$/);
  await page.getByRole('link',{name:'Explore the parts catalogue'}).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await page.getByRole('link',{name:'Saved parts shortlist'}).click();
  await expect(page).toHaveURL(/\/cart$/);
});
test('capture header closeups at desktop and mobile layout',async({page},testInfo)=>{
  await page.goto('/');
  await page.locator('.site-header').screenshot({
    path:'cloudflare/carstore-v8/screenshots/header-'+testInfo.project.name+'.png',
    animations:'disabled'
  });
});

test('homepage follows the supplied four-panel CarStore composition',async({page,isMobile})=>{
  await page.goto('/');
  await expect(page.locator('[data-version="autopro-carstore-v8"]')).toBeVisible();
  await expect(page.locator('.logo-line')).toContainText('AutoPro');
  await expect(page.locator('.hero img')).toBeVisible();
  await expect(page.locator('.category-grid>.category-tile')).toHaveCount(4);
  await expect(page.locator('.featured-grid>.product-card')).toHaveCount(5);
  await expect(page.locator('.promo-panel')).toHaveCount(2);
  await expect(page.locator('.footer-grid>section')).toHaveCount(4);
  await expect(page.locator('.section-heading h2')).toHaveText('FEATURED PRODUCTS');
  expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(38, 38, 38)');
  if(isMobile)await expect(page.locator('#menu-toggle')).toBeVisible();
  else await expect(page.locator('.nav-strip')).toBeVisible();
});

test('category titles correspond to the correct illustrated component',async({page})=>{
  await page.goto('/');
  const expected=[['HEADLIGHTS','headlight'],['BRAKING SYSTEMS','caliper'],['ALLOY WHEELS','alloy wheel'],['SPORT SEATS','racing bucket seat']];
  const tiles=page.locator('.category-grid>.category-tile');
  for(let i=0;i<expected.length;i++){
    await expect(tiles.nth(i).locator('h2')).toHaveText(expected[i][0]);
    const img=tiles.nth(i).locator('svg[role="img"]');
    await expect(img).toHaveAttribute('aria-label',new RegExp(expected[i][1],'i'));
  }
});

test('images are local, visible and cannot load as broken placeholders',async({page,request})=>{
  await page.goto('/');
  for(const name of ['hero','brakes','wheels','lighting','drive']){
    const response=await request.get('/media/'+name+'.webp');
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeGreaterThan(25000);
  }
  await page.evaluate(async()=>{
    for(const img of Array.from(document.querySelectorAll('img'))){
      img.loading='eager';
      img.scrollIntoView({block:'center',behavior:'instant'});
      if(!img.complete)await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,7000);
      });
    }
    scrollTo({top:0,behavior:'instant'});
  });
  expect(await page.locator('img').evaluateAll(imgs=>imgs.filter(img=>!((img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>400)).map(img=>img.getAttribute('src')))).toEqual([]);
});

test('featured product save and remove updates shortlist without backend',async({page})=>{
  const api=[];
  page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))api.push(request.url());});
  await page.goto('/');
  await page.locator('.featured-grid [data-save]').first().click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await page.locator('.header-tools a[href="/cart"]').last().click();
  await expect(page.locator('.saved-grid>.product-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.saved-grid>.product-card')).toHaveCount(1);
  await page.locator('.saved-grid [data-save]').first().click();
  await expect(page.locator('.empty-state')).toBeVisible();
  expect(api).toEqual([]);
});

test('catalog category filter and search navigate correctly',async({page})=>{
  await page.goto('/');
  await page.locator('.category-grid>.category-tile').nth(1).click();
  await expect(page).toHaveURL(/category=brakes/);
  await expect(page.locator('.catalog-grid>.product-card')).toHaveCount(2);
  await page.goto('/catalog');
  await page.locator('#catalog-search').fill('forged');
  await page.getByRole('button',{name:'FILTER PARTS'}).click();
  await expect(page).toHaveURL(/search=forged/);
  await expect(page.locator('.catalog-grid>.product-card')).toHaveCount(1);
  await expect(page.locator('.catalog-grid h3')).toHaveText('Forged Alloy Wheel');
});

test('product detail links display matching part and example pricing',async({page})=>{
  await page.goto('/');
  await page.locator('.featured-grid .product-visual').first().click();
  await expect(page).toHaveURL(/\/product\/performance-led-headlight/);
  await expect(page.locator('.detail-info h1')).toHaveText('Performance LED Headlight');
  await expect(page.locator('.detail-preview svg')).toHaveAttribute('aria-label',/car headlight/i);
  await expect(page.locator('.detail-info')).toContainText('Sample price');
  await page.locator('.detail-info [data-save]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
});

test('mobile menu opens, navigation works and Escape closes it',async({page,isMobile})=>{
  await page.goto('/');
  if(isMobile){
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#main-nav')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#main-nav')).not.toHaveClass(/open/);
    await page.locator('#menu-toggle').click();
    await page.locator('#main-nav a[href="/catalog"]').click();
  }else{
    await page.locator('#main-nav a[href="/catalog"]').click();
  }
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.locator('.catalog-grid>.product-card')).toHaveCount(6);
});

test('newsletter is explicitly local and never submits email',async({page})=>{
  await page.goto('/');
  await page.locator('#newsletter-email').fill('fake@example.test');
  await page.locator('#newsletter-form button').click();
  await expect(page.locator('#toast')).toContainText('No email was sent');
  await expect(page.locator('#newsletter-email')).toHaveValue('');
});

test('all views fit within desktop and mobile widths',async({page})=>{
  for(const path of pages){
    await page.goto(path);
    await expect(page.locator('#main')).toBeVisible();
    const bounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    expect(bounds.width,path).toBeLessThanOrEqual(bounds.view+2);
  }
});

test('frontend-only deployment rejects backend, admin and writes',async({request})=>{
  for(const path of ['/api/products','/api/health','/login','/admin','/checkout']){
    expect((await request.get(path)).status(),path).toBe(404);
  }
  expect((await request.post('/api/products',{data:{fake:true}})).status()).toBe(405);
});

test('capture actual full-page screenshot of screenshot-inspired site',async({page},testInfo)=>{
  await page.goto('/');
  await page.evaluate(async()=>{
    for(const img of Array.from(document.querySelectorAll('img'))){
      img.loading='eager';
      if(!img.complete)await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,7000);
      });
    }
    window.scrollTo({top:0,behavior:'instant'});
  });
  await page.screenshot({path:'cloudflare/carstore-v8/screenshots/'+testInfo.project.name+'.jpg',type:'jpeg',quality:88,fullPage:true,animations:'disabled'});
});