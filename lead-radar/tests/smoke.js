/* Rauchtest ohne echte Daten: node lead-radar/tests/smoke.js [--shots]
   Lädt index.html mit einer Schein-Datenbank (tests/seed.js), öffnet jede Ansicht in beiden Modi
   (Echt und Simulation), meldet JavaScript-Fehler. Mit --shots: Bildschirmfotos nach lead-radar/tests/out/. */
const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
const SEED=fs.readFileSync(path.join(__dirname,'seed.js'),'utf8'), shots=process.argv.includes('--shots'), out=path.join(__dirname,'out');
if(shots) fs.mkdirSync(out,{recursive:true});
const mock=`(()=>{const store=(${SEED})(); window.__store=store;
 const coll=n=>({get:async()=>({docs:Object.entries(store).filter(([k])=>k.startsWith(n+'/')&&k.split('/').length===2).map(([k,v])=>({id:k.split('/')[1],data:()=>JSON.parse(JSON.stringify(v))}))})});
 const doc=p=>({get:async()=>({exists:p in store,data:()=>JSON.parse(JSON.stringify(store[p]))}),set:async d=>{store[p]=JSON.parse(JSON.stringify(d))},delete:async()=>{delete store[p]}});
 window.claude={use:async n=>n==='db'?{collection:coll,doc}:n==='user'?{can:async()=>true}:n==='sample'?Object.assign(async()=>({text:''}),{json:async(p,o)=>{(window.__models=window.__models||[]).push(o&&o.model);return {aufhaenger:"x",angebote:["talent"],betreff:"B",text:"KI-Text"}}}):null};
 try{localStorage.setItem('jlu-ich','Lars');localStorage.setItem('lr-lang','de')}catch(e){}})()`;
(async()=>{ const b=await chromium.launch(), errs=[];
  for(const [name,opt] of [['desk',{viewport:{width:1440,height:900}}],['phone',{viewport:{width:390,height:844}}]]){
    const p=await b.newPage(opt); p.on('pageerror',e=>errs.push(name+': '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(name+' console: '+m.text()) });
    await p.addInitScript(mock); await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(500);
    const views=await p.$$eval('.nav a[data-v]',a=>a.map(x=>x.dataset.v));
    for(const mode of ['echt','sim']){
      await p.evaluate(m=>{ const b=document.querySelector(`[data-mode="${m}"]`); if(b) b.click() },mode); await p.waitForTimeout(150);
      for(const v of views){ await p.evaluate(v=>{location.hash='#'+v},v); await p.waitForTimeout(120); if(shots) await p.screenshot({path:`${out}/${name}-${mode}-${v}.png`,fullPage:true}) } }
    const sw=await p.evaluate(()=>document.documentElement.scrollWidth); if(sw>opt.viewport.width) errs.push(`${name}: waagerechtes Scrollen (${sw}px)`);
    console.log(name,'Ansichten:',views.join(', ')); await p.close() }
  await b.close(); console.log(errs.length?'FEHLER:\n'+errs.join('\n'):'Keine Fehler.'); process.exit(errs.length?1:0) })();
