/* events.js – Klicks und Eingaben, Laden der Daten, Start. */
/* ---------- Ereignisse ---------- */
document.addEventListener("input",e=>{ const t=e.target;
  if(t.id==="zf-q"){ ZF.q=t.value; return render() } if(t.id==="pa-q"){ PA.q=t.value; return render() }
  if(t.dataset.mt){ (EDIT[t.dataset.mt]=EDIT[t.dataset.mt]||{})[t.dataset.fld]=t.value } });
document.addEventListener("change",async e=>{ const t=e.target;
  if(t.id==="pa-e"){ PA.e=t.value; return render() } if(t.id==="zf-f"){ ZF.f=t.value; return render() } if(t.id==="zf-s"){ ZF.s=t.value; return render() }
  if(t.dataset.task){ const x=T.find(y=>y.id===t.dataset.task); if(!x) return; x.erledigt=t.checked; if(t.checked) x.erledigt_am=today(); if(await put("aufgaben/"+x.id,x)) toast(t.checked?L("Aufgabe erledigt","Task done"):L("Aufgabe wieder offen","Task reopened")); return render() }
  const f=t.dataset.id&&F.find(x=>x.id===t.dataset.id); if(!f) return;
  if(t.dataset.ch==="kstat"){ setK(f,t.dataset.pk,t.value); return saveF(f,L("Stand gespeichert","Status saved")) }
  if(t.dataset.ch==="stufe"){ f.stufe=t.value; return saveF(f,L("Stand gespeichert","Stage saved")) }
  if(t.dataset.ch==="status"){ const st=t.value, name=(STATUS().find(s=>s[0]===st)||[0,st])[1]; f.status=st; f.status_seit=today(); delete f.wiedervorlage; delete f.status_grund;
    if(st==="wv") f.wiedervorlage=plus(30); if(st==="kontakt"&&!f.stufe) f.stufe="Angesprochen"; if(st==="shortlist") await request(f);
    (f.updates=f.updates||[]).push({id:uid("u"),datum:today(),wer:ICH||"",kanal:"Notiz",text:"Status: "+(STATUS().find(s=>s[0]===st)||[0,st])[1]}); return saveF(f,f.name+": "+name) } });
document.addEventListener("click",async e=>{
  const lg=e.target.closest("[data-lang]"); if(lg){ LANG=lg.dataset.lang; try{ localStorage.setItem("lr-lang",LANG) }catch(x){} if(DLG&&$("#dlg").open) $("#dlg-c").innerHTML=dlgHtml(); return render() }
  const md=e.target.closest("[data-mode]"); if(md){ MODE=md.dataset.mode==="sim"?"sim":"echt"; try{ localStorage.setItem("lr-mode",MODE) }catch(x){} RESET_ARM=0; if(DLG&&$("#dlg").open) $("#dlg").close(); return render() }
  const dbf=e.target.closest("[data-dbf]"); if(dbf){ DB.f=dbf.dataset.dbf; return render() }
  const c=e.target.closest("[data-close]"); if(c){ $("#dlg").close(); return }
  const pa=e.target.closest("[data-pa]"); if(pa){ PA.tab=pa.dataset.pa; if(pa.hasAttribute("data-closedlg")||$("#dlg").open) $("#dlg").close(); if(VIEW==="postausgang") render(); return }
  const b=e.target.closest("[data-act]");
  if(!b&&!e.target.closest("a,input,select,textarea,summary,label")){ const pf=e.target.closest("[data-firma],[data-person]"); if(pf){ if(pf.dataset.person){ const [id,key]=pf.dataset.person.split("|"); return openDlg({t:"person",id,key}) } return openDlg({t:"firma",id:pf.dataset.firma}) } }
  if(!b) return; const act=b.dataset.act, f=b.dataset.id?F.find(x=>x.id===b.dataset.id):null, mid=b.dataset.mid, m=mid?findMsg(mid):null;
  if(act==="ich") return openDlg({t:"ich"});
  if(act==="ich-ok"){ const n=$("#i-name").value.trim().slice(0,60); if(!n) return; ICH=n; try{ localStorage.setItem("jlu-ich",n) }catch(x){} if(!TEAM.includes(n)){ TEAM.push(n); await put("einstellungen/team",{namen:TEAM}) } $("#dlg").close(); return render() }
  if(act==="neu") return openDlg({t:"neu"});
  if(act==="neu-save"){ const name=$("#n-name").value.trim(), qu=$("#n-q").value.trim(), web=$("#n-web").value.trim(), msg=t=>{$("#n-msg").textContent=t};
    if(!name) return msg(L("Bitte den Namen eintragen.","Please enter the name.")); if(F.some(x=>fKey(x.name)===fKey(name))) return msg(L("Diese Firma steht schon in der Liste.","This company is already listed.")); if((qu&&!safeUrl(qu))||(web&&!safeUrl(web))) return msg(L("Adressen müssen mit https:// beginnen.","Addresses must start with https://"));
    const reg=$("#n-region").value, x={id:uid("f"),name,ort:$("#n-ort").value.trim(),region:reg,branche:$("#n-branche").value,website:web,status:"ziel",importiert:true,import_am:today(),import_von:ICH||"",angelegt:today(),angelegt_von:ICH||"",
      quellen:qu?[{claim:"Von Hand eingetragen",url:qu,verified:false,staerke:"schwach"}]:[],noten:{fit:3,region:reg==="Mittelhessen"?5:4,size:3,evidence:1,timing:2},ansprechpartner:[],updates:[],angebote:[]};
    FR.push(x); $("#dlg").close(); return saveF(x,L("Eingetragen. Der nächste Suchlauf prüft die Firma.","Added. The next search run checks the company.")) }
  if(act==="np-add"&&f){ const name=$("#np-n").value.trim(), li=$("#np-l").value.trim(); if(!name) return toast(L("Bitte den Namen eintragen.","Please enter the name.")); if(li&&!/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(li)) return toast(L("Das LinkedIn-Profil muss mit https://www.linkedin.com/ beginnen.","The LinkedIn profile must start with https://www.linkedin.com/"));
    (f.ansprechpartner=f.ansprechpartner||[]).push({name,funktion:$("#np-f").value.trim(),bereich:$("#np-b").value,linkedin:li,eigen:true,stand:today()}); return saveF(f,L("Person eingetragen","Person added")) }
  if(act==="mk-draft"&&f){ const p=(f.ansprechpartner||[]).find(x=>pk(x)===b.dataset.pk); if(!p) return; DLG.virt=virtDraft(f,p); return render() }
  if(act==="req"&&f){ await request(f); return render() }
  if(act==="t-add"&&f){ const t=$("#p-t").value.trim(); if(!t) return toast(L("Bitte die Aufgabe eintragen.","Please enter the task.")); await addTask({titel:t,owner:$("#p-o").value,faellig:$("#p-d").value,firma_id:f.id}); toast(L("Aufgabe angelegt","Task added")); return render() }
  if(act==="u-add"&&f){ const t=$("#p-n").value.trim(); if(!t) return; (f.updates=f.updates||[]).push({id:uid("u"),datum:today(),wer:ICH||"",kanal:"Notiz",text:t}); return saveF(f,L("Notiz gespeichert","Note saved")) }
  if((act==="wr-ok"||act==="wr-skip")&&f){ const n=($("#wr-n")||{}).value||"", t=(($("#wr-t")||{}).value||"").trim();
    if(act==="wr-ok"&&n.trim()) (f.updates=f.updates||[]).push({id:uid("u"),datum:today(),wer:ICH||"",kanal:"Notiz",text:"Wochenrunde: "+n.trim()});
    if(act==="wr-ok"&&t) await addTask({titel:t,owner:ICH||"",faellig:plus(7),firma_id:f.id,quelle:"Wochenrunde"});
    f.runde_kw=isoWeek(); f.runde_am=today(); f.runde_wer=ICH||""; return saveF(f,act==="wr-ok"?f.name+L(" durchgesehen"," reviewed"):f.name+L(" ausgelassen"," skipped")) }
  const done=()=>{ if(DLG&&DLG.virt&&m&&m.id===DLG.virt.id) DLG.virt=null; delete EDIT[mid]; render() };
  if(act==="approve"&&m){ if(await saveN(msgDoc(m,"freigegeben",{freigegeben_am:today(),freigegeben_von:ICH||""}))){ done(); toast(L("Freigegeben. Jetzt öffnen und selbst senden.","Approved. Now open it and send it yourself.")) } return }
  if(act==="discard"&&m){ if(await saveN(msgDoc(m,"verworfen"))){ done(); toast(L("Verworfen","Discarded")) } return }
  if(act==="back"&&m){ if(await saveN(msgDoc(m,"entwurf",{freigegeben_am:"",freigegeben_von:""}))) done(); return }
  if(act==="sent"&&m) return markSent(m);
  if(act==="reply"&&m) return markReply(m);
  if(act==="ki"&&m) return kiEntwurf(b,mid);
  if(act==="copy"&&m){ const v=cur(m); try{ await navigator.clipboard.writeText((m.kanal==="mail"&&v.betreff?v.betreff+"\n\n":"")+v.text); toast(L("Kopiert","Copied")) }catch(x){ toast(L("Kopieren nicht möglich, bitte den Text markieren.","Copy failed, please select the text.")) } return }
  if(act==="pause"){ A={...A,pausiert:!A.pausiert}; if(await put("einstellungen/automatik",A)) toast(A.pausiert?L("Suchlauf pausiert","Search run paused"):L("Suchlauf läuft wieder","Search run resumed")); return render() }
  if(act==="a-save"){ const g=k=>document.getElementById("a-"+k), nv=k=>{ const x=g(k).value; return x===""?NaN:+x };
    A=aClean({...A,neue_firmen_pro_tag:nv("neue_firmen_pro_tag"),tiefen_pro_tag:nv("tiefen_pro_tag"),shortlist_modus:g("shortlist_modus").value,shortlist_schwelle:nv("shortlist_schwelle"),nachfassen_tage:nv("nachfassen_tage"),entwurf_sprache:g("entwurf_sprache").value,ki_entwuerfe:g("ki_entwuerfe").checked});
    if(await put("einstellungen/automatik",A)) toast(L("Für alle gespeichert","Saved for everyone")); return render() }
  if(act==="sl-save"){ const g=k=>document.getElementById("a-"+k), nv=k=>{ const x=g(k).value; return x===""?NaN:+x };
    A=aClean({...A,sim_aktiv:g("sim_aktiv").checked,sim_tageslimit:nv("sim_tageslimit"),sim_training_pro_lauf:nv("sim_training_pro_lauf"),ab_test:g("ab_test").checked,lernen_in_rangliste:g("lernen_in_rangliste").checked});
    if(await put("einstellungen/automatik",A)) toast(L("Für alle gespeichert","Saved for everyone")); return render() }
  if(act==="sim-reset"){ if(RESET_ARM&&Date.now()-RESET_ARM<6000){ RESET_ARM=0; return simReset() } RESET_ARM=Date.now(); setTimeout(()=>{ if(RESET_ARM&&Date.now()-RESET_ARM>=6000){ RESET_ARM=0; render() } },6100); return render() }
  if(act==="team-add"){ const n=$("#team-n").value.trim(); if(!n||TEAM.includes(n)) return; TEAM.push(n); if(await put("einstellungen/team",{namen:TEAM})) toast(L("Team gespeichert","Team saved")); return render() }
  if(act==="team-del"){ TEAM=TEAM.filter(x=>x!==b.dataset.n); if(await put("einstellungen/team",{namen:TEAM})) toast(L("Team gespeichert","Team saved")); return render() } });
document.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.id==="i-name"){ e.preventDefault(); document.querySelector("[data-act=ich-ok]").click(); return }
  if(e.key==="Enter"&&e.target.matches&&e.target.matches("tr[data-firma],tr[data-person]")){ e.preventDefault(); e.target.click() } });
$("#dlg").addEventListener("close",()=>{ DLG=null });
$("#dlg").addEventListener("cancel",e=>{ if(DLG&&DLG.t==="ich"&&!ICH) e.preventDefault() });

/* ---------- Laden ---------- */
async function load(){ const g=n=>db.collection(n).get(), g0=n=>g(n).catch(()=>({docs:[]})), [fs,ts,ds,qs,ls,ns,tm,au,pr,tr,le]=await Promise.all([g("firmen"),g("aufgaben"),g("dossier"),g("auftraege"),g("lauf"),g("nachrichten"),db.doc("einstellungen/team").get(),db.doc("einstellungen/automatik").get(),g0("protokoll"),g0("training"),db.doc("lernen/stand").get().catch(()=>({exists:false}))]);
  PROT=pr.docs.map(d=>({...d.data(),id:d.id})); TRN=tr.docs.map(d=>({...d.data(),id:d.id})); LS=le.exists?(le.data()||{}):{}; lernReset();
  FR=fs.docs.map(d=>({status:"ziel",...d.data(),id:d.id})).filter(f=>f.name); TK=ts.docs.map(d=>({...d.data(),id:d.id})); D={}; ds.docs.forEach(d=>{D[d.id]=d.data()}); Q={}; qs.docs.forEach(d=>{Q[d.id]={...d.data(),firma_id:d.id}});
  LR=ls.docs.map(d=>d.data()); NR=ns.docs.map(d=>({...d.data(),id:d.id})); TEAM=tm.exists?[...((tm.data()||{}).namen||[])]:[]; A=aClean(au.exists?au.data():{}); loaded=true }
async function start(){ addEventListener("hashchange",route); route(); if(!ICH) setTimeout(()=>{ if(!$("#dlg").open) openDlg({t:"ich"}) },400);
  const fail=(de,en)=>{ render.msg=()=>L(de,en); render() }, timer=setTimeout(()=>{ if(!loaded) fail("Die Daten lassen auf sich warten. Bitte die Seite angemeldet in claude.ai öffnen.","The data is taking a while. Please open the page signed in at claude.ai.") },10000);
  try{ db=await window.claude?.use?.("db") }catch(e){ db=null } if(!db){ clearTimeout(timer); return fail("Die Daten sind in dieser Ansicht nicht verfügbar. Bitte die Seite angemeldet in claude.ai öffnen.","The data is not available in this view. Please open the page signed in at claude.ai.") }
  try{ const u=await window.claude.use("user"); if(u&&await u.can("data.write")===false){ canWrite=false; roShow() } }catch(e){}
  window.claude.use("sample").then(s=>{ sample=s||null; if(loaded) render() }).catch(()=>{});
  try{ await load(); clearTimeout(timer); if(ICH&&!TEAM.includes(ICH)&&canWrite){ TEAM.push(ICH); await put("einstellungen/team",{namen:TEAM}) } render() }catch(e){ clearTimeout(timer); fail("Die Daten konnten nicht geladen werden. Bitte die Seite neu laden.","The data could not be loaded. Please reload the page.") } }
start();
