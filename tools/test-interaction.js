const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');const http=require('http');
const PORT=8096;
(async()=>{
 const srv=spawn(process.execPath,['/opt/node22/lib/node_modules/http-server/bin/http-server','/home/user/069digital','-p',String(PORT),'-s','-c-1'],{stdio:'ignore'});
 await new Promise(r=>{const p=()=>http.get(`http://127.0.0.1:${PORT}/index.html`,x=>{x.resume();r()}).on('error',()=>setTimeout(p,200));setTimeout(p,400)});
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 let fail=0;
 const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c)fail++;};

 for(const page of ['index.html','services.html','blog.html','impressum.html','404.html']){
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const p=await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/${page}`,{waitUntil:'networkidle'});
  console.log(`\n[${page} @390px]`);
  ok(errs.length===0,`no JS errors ${errs.join('|')}`);

  const toggle=await p.$('[data-menu-open]');
  ok(!!toggle,'hamburger exists');
  ok(await p.$eval('[data-menu-open]',e=>e.getAttribute('aria-expanded'))==='false','aria-expanded=false initially');
  await toggle.click(); await p.waitForTimeout(400);
  ok(await p.$eval('[data-menu]',e=>e.open),'menu opens');
  ok(await p.$eval('[data-menu-open]',e=>e.getAttribute('aria-expanded'))==='true','aria-expanded=true when open');
  // focus should be inside the dialog
  ok(await p.evaluate(()=>document.querySelector('[data-menu]').contains(document.activeElement)),'focus moved into dialog');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(!(await p.$eval('[data-menu]',e=>e.open)),'Escape closes menu');
  ok(await p.$eval('[data-menu-open]',e=>e.getAttribute('aria-expanded'))==='false','aria-expanded reset after close');
  await c.close();
 }

 // details/summary service index works without JS
 const c=await b.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});
 const p=await c.newPage();
 await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:'load'});
 console.log('\n[index.html, JavaScript DISABLED]');
 const op=await p.evaluate(()=>getComputedStyle(document.querySelector('.section-head.reveal')).opacity);
 ok(op==='1',`content visible without JS (opacity=${op})`);
 await p.click('.index__row summary'); await p.waitForTimeout(200);
 ok(await p.$eval('.index__row',e=>e.open),'service index expands without JS');
 await c.close();

 await b.close();srv.kill();
 console.log(fail?`\n${fail} FAILURES`:'\nAll interaction checks passed.');
 process.exit(fail?1:0);
})();
