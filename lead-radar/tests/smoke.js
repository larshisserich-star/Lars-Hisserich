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
    /* Feedback-Zyklus: Folgemails, Anrede, Zeitraffer */
    await p.evaluate(()=>{ document.querySelector('[data-mode="sim"]').click() }); await p.waitForTimeout(150);
    const fz=await p.evaluate(()=>{ ZR=0; compute(); const v=OB.drafts.filter(m=>m.virtuell&&["nachfass","wiedervorlage","weiterleitung"].includes(m.typ)), c=k=>v.filter(m=>k==="n1"?m.nachfass_nr===1:k==="n2"?m.nachfass_nr===2:m.typ===k).length,
      mails=v.filter(m=>m.kanal==="mail"), words=v.filter(m=>m.nachfass_nr===1).map(m=>wortzahl(m.text.replace(sig(),""))), maxNr=Math.max(0,...N.map(m=>m.nachfass_nr||0),...v.map(m=>m.nachfass_nr||0));
      const f7=v.filter(m=>m.firma_id==="f7").length, ids=v.map(m=>m.firma_id+":"+(m.nachfass_nr||m.typ)).sort().join(",");
      const gp=geplant(), f10=gp.find(g=>g.firma_id==="f10"), ref=v.find(m=>m.typ==="weiterleitung"), wv=v.find(m=>m.typ==="wiedervorlage"), n2=v.find(m=>m.nachfass_nr===2);
      const r={n1:c("n1"),n2:c("n2"),wv:c("wiedervorlage"),wl:c("weiterleitung"),f7,ids,maxNr,words,anrede:mails.every(m=>/^Sehr geehrte(r Herr| Frau) \S/.test(m.text)),gruss:mails.every(m=>m.text.includes("Liebe Grüße")&&m.text.includes("Team 3")),
        f10Plan:!!f10&&f10.faellig_am>today(),f10Due0:OB.drafts.some(m=>m.virtuell&&m.firma_id==="f10"),refTxt:ref&&/hat mich an Sie verwiesen/.test(ref.text)&&ref.person==="Frieda Sechs",wvTxt:wv&&/Sie hatten gebeten/.test(wv.text)&&!!wv.neu,n2Txt:n2&&/nicht wieder/.test(n2.text),
        test:v.every(m=>true)&&N.filter(m=>m.sim&&m.an_adresse).every(m=>/\.test$/.test(m.an_adresse))};
      ZR=7; compute(); r.f10Due7=OB.drafts.some(m=>m.virtuell&&m.firma_id==="f10"&&m.nachfass_nr===1); r.today7=today()!==realToday();
      MODE="echt"; r.todayEcht=today()===realToday(); MODE="sim"; ZR=0; compute(); return r });
    const chk=(ok,msg)=>{ if(!ok) errs.push(name+': '+msg) };
    chk(fz.n1===1&&fz.n2===1,'Nachfassen 1/2 falsch: '+fz.ids); chk(fz.f7===0,'Person mit 2 Nachfassen bekommt Entwurf'); chk(fz.wv===1,'Wiedervorlage fehlt'); chk(fz.wl===1,'Weiterleitung fehlt'); chk(fz.maxNr<=2,'nachfass_nr > 2');
    chk(fz.words.every(w=>w>=40&&w<=70),'Nachfassen 1 nicht 40-70 Wörter: '+fz.words); chk(fz.anrede,'Anrede nicht "Sehr geehrte"'); chk(fz.gruss,'Gruß/Team 3 fehlt'); chk(fz.f10Plan&&!fz.f10Due0,'Zeitraffer-Vorprüfung (Erstmail vor 1 Tag noch nicht fällig)');
    chk(fz.f10Due7,'Zeitraffer +7: Nachfassen nicht fällig'); chk(fz.today7,'Zeitraffer wirkt nicht in Simulation'); chk(fz.todayEcht,'Echt-Modus sieht Zeitraffer'); chk(fz.refTxt,'Weiterleitungstext'); chk(fz.wvTxt,'Wiedervorlagetext'); chk(fz.n2Txt,'2. Nachfassen ohne "nicht wieder"'); chk(fz.test,'Adresse nicht .test');
    /* Bilder: Postausgang-Reiter, Einstellungen und Banner mit Zeitraffer +14; danach Knopf "Zurück zur echten Zeit" */
    await p.evaluate(()=>{ ZR=14; PA.tab="geplant"; location.hash="#postausgang"; render() }); await p.waitForTimeout(150);
    chk(await p.evaluate(()=>!$("#simbar").hidden&&/Zeitraffer/.test($("#simbar").textContent)&&/Folgemails geplant/.test($("#view").textContent)&&document.querySelectorAll("#view .msg").length>=5),'Reiter Folgemails geplant / Banner fehlt');
    if(shots) await p.screenshot({path:`${out}/${name}-sim-geplant.png`,fullPage:true});
    await p.evaluate(()=>{ location.hash="#einstellungen"; render() }); await p.waitForTimeout(150); chk(await p.evaluate(()=>/Zurück zur echten Zeit/.test($("#view").textContent)),'Zeitraffer-Knöpfe fehlen');
    if(shots) await p.screenshot({path:`${out}/${name}-sim-zeitraffer.png`,fullPage:true});
    await p.evaluate(()=>{ LANG="en"; PA.tab="geplant"; location.hash="#postausgang"; render() }); await p.waitForTimeout(150); chk(await p.evaluate(()=>/Follow-ups planned/.test($("#view").textContent)&&/Time lapse/.test($("#simbar").textContent)),'EN-Umschaltung'); if(shots) await p.screenshot({path:`${out}/${name}-sim-geplant-en.png`,fullPage:true});
    await p.evaluate(()=>{ LANG="de"; render() }); await p.evaluate(()=>{ document.querySelector('#simbar [data-act="zr-aus"]').click() }); await p.waitForTimeout(200);
    chk(await p.evaluate(()=>ZR===0&&window.__store["einstellungen/zeitraffer"].tage===0&&$("#simbar").textContent.indexOf("Zeitraffer")<0),'Zurück zur echten Zeit wirkt nicht');
    await p.evaluate(()=>{ PA.tab="entwurf"; location.hash="#heute"; render() });
    const sw=await p.evaluate(()=>document.documentElement.scrollWidth); if(sw>opt.viewport.width) errs.push(`${name}: waagerechtes Scrollen (${sw}px)`);
    console.log(name,'Ansichten:',views.join(', ')); await p.close() }
  await b.close(); console.log(errs.length?'FEHLER:\n'+errs.join('\n'):'Keine Fehler.'); process.exit(errs.length?1:0) })();
