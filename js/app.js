import { $, number, date, escape as e, empty, strategies, loadJSON, assetPath, comparable } from './utils.js';
import { validate } from './schema.js';
import { chart } from './charts.js';

let plan = null, history = { sessions: [], records: [] }, demo = false, historyLimit = 10;
const notice = message => { $('notice').insertAdjacentHTML('beforeend', `<p class="notice">${e(message)}</p>`); };
function exerciseCard(exercise, index) {
  const rows = comparable(history.records,exercise);
  const strategy = strategies[exercise.strategy] ?? ['ISMERETLEN STRATÉGIA','?', 'hold'];
  const previous = exercise.previous;
  const sparkRecords = rows.length ? rows.slice(-10) : (exercise.chart??[]).map(point=>({date:point.date,weight:point.value}));
  const spark = chart(sparkRecords,'weight',exercise.unit,true);
  const previousText = previous ? `${number(previous.weight)} ${e(previous.unit)} · ${previous.reps.map(number).join(' / ')}` : 'Még nincs összehasonlítható eredmény';
  return `<article class="exercise-card"><div class="card-head"><img class="exercise-art" src="${assetPath(exercise)}" alt="" loading="lazy"><div><span class="card-index">${String(index+1).padStart(2,'0')} / GYAKORLAT</span><h3>${e(exercise.name)}</h3></div>${exercise.pr?'<span class="pr-chip">✦ Új rekord</span>':''}</div><div class="prescription"><div><p class="eyebrow">MAI MUNKASÚLY</p><div class="load">${number(exercise.weight)}<small>${e(exercise.unit)}</small></div></div><div><p class="eyebrow">CÉLISMÉTLÉS</p><div class="reps">${exercise.targetReps.map(number).join(' / ')}</div><div class="set-label">${exercise.sets} munkasorozat${exercise.repRange?` · ${exercise.repRange.min}–${exercise.repRange.max} ism.`:''}</div></div></div><span class="badge ${strategy[2]}"><span aria-hidden="true">${strategy[1]}</span>${strategy[0]}</span><p class="reason">${e(exercise.reasoning)}</p><div class="previous"><span>Előző${previous?` · ${date(previous.date)}`:''}</span><strong>${previousText}</strong></div>${spark?`<div class="mini-chart">${spark}<span>${e(exercise.progressSummary??'Munkasúly alakulása')}<br><span class="muted">${sparkRecords.length} összehasonlítható alkalom</span></span></div>`:''}<details><summary>Legutóbbi teljesítmény</summary>${rows.length?chart(rows.slice(-10),'totalReps',exercise.unit)+rows.slice(-5).reverse().map(r=>`<div class="session-row"><span>${date(r.date)}</span><strong>${number(r.weight)} ${e(r.unit)} · ${r.reps.map(number).join(' / ')}</strong></div>`).join(''):empty('Még nincs teljesítménytörténet.')}${exercise.estimated1RM!=null?`<p class="muted">Becsült 1RM: ${number(exercise.estimated1RM)} ${e(exercise.unit)}</p>`:''}</details></article>`;
}
function renderToday() {
  const currentDate = new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',weekday:'long',timeZone:'Europe/Budapest'}).format(new Date());
  $('hero').innerHTML = `<div class="hero"><div><p class="eyebrow">${demo?'DEMO EDZÉSTERV':'MAI EDZÉS'}</p><h1>${plan?`Edzés ${plan.workoutType}`:'A következő lépés.'}</h1><p class="hero-description">${e(plan?.summary??'Az edzésterved itt vár majd. Minden fejlődés egy következő lépéssel kezdődik.')}</p><p class="hero-meta">${currentDate}${plan?`<span>${demo?'Demópélda készült':'Utolsó frissítés'}: ${date(plan.generatedAt)} · ${new Intl.DateTimeFormat('hu-HU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Budapest'}).format(new Date(plan.generatedAt))}</span>`:''}</p></div><div class="workout-letter" aria-hidden="true">${plan?.workoutType??'↗'}</div></div>`;
  $('focus').innerHTML = plan?.mainFocus.length?`<div class="focus-box"><p class="eyebrow">↗ MAI FŐ FÓKUSZ</p><div class="focus-items">${plan.mainFocus.map(f=>`<span class="focus-item">${e(f)}</span>`).join('')}</div></div>`:'';
  $('exercise-count').textContent = plan?`${plan.exercises.length} gyakorlat · ${plan.exercises.reduce((n,x)=>n+x.sets,0)} sorozat`:'';
  $('exercises').innerHTML = plan?plan.exercises.map(exerciseCard).join(''):empty('Nincs még aktuális edzésterv');
  document.querySelectorAll('.exercise-art').forEach(img=>{img.addEventListener('error',()=>{img.src='assets/exercises/fallback.svg';},{once:true});});
}
function chartGroups() {
  const groups = new Map();
  for(const r of history.records){const key=JSON.stringify([r.exerciseId,r.comparisonGroup,r.unit]);if(!groups.has(key))groups.set(key,{id:r.exerciseId,name:r.name,comparisonGroup:r.comparisonGroup,unit:r.unit});}
  return [...groups.values()];
}
let groups = [];
function renderChart() {
  const group = groups[Number($('exercise-select').value)];
  if(!group){$('main-chart').innerHTML=empty('Még nincs adat a haladás megjelenítéséhez.');return;}
  let rows = comparable(history.records,group);
  if($('window-select').value!=='all'&&rows.length){const cutoff=Date.parse(rows[rows.length-1].date)-Number($('window-select').value)*7*86400000;rows=rows.filter(r=>Date.parse(r.date)>=cutoff);}
  $('main-chart').innerHTML=chart(rows,$('metric-select').value,group.unit);
}
function renderProgress() {
  const sessions = history.sessions.slice().sort((a,b)=>a.date.localeCompare(b.date));
  if(sessions.length){
    const end = Date.parse(sessions[sessions.length-1].date), start = end-27*86400000;
    const recent=sessions.filter(s=>Date.parse(s.date)>=start);
    const ids=new Set(recent.map(s=>s.id));
    const prs=history.records.filter(r=>ids.has(r.sessionId)&&r.pr);
    const progress=history.records.filter(r=>ids.has(r.sessionId)&&r.progressionResult==='improved');
    $('metrics').innerHTML=[[recent.length,'edzés / utolsó 28 nap'],[progress.length,'javuló gyakorlat-eredmény'],[prs.length,'jelölt rekord / 28 nap']].map(([v,label])=>`<div class="metric"><strong>${v}</strong><span>${label}</span></div>`).join('');
    const anchor=new Date(sessions[sessions.length-1].date+'T12:00:00Z');anchor.setUTCDate(anchor.getUTCDate()-((anchor.getUTCDay()+6)%7));
    const weeks=Array.from({length:8},(_,i)=>{const d=new Date(anchor);d.setUTCDate(d.getUTCDate()-(7-i)*7);const from=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()+7);return {from,count:sessions.filter(s=>s.date>=from&&s.date<d.toISOString().slice(0,10)).length};});
    const max=Math.max(1,...weeks.map(w=>w.count));
    $('consistency').innerHTML=`<p class="muted">Az utolsó rögzített edzésig · 8 hét</p><div class="week-grid">${weeks.map(w=>`<div class="week" aria-label="${date(w.from)} hetében ${w.count} edzés"><strong>${w.count}</strong><div class="week-bar" style="height:${w.count/max*60}px"></div><span>${date(w.from)}</span></div>`).join('')}</div>`;
  }else{$('metrics').innerHTML='';$('consistency').innerHTML=empty('Az első edzések után itt láthatod a ritmusodat.');}
  groups=chartGroups();
  $('exercise-select').innerHTML=groups.map((g,i)=>`<option value="${i}">${e(g.name)} · ${e(g.comparisonGroup)} · ${e(g.unit)}</option>`).join('');
  $('exercise-select').disabled=!groups.length;
  const prs=history.records.filter(r=>r.pr).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const types={weight:'Munkasúly',reps:'Ismétlés adott súlyon',totalReps:'Összismétlés',estimatedStrength:'Becsült erő',estimated1RM:'Becsült 1RM'};
  $('prs').innerHTML=prs.length?prs.map(r=>`<div class="record"><div>✦ ${e(r.name)}<br><span>${date(r.date)} · ${types[r.prType]??'Jelölt rekord'}</span></div><strong>${number(r[r.prType==='reps'?'totalReps':r.prType]??r.weight)} ${r.prType==='reps'||r.prType==='totalReps'?'ism.':e(r.unit)}</strong></div>`).join(''):empty('Még nincs jelölt rekord. A stabil munka is haladás.');
  renderChart();renderHistory();
}
function renderHistory() {
  const sessions=history.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date));
  $('history-list').innerHTML=sessions.length?sessions.slice(0,historyLimit).map(s=>{const rows=history.records.filter(r=>r.sessionId===s.id);return `<div class="timeline"><span class="type-icon">${s.workoutType}</span><div><strong>Edzés ${s.workoutType}</strong><p>${rows.length} gyakorlat${s.durationMinutes!=null?` · ${number(s.durationMinutes)} perc`:''}${rows.some(r=>r.pr)?' · ✦ Rekord':''}</p></div><time datetime="${s.date}">${date(s.date)}</time></div>`;}).join(''):empty('Még nincsenek rögzített edzések.');
  $('more-history').hidden=sessions.length<=historyLimit;
}
async function init() {
  const results=await Promise.allSettled([loadJSON('data/latest.json'),loadJSON('data/history.json')]);
  const latest=results[0].status==='fulfilled'?results[0].value:null;
  const loadedHistory=results[1].status==='fulfilled'?results[1].value:null;
  if(latest && latest.schemaVersion!==1){notice('Ez az adatverzió újabb GainMap felületet igényel.');}
  else if(latest && !validate('latest',latest).length){
    if(latest.status==='empty'){
      // Only an explicit empty state activates the clearly labeled synthetic demo.
      try{const bundle=await loadJSON('data/demo.json');if(!validate('demo',bundle).length){plan=bundle.latest;history=bundle.history;demo=true;notice('Demo adatok · Szintetikus példák, nem valódi edzéselőzmények.');}}catch{/* Intentional empty state remains usable. */}
    }else if(latest.exercises.length){plan=latest;if(latest.status==='upstream_error')notice('Az adatfrissítés nem sikerült. Az utolsó érvényes edzésterv látható.');}
    else notice('Az adatfrissítés nem sikerült. Nincs elérhető korábbi edzésterv.');
  }else notice('Nincs még aktuális edzésterv. Az adatfájl nem érhető el vagy hibás.');
  if(!demo && loadedHistory && !validate('history',loadedHistory).length)history=loadedHistory;
  else if(!demo && plan)notice('A teljesítménytörténet nem érhető el. A jelenlegi edzésterv használható.');
  $('mode').textContent=demo?'Demo adatok':plan?'Edzésterv':'Nincs adat';
  renderToday();renderProgress();
}
for(const id of ['exercise-select','metric-select','window-select'])$(id).addEventListener('change',renderChart);
$('more-history').addEventListener('click',()=>{historyLimit+=20;renderHistory();});
document.querySelectorAll('.bottom-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav a').forEach(a=>a.removeAttribute('aria-current'));link.setAttribute('aria-current','page');}));
init().catch(()=>{ $('exercises').innerHTML=empty('Nincs még aktuális edzésterv');$('mode').textContent='Nincs adat'; });
