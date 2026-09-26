const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8765';
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.locator('#pe-starter').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 await page.screenshot({path:path.join(__dirname,'qa-starter.png')});
 await page.locator('[data-starter-pet=cat]').click();await page.locator('[data-starter-list] input').first().check();
 console.log('checklist',await page.locator('[data-starter-status]').innerText());
 await page.reload({waitUntil:'networkidle'});await page.locator('[data-starter-pet=cat]').click();
 console.log('persisted',await page.locator('[data-starter-list] input').first().isChecked());
 await page.locator('[data-starter-reset]').click();
 await page.locator('#pe-journal').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:path.join(__dirname,'qa-journal.png')});
 console.log('main',await page.evaluate(()=>({counts:[...document.querySelectorAll('.pe-products')].map(s=>s.querySelectorAll('.prdList>li').length),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.getAttribute('src')).map(i=>i.getAttribute('src')),overflow:document.documentElement.scrollWidth>innerWidth})));
 await page.goto(base+'/product/list.html?cate_no=27',{waitUntil:'networkidle'});
 await page.locator('#stSaleCoupon').scrollIntoViewIfNeeded();await page.waitForTimeout(3500);await page.screenshot({path:path.join(__dirname,'qa-coupons.png')});
 console.log('coupons',await page.locator('.sl-cp__art').count());
 await page.goto(base+'/product/search.html',{waitUntil:'networkidle'});await page.screenshot({path:path.join(__dirname,'qa-search.png')});
 await page.goto(base+'/board/product/list.html?board_no=4',{waitUntil:'networkidle'});await page.screenshot({path:path.join(__dirname,'qa-board.png')});
 await page.setViewportSize({width:390,height:844});
 for(const [route,file,selector] of [['/','qa-mobile-starter.png','#pe-starter'],['/','qa-mobile-journal.png','#pe-journal'],['/product/list.html?cate_no=27','qa-mobile-coupons.png','#stSaleCoupon'],['/product/search.html','qa-mobile-search.png','.pet-page-hero'],['/pet/guide.html','qa-mobile-guide.png','.pet-guide']]){
   await page.goto(base+route,{waitUntil:'networkidle'});await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(__dirname,file)});console.log(route,'overflow',await page.evaluate(()=>({w:innerWidth,doc:document.documentElement.scrollWidth})));
 }
 console.log('pageerrors',JSON.stringify(errors));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
