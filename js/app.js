import { $, number, date, escape as e, empty, strategies, loadJSON, assetPath, comparable, performanceText, durationText } from './utils.js';
import { validate } from './schema.js';
import { chart } from './charts.js';
import { coachingView } from './coaching.js';

let plan = null, history = { sessions: [], records: [] }, demo = false, historyLimit = 10;
const notice = message => { $('notice').insertAdjacentHTML('beforeend', `<p class="notice">${e(message)}</p>`); };
function exerciseCard(exercise, index) {
  const weights = exercise.workingWeights ?? exercise.targetReps.map(()=>exercise.weight);
  const strategy = strategies[exercise.strategy] ?? ['ISMERETLEN STRATÉGIA','?', 'hold'];
  const rows = comparable(history.records,exercise).slice(-5).reverse();
  return `<article class="exercise-card">
    <div class="exercise-main">
      <div class="exercise-picture"><img class="exercise-art" src="${assetPath(exercise)}" alt="${e(exercise.name)} bemutatóképe" loading="${index?'lazy':'eager'}"></div>
      <div class="exercise-content"><span class="card-index">${String(index+1).padStart(2,'0')} · ${exercise.sets} sorozat</span>
        <h3>${e(exercise.displayName??exercise.name)}</h3>
        <div class="set-targets" aria-label="Sorozatonkénti cél">${weights.map((weight,i)=>`<span><strong>${number(weight)}<small> ${e(exercise.unit)}</small></strong><span class="times">×</span><strong>${number(exercise.targetReps[i])}<small> ism.</small></strong></span>`).join('')}</div>
        <span class="strategy ${strategy[2]}">${strategy[1]} ${strategy[0]}</span>
      </div>
    </div>
    <details class="exercise-details"><summary>Előzmény és értékelés <span aria-hidden="true">+</span></summary>
      ${exercise.previous?`<p class="previous"><span>Előző · ${date(exercise.previous.date)}</span><strong>${performanceText(exercise.previous)}</strong></p>`:empty('Még nincs összehasonlítható előzmény.')}
      <p class="reason">${e(exercise.reasoning)}</p>
      ${coachingView(exercise.coaching)}
      ${rows.length?`<h4>Legutóbbi eredmények</h4>${rows.map(r=>`<div class="session-row"><span>${date(r.date)}</span><strong>${performanceText(r)}</strong></div>`).join('')}`:''}
    </details>
  </article>`;
}
function renderToday() {
  const currentDate = new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',weekday:'long',timeZone:'Europe/Budapest'}).format(new Date());
  $('hero').innerHTML = `<div class="hero"><div><p class="eyebrow">${demo?'DEMO EDZÉSTERV':'KÖVETKEZŐ EDZÉS'} · ${currentDate}</p><h1>${plan?'Csak a következő lépés.':'Itt kezdődik a haladás.'}</h1><p class="hero-meta">${plan?`${plan.exercises.length} gyakorlat · Frissítve: ${date(plan.generatedAt)}`:'Az edzésterved hamarosan itt vár.'}</p></div>${plan?`<span class="workout-letter" aria-label="Edzés ${plan.workoutType}">${plan.workoutType}</span>`:''}</div>`;
  $('focus').innerHTML = plan?.mainFocus.length?`<details class="focus-box"><summary>Mai fókusz <span aria-hidden="true">↗</span></summary>${plan.mainFocus.map(f=>`<p>${e(f)}</p>`).join('')}</details>`:'';
  $('exercise-count').textContent = plan?`${plan.exercises.length} gyakorlat · ${plan.exercises.reduce((n,x)=>n+x.sets,0)} sorozat`:'';
  $('exercises').innerHTML = plan?plan.exercises.map(exerciseCard).join(''):empty('Nincs még aktuális edzésterv');
  document.querySelectorAll('.exercise-art').forEach(img=>{img.addEventListener('error',()=>{img.src='assets/exercises/fallback.svg';},{once:true});});
}
function chartGroups() {
  const groups = new Map();
  const latest = new Map();
  for (const r of history.records.slice().sort((a,b)=>a.date.localeCompare(b.date))) {
    const key=JSON.stringify([r.exerciseId,r.comparisonGroup,r.unit]);
    if (!groups.has(key)) groups.set(key,{id:r.exerciseId,name:r.name,comparisonGroup:r.comparisonGroup,unit:r.unit,count:0});
    groups.get(key).count++;
    latest.set(r.exerciseId+'|'+r.unit,key);
  }
  // Older unverified one-session groups remain stored, but do not flood the selector.
  return [...groups.entries()].filter(([key,g])=>g.count>=2||latest.get(g.id+'|'+g.unit)===key).map(([,g])=>g);
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
  $('exercise-select').innerHTML=groups.map((g,i)=>`<option value="${i}">${e(g.name)} · ${g.comparisonGroup.includes('-unverified-')?'gépazonosítás szükséges':`${g.count} alkalom`} · ${e(g.unit)}</option>`).join('');
  $('exercise-select').disabled=!groups.length;
  const prs=history.records.filter(r=>r.pr).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const types={weight:'Munkasúly',reps:'Ismétlés adott súlyon',totalReps:'Összismétlés',estimatedStrength:'Becsült erő',estimated1RM:'Becsült 1RM'};
  $('prs').innerHTML=prs.length?prs.map(r=>`<div class="record"><div>✦ ${e(r.name)}<br><span>${date(r.date)} · ${types[r.prType]??'Jelölt rekord'}</span></div><strong>${number(r[r.prType==='reps'?'totalReps':r.prType]??r.weight)} ${r.prType==='reps'||r.prType==='totalReps'?'ism.':e(r.unit)}</strong></div>`).join(''):empty('Még nincs jelölt rekord. A stabil munka is haladás.');
  $('coaching').innerHTML=coachingView(plan?.coaching);
  renderChart();renderHistory();
}
function renderHistory() {
  const sessions=history.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date));
  $('history-list').innerHTML=sessions.length?sessions.slice(0,historyLimit).map(s=>{const rows=history.records.filter(r=>r.sessionId===s.id);return `<div class="timeline"><span class="type-icon">${s.workoutType??'–'}</span><div><strong>${s.workoutType?`Edzés ${s.workoutType}`:'Egyéb edzés'}</strong><p>${rows.length+(s.timedExercises?.length??0)} gyakorlat${s.durationMinutes!=null?` · ${number(s.durationMinutes)} perc`:''}${rows.some(r=>r.pr)?' · ✦ Rekord':''}</p></div><time datetime="${s.date}">${date(s.date)}</time></div>${s.timedExercises?.length?`<details><summary>Időalapú gyakorlatok</summary>${s.timedExercises.map(t=>`<div class="session-row"><span>${e(t.name)}</span><strong>${t.durationSeconds.map(durationText).join(' / ')}</strong></div>`).join('')}</details>`:''}`;}).join(''):empty('Még nincsenek rögzített edzések.');
  $('more-history').hidden=sessions.length<=historyLimit;
  $('history-coverage').textContent=sessions.length?`${sessions.length} mentett edzés · ${date(sessions[sessions.length-1].date)} – ${date(sessions[0].date)}`:'';
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
function showView() {
  const id=['today','progress','history'].includes(location.hash.slice(1))?location.hash.slice(1):'today';
  for(const view of ['today','progress','history'])$(view).hidden=view!==id;
  document.querySelectorAll('.bottom-nav a').forEach(link=>{
    if(link.hash===`#${id}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
}
window.addEventListener('hashchange',()=>{showView();window.scrollTo({top:0,behavior:'instant'});});
showView();
init().catch(()=>{ $('exercises').innerHTML=empty('Nincs még aktuális edzésterv');$('mode').textContent='Nincs adat'; });
