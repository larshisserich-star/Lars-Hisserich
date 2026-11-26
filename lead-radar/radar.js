/* radar.js – Dashboard-Einstieg: interaktives Radar.
   Jede Firma ist ein Punkt. Ring = Stand im Funnel (innen = weiter), Sektor = Region, Größe = Punktzahl.
   Fahren/Tippen zeigt die Firma, Klick öffnet das Profil, Filter blenden aus, „Rundgang“ spielt das Protokoll nacheinander ab. */
const HR={f:"alle",timer:null,step:-1};
const RD={R:[232,186,140,94,52],ARCH:280,LBL:308,SPAN:48};
const RD_STAGE=()=>[L("Longlist","Longlist"),"Shortlist",L("Angeschrieben","Contacted"),L("Antwort","Reply"),L("Gespräch","Conversation")];
const rdReduce=()=>{ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches }catch(e){ return false } };
function heroStage(f){ const st=f.status||"ziel", ks=Object.values(f.kontakte||{}).map(k=>k.status);
  const sent=N.some(m=>m.firma_id===f.id&&m.richtung!=="ein"&&["versendet","antwort"].includes(m.status));
  const replied=N.some(m=>m.firma_id===f.id&&(m.status==="antwort"||m.status==="eingang"))||ks.includes("Antwort erhalten");
  const talk=(f.termine||[]).length>0||ks.includes("Gespräch vereinbart")||["Im Gespräch","Angebot besprochen","Zusage"].includes(f.stufe);
  return talk?4:replied?3:(sent||st==="kontakt")?2:st==="shortlist"?1:0 }
function heroItems(){ const neu=new Set(signale().filter(x=>x.f).map(x=>x.f.id)), out=[];
  F.forEach(f=>{ const st=f.status||"ziel"; if(f._out||st==="partner"||st==="nein") return;
    if(!(isLong(f)||["shortlist","kontakt","wv","abgelehnt"].includes(st))) return;
    const stage=heroStage(f), abs=st==="abgelehnt", wv=st==="wv", term=(f.termine||[]).length>0;
    out.push({f,stage,abs,wv,term,kind:abs?"abs":wv?"wv":term?"term":"firma",neu:neu.has(f.id),reg:Math.max(0,REGIONEN.indexOf(f.region))}) });
  const grp={}; out.forEach(o=>{ const k=o.reg+"|"+(o.abs?"a":o.stage); (grp[k]=grp[k]||[]).push(o) });
  Object.values(grp).forEach(a=>{ a.sort((x,y)=>x.f.name.localeCompare(y.f.name,"de")); a.forEach((o,j)=>{ const a0=-90+o.reg*72+(72-RD.SPAN)/2, th=(a0+(j+.5)/a.length*RD.SPAN)*Math.PI/180, r=o.abs?RD.ARCH:RD.R[o.stage];
    o.x=Math.round(r*Math.cos(th)*10)/10; o.y=Math.round(r*Math.sin(th)*10)/10 }) });
  return out }
function rdShape(o){ const r=Math.max(7,Math.min(13,7+((o.f._score||3)-3)*3)), c=["#8a8a8a","#d6d6d6","#ffffff","#8fbbe8","#8fbbe8"][o.stage];
  if(o.kind==="abs") return `<circle class="rd-sh" r="${r+2}" fill="none" stroke="#b8b8b8" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M${-r*.6} ${-r*.6}L${r*.6} ${r*.6}M${r*.6} ${-r*.6}L${-r*.6} ${r*.6}" stroke="#b8b8b8" stroke-width="2" stroke-linecap="round"/>`;
  if(o.kind==="wv") return `<circle class="rd-sh" r="${r+1}" fill="#212121" stroke="#f0a35e" stroke-width="2.4"/><path d="M0 ${-r*.55}V0L${r*.4} ${r*.25}" fill="none" stroke="#f0a35e" stroke-width="1.8" stroke-linecap="round"/>`;
  if(o.kind==="term") return `<path class="rd-sh" d="M0 ${-r-3}L${r+3} 0L0 ${r+3}L${-r-3} 0Z" fill="${c}" stroke="#ffffff" stroke-width="1.6"/>`;
  return `<circle class="rd-sh" r="${r}" fill="${c}" stroke="#212121" stroke-width="1.5"/>` }
function heroSvg(items){ const red=rdReduce(), st=RD_STAGE(), reg=REGIONEN.map(x=>lbl(x));
  const rings=RD.R.map((r,i)=>`<circle r="${r}" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="${i?"2 5":"none"}"/><g class="rd-bd" transform="translate(0 ${-r})"><circle r="8" fill="#1d232b" stroke="#8fbbe8" stroke-width="1.2"/><text y="4" text-anchor="middle">${i+1}</text></g>`).join("")
    +`<circle r="${RD.ARCH}" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="1 6"/><g class="rd-bd" transform="translate(0 ${-RD.ARCH})"><circle r="8" fill="#1d232b" stroke="#b8b8b8" stroke-width="1.2"/><text y="4" text-anchor="middle">A</text></g>`;
  const wedge=REGIONEN.map((_,i)=>{ const a0=(-90+i*72)*Math.PI/180, a1=(-90+(i+1)*72)*Math.PI/180, R=RD.ARCH+14; return i%2?"":`<path d="M0 0L${R*Math.cos(a0)} ${R*Math.sin(a0)}A${R} ${R} 0 0 1 ${R*Math.cos(a1)} ${R*Math.sin(a1)}Z" fill="#ffffff" opacity=".035"/>` }).join("");
  const secs=REGIONEN.map((_,i)=>{ const a=(-90+i*72)*Math.PI/180, m=(-90+i*72+36)*Math.PI/180; return `<line x1="0" y1="0" x2="${(RD.ARCH+10)*Math.cos(a)}" y2="${(RD.ARCH+10)*Math.sin(a)}" stroke="#303030" stroke-width="1"/><text class="rd-rg" x="${RD.LBL*Math.cos(m)}" y="${RD.LBL*Math.sin(m)+4}" text-anchor="middle">${esc(reg[i])}</text>` }).join("");
  const sweep=red?"":`<g><path d="M0 0L0 ${-RD.ARCH}A${RD.ARCH} ${RD.ARCH} 0 0 1 ${RD.ARCH*Math.sin(.55)} ${-RD.ARCH*Math.cos(.55)}Z" fill="url(#rdg)" opacity=".55"/><line x1="0" y1="0" x2="0" y2="${-RD.ARCH}" stroke="#8fbbe8" stroke-width="1.5" opacity=".8"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="16s" repeatCount="indefinite"/></g>`;
  const dots=items.map(o=>{ const f=o.f, nm=`${f.name}, ${RD_STAGE()[o.stage]}${o.abs?", "+L("Absage","declined"):o.wv?", "+L("Wiedervorlage","resubmission"):""}, ${pkt(f._score)} ${L("Punkte","points")}`;
    const pulse=o.neu&&!red?`<circle r="8" fill="none" stroke="#f0a35e" stroke-width="2"><animate attributeName="r" values="9;21;9" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="2.6s" repeatCount="indefinite"/></circle>`:(o.neu?`<circle r="14" fill="none" stroke="#f0a35e" stroke-width="2" stroke-dasharray="2 3"/>`:"");
    return `<g class="rd-dot" data-firma="${esc(f.id)}" data-stage="${o.stage}" data-new="${o.neu?1:0}" data-talk="${o.stage>=3||o.term?1:0}" data-reg="${esc(f.region||"")}" tabindex="0" role="button" aria-label="${esc(nm)}" transform="translate(${o.x} ${o.y})">${pulse}${rdShape(o)}</g>` }).join("");
  return `<svg class="rd-svg" viewBox="-350 -350 700 700" role="group" aria-label="${esc(L("Radar der Firmen nach Stand im Funnel","Radar of companies by funnel stage"))}"><defs><filter id="rdgl" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#8fbbe8" flood-opacity=".45"/></filter><radialGradient id="rdbg" cx="0" cy="0" r="${RD.ARCH+20}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2a3442"/><stop offset="1" stop-color="#1a1a1a"/></radialGradient><radialGradient id="rdg" cx="0" cy="0" r="${RD.ARCH}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8fbbe8" stop-opacity="0"/><stop offset="1" stop-color="#8fbbe8" stop-opacity=".5"/></radialGradient></defs><circle r="${RD.ARCH+14}" fill="url(#rdbg)" stroke="#3a3a3a"/>${wedge}${secs}${rings}${sweep}<g filter="url(#rdgl)">${dots}</g></svg>` }
const HF=()=>[["alle",L("Alle","All")],["talk",L("Gespräche und Termine","Conversations and appointments")],["neu",L("Neue Signale","New signals")],["mh",L("Mittelhessen","Central Hesse")]];
function heroHtml(){ const items=heroItems(), n=items.length, c=k=>items.filter(o=>k(o)).length;
  const rl=RD_STAGE().map((x,i)=>`<li><span class="rd-n">${i+1}</span> ${esc(x)}</li>`).join("")+`<li><span class="rd-n rd-na">A</span> ${esc(L("Absage / Wiedervorlage (äußerer Ring)","Declined / resubmission (outer ring)"))}</li>`;
  const legend=`<p class="small muted" style="margin:16px 0 4px">${L("Ringe, von außen nach innen","Rings, outside to inside")}</p><ul class="rd-leg rd-rings" style="margin-top:0;padding-top:0;border:0">${rl}</ul><ul class="rd-leg" aria-label="${L("Legende","Legend")}"><li><span aria-hidden="true">●</span> ${L("Firma, Größe = Punktzahl","Company, size = score")}</li><li><span aria-hidden="true">◆</span> ${L("Termin vereinbart","Appointment set")}</li><li><span aria-hidden="true">◷</span> ${L("Wiedervorlage","Resubmission")}</li><li><span aria-hidden="true">✕</span> ${L("Absage","Declined")}</li><li><span aria-hidden="true">◌</span> ${L("pulsiert = neues Signal","pulsing = new signal")}</li></ul>`;
  return `<div class="tafel rd"><div class="thead"><h2>Radar</h2><p>${L("Jede Firma ist ein Punkt. Je weiter innen, desto weiter im Funnel. Über einen Punkt fahren oder tippen zeigt die Firma, ein Klick öffnet sie.","Every company is a dot. The further in, the further along the funnel. Hover or tap a dot to see the company, click to open it.")}</p></div>
  <div class="tbody rd-body"><div class="rd-svgw" id="rd-svgw">${n?heroSvg(items):`<p class="empty" style="color:#b8b8b8;padding:40px">${L("Noch keine Firmen im Radar.","No companies in the radar yet.")}</p>`}</div>
  <div class="rd-side"><div class="seg" role="group" aria-label="${L("Radar filtern","Filter radar")}">${HF().map(([k,l])=>`<button type="button" data-hf="${k}" aria-pressed="${k===HR.f}">${esc(l)}</button>`).join("")}</div>
    <div id="rd-info" class="rd-info" aria-live="polite"></div>
    <div class="row" style="margin-top:12px"><button type="button" class="btn sm pri" id="rd-play" data-rdplay>${I.clock}${L("Rundgang abspielen","Play tour")}</button><span class="small muted" id="rd-prog"></span></div>
    ${legend}<p class="small muted" id="rd-sum" hidden>${L(`${n} Firmen im Radar: ${c(o=>o.stage===0)} Longlist, ${c(o=>o.stage===1)} Shortlist, ${c(o=>o.stage===2)} angeschrieben, ${c(o=>o.stage===3)} mit Antwort, ${c(o=>o.stage===4)} im Gespräch.`,`${n} companies in the radar: ${c(o=>o.stage===0)} longlist, ${c(o=>o.stage===1)} shortlist, ${c(o=>o.stage===2)} contacted, ${c(o=>o.stage===3)} replied, ${c(o=>o.stage===4)} in conversation.`)}</p></div></div></div>` }
function heroDefault(){ const s=$("#rd-sum"); return `<p class="small" style="margin:0">${s?s.textContent:""}</p><p class="small muted" style="margin:6px 0 0">${L("Tipp: „Rundgang abspielen“ zeigt Schritt für Schritt, was der Radar entschieden hat.","Tip: “Play tour” shows step by step what the radar decided.")}</p>` }
function heroInfo(id,ev){ const el=$("#rd-info"); if(!el) return; const f=F.find(x=>x.id===id); if(!f){ el.innerHTML=heroDefault(); return }
  const pr=ev||PROT.filter(x=>x.firma_id===id&&!!x.sim===(MODE==="sim")).sort((a,b)=>String(b.zeit||b.datum||"").localeCompare(String(a.zeit||a.datum||"")))[0], pt=x=>`${esc(fmtD(x.datum||String(x.zeit||"").slice(0,10)))}${x.zeit&&String(x.zeit).length>=16?" "+esc(String(x.zeit).slice(11,16)):""}`;
  el.innerHTML=`<div class="rd-card"><b>${esc(f.name)}</b><div class="small muted">${esc(meta(f))}</div><div class="row" style="margin:8px 0 6px">${standChip(f)}<span class="chip">${pkt(f._score)} ${L("Punkte","points")}${f._zus?` (${sgn(f._zus)} ${L("gelernt","learned")})`:""}</span></div>
    ${pr?`<p class="small" style="margin:0"><b>${pt(pr)}${ev?"":" · "+L("zuletzt","latest")}:</b> ${esc(tx(pr,"text"))}</p>${pr.warum?`<p class="small muted" style="margin:4px 0 0">${L("Warum","Why")}: ${esc(String(tx(pr,"warum")).slice(0,240))}${String(tx(pr,"warum")).length>240?" …":""}</p>`:""}`:`<p class="small muted" style="margin:0">${L("Noch kein Protokolleintrag.","No log entry yet.")}</p>`}
    <div style="margin-top:8px"><button type="button" class="btn sm" data-firma="${esc(f.id)}">${L("Profil öffnen","Open profile")}</button></div></div>` }
function heroApplyFilter(){ document.querySelectorAll("#rd-svgw .rd-dot").forEach(d=>{ const k=HR.f, ok=k==="alle"||(k==="talk"&&d.dataset.talk==="1")||(k==="neu"&&d.dataset.new==="1")||(k==="mh"&&d.dataset.reg==="Mittelhessen"); d.classList.toggle("rd-dim",!ok) });
  document.querySelectorAll("[data-hf]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.hf===HR.f))) }
function heroStop(){ if(HR.timer){ clearTimeout(HR.timer); HR.timer=null } HR.step=-1; document.querySelectorAll("#rd-svgw .rd-hi").forEach(d=>d.classList.remove("rd-hi")); const sv=$("#rd-svgw .rd-svg"); if(sv) sv.classList.remove("rd-tour");
  const b=$("#rd-play"); if(b) b.innerHTML=I.clock+L("Rundgang abspielen","Play tour"); const p=$("#rd-prog"); if(p) p.textContent="" }
function heroTour(){ if(HR.timer){ heroStop(); heroInfo(null); return }
  const ids=new Set(F.map(f=>f.id)), steps=PROT.filter(x=>x.firma_id&&ids.has(x.firma_id)&&!!x.sim===(MODE==="sim")&&x.art!=="training").sort((a,b)=>String(a.zeit||a.datum||"").localeCompare(String(b.zeit||b.datum||""))).slice(-30);
  if(!steps.length){ const el=$("#rd-info"); if(el) el.innerHTML=`<p class="small muted">${L("Noch keine Protokolleinträge für einen Rundgang.","No log entries for a tour yet.")}</p>`; return }
  HR.f="alle"; heroApplyFilter(); const sv=$("#rd-svgw .rd-svg"); if(sv) sv.classList.add("rd-tour"); const b=$("#rd-play"); b.innerHTML=I.x+L("Rundgang stoppen","Stop tour");
  const go=i=>{ if(!$("#rd-svgw")){ heroStop(); return } if(i>=steps.length){ heroStop(); heroInfo(null); return } HR.step=i; const x=steps[i];
    document.querySelectorAll("#rd-svgw .rd-hi").forEach(d=>d.classList.remove("rd-hi")); const d=document.querySelector(`#rd-svgw .rd-dot[data-firma="${CSS.escape(x.firma_id)}"]`); if(d) d.classList.add("rd-hi");
    heroInfo(x.firma_id,x); const p=$("#rd-prog"); if(p) p.textContent=`${i+1} / ${steps.length}`; HR.timer=setTimeout(()=>go(i+1),rdReduce()?2600:2200) };
  go(0) }
function heroInit(){ heroApplyFilter(); heroInfo(null) }
