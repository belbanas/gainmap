export const STRATEGIES = ['WEIGHT_INCREASE', 'REP_PROGRESSION', 'HOLD', 'CORRECTION'];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validate(kind, data, strict = false) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const object = (value, path, keys) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { fail(path, 'object required'); return false; }
    if (strict) for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${path}.${key}`, 'unknown field; review schema before publication');
    return true;
  };
  const text = (v, p) => { if (typeof v !== 'string' || !v.trim() || v.length > 500) fail(p, 'nonempty string, max 500 characters'); };
  const id = (v, p) => { if (typeof v !== 'string' || !slug.test(v)) fail(p, 'local lowercase slug required'); };
  const num = (v, p, integer = false) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 10000000 || (integer && !Number.isInteger(v))) fail(p, 'nonnegative finite number required'); };
  const day = (v, p) => { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v) fail(p, 'valid YYYY-MM-DD required'); };
  const timestamp = (v, p) => { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v) || !Number.isFinite(Date.parse(v))) fail(p, 'UTC ISO timestamp required'); else day(v.slice(0,10),p); };
  const choice = (v, p, values) => { if (!values.includes(v)) fail(p, `expected ${values.join(', ')}`); };
  const list = (v, p, fn) => { if (!Array.isArray(v)) fail(p, 'array required'); else v.forEach((item,i) => fn(item,`${p}[${i}]`)); };
  const reps = (v, p, count) => { list(v,p,(r,rp)=>num(r,rp,true)); if (Array.isArray(v) && (!v.length || v.length !== count)) fail(p,'must contain one value per working set'); };
  const weights = (v, p) => {
    if (v.workingWeights === undefined) return;
    list(v.workingWeights, p+'.workingWeights', num);
    if (Array.isArray(v.workingWeights) && (v.workingWeights.length !== v.sets || v.workingWeights[0] !== v.weight)) fail(p+'.workingWeights', 'one weight per set required; first must equal primary weight');
  };
  const performance = (v,p) => {
    if (!object(v,p,['date','weight','workingWeights','unit','sets','reps','comparisonGroup'])) return;
    day(v.date,p+'.date'); num(v.weight,p+'.weight'); text(v.unit,p+'.unit'); num(v.sets,p+'.sets',true); reps(v.reps,p+'.reps',v.sets); id(v.comparisonGroup,p+'.comparisonGroup');
    weights(v,p);
  };
  const coaching = (v,p) => {
    if(v===undefined||v===null)return;
    if(!object(v,p,['generatedAt','assessment','evaluation','evidence','advice','possibleCauses','alternative','followUp']))return;
    timestamp(v.generatedAt,p+'.generatedAt');
    choice(v.assessment,p+'.assessment',['improving','stable','mixed','needs_attention','insufficient_data']);
    text(v.evaluation,p+'.evaluation');
    for(const key of ['evidence','advice','followUp'])list(v[key],p+'.'+key,text);
    list(v.possibleCauses,p+'.possibleCauses',(c,cp)=>{
      if(!object(c,cp,['text','confidence']))return;
      text(c.text,cp+'.text');choice(c.confidence,cp+'.confidence',['hypothesis','supported']);
    });
    if(v.alternative!==null&&object(v.alternative,p+'.alternative',['name','reason','condition']))
      for(const key of ['name','reason','condition'])text(v.alternative[key],p+'.alternative.'+key);
  };
  function latest(v,p) {
    if (!object(v,p,['schemaVersion','generatedAt','status','workoutType','mainFocus','exercises','summary','coaching'])) return;
    if(v.schemaVersion!==1) fail(p+'.schemaVersion','unsupported schema version');
    timestamp(v.generatedAt,p+'.generatedAt'); choice(v.status,p+'.status',['ready','empty','upstream_error']);
    choice(v.workoutType,p+'.workoutType',v.status==='empty'?[null]:['A','B']);
    if(v.summary!==undefined) text(v.summary,p+'.summary');
    coaching(v.coaching,p+'.coaching');
    list(v.mainFocus,p+'.mainFocus',text); if(Array.isArray(v.mainFocus)&&v.mainFocus.length>3) fail(p+'.mainFocus','maximum 3 items');
    const ids=new Set();
    list(v.exercises,p+'.exercises',(e,ep)=>{
      if(!object(e,ep,['id','name','displayName','image','weight','workingWeights','unit','sets','targetReps','repRange','strategy','previous','reasoning','progressSummary','comparisonGroup','pr','change','estimatedStrength','estimated1RM','chart','coaching'])) return;
      id(e.id,ep+'.id'); if(ids.has(e.id)) fail(ep+'.id','duplicate exercise'); ids.add(e.id);
      text(e.name,ep+'.name'); num(e.weight,ep+'.weight'); text(e.unit,ep+'.unit'); num(e.sets,ep+'.sets',true); reps(e.targetReps,ep+'.targetReps',e.sets);
      weights(e,ep);
      coaching(e.coaching,ep+'.coaching');
      if(e.displayName!==undefined)text(e.displayName,ep+'.displayName');
      choice(e.strategy,ep+'.strategy',STRATEGIES); text(e.reasoning,ep+'.reasoning'); id(e.comparisonGroup,ep+'.comparisonGroup');
      if(e.image!==undefined && e.image!==null && !/^assets\/exercises\/[a-z0-9-]+\.(svg|png|webp|jpg)$/.test(e.image)) fail(ep+'.image','local exercise asset required');
      if(e.previous!==null){ performance(e.previous,ep+'.previous'); if(e.previous && (e.previous.comparisonGroup!==e.comparisonGroup||e.previous.unit!==e.unit)) fail(ep+'.previous','incomparable previous performance'); }
      if(e.repRange!==undefined&&e.repRange!==null){ if(object(e.repRange,ep+'.repRange',['min','max'])){num(e.repRange.min,ep+'.repRange.min',true);num(e.repRange.max,ep+'.repRange.max',true);if(e.repRange.min>e.repRange.max)fail(ep+'.repRange','min exceeds max');}}
      for(const key of ['progressSummary']) if(e[key]!==undefined&&e[key]!==null) text(e[key],ep+'.'+key);
      for(const key of ['estimatedStrength','estimated1RM']) if(e[key]!==undefined&&e[key]!==null) num(e[key],ep+'.'+key);
      if(e.pr!==undefined && typeof e.pr!=='boolean') fail(ep+'.pr','boolean required');
      if(e.change!==undefined&&e.change!==null && object(e.change,ep+'.change',['weight','totalReps'])) for(const k of ['weight','totalReps']) if(typeof e.change[k]!=='number'||!Number.isFinite(e.change[k])) fail(ep+'.change.'+k,'finite signed number required');
      if(e.chart!==undefined) list(e.chart,ep+'.chart',(c,cp)=>{if(object(c,cp,['date','value','comparisonGroup','unit'])){day(c.date,cp+'.date');num(c.value,cp+'.value');if(c.comparisonGroup!==e.comparisonGroup||c.unit!==e.unit)fail(cp,'incomparable chart point');}});
    });
    if(Array.isArray(v.exercises)&&((v.status==='empty'&&v.exercises.length)||(v.status==='ready'&&!v.exercises.length))) fail(p+'.exercises','status and plan do not agree');
  }
  function history(v,p) {
    if(!object(v,p,['schemaVersion','sessions','records']))return;
    if(v.schemaVersion!==1)fail(p+'.schemaVersion','unsupported schema version');
    const sessions=new Map();
    list(v.sessions,p+'.sessions',(s,sp)=>{
      if(!object(s,sp,['id','date','workoutType','durationMinutes','timedExercises']))return;
      id(s.id,sp+'.id');day(s.date,sp+'.date');choice(s.workoutType,sp+'.workoutType',['A','B',null]);
      if(s.durationMinutes!==undefined&&s.durationMinutes!==null)num(s.durationMinutes,sp+'.durationMinutes');
      if(s.timedExercises!==undefined)list(s.timedExercises,sp+'.timedExercises',(t,tp)=>{
        if(!object(t,tp,['id','name','durationSeconds']))return;
        id(t.id,tp+'.id');text(t.name,tp+'.name');list(t.durationSeconds,tp+'.durationSeconds',(d,dp)=>num(d,dp,true));
        if(Array.isArray(t.durationSeconds)&&!t.durationSeconds.length)fail(tp+'.durationSeconds','nonempty array required');
      });
      if(sessions.has(s.id))fail(sp+'.id','duplicate session');sessions.set(s.id,s);
    });
    const records=new Set();
    list(v.records,p+'.records',(r,rp)=>{
      if(!object(r,rp,['sessionId','date','exerciseId','name','comparisonGroup','weight','workingWeights','unit','sets','reps','totalReps','volume','estimatedStrength','estimated1RM','pr','prType','workoutType','progressionResult']))return;
      id(r.sessionId,rp+'.sessionId');id(r.exerciseId,rp+'.exerciseId');text(r.name,rp+'.name');performance({date:r.date,weight:r.weight,workingWeights:r.workingWeights,unit:r.unit,sets:r.sets,reps:r.reps,comparisonGroup:r.comparisonGroup},rp);
      num(r.totalReps,rp+'.totalReps',true);if(Array.isArray(r.reps)&&r.totalReps!==r.reps.reduce((a,b)=>a+b,0))fail(rp+'.totalReps','must equal sum of reps');
      for(const k of ['volume','estimatedStrength','estimated1RM'])if(r[k]!==undefined&&r[k]!==null)num(r[k],rp+'.'+k);
      const volume=Array.isArray(r.reps)?r.reps.reduce((sum,reps,i)=>sum+(r.workingWeights?.[i]??r.weight)*reps,0):NaN;
      if(r.volume!=null&&(!Number.isFinite(volume)||Math.abs(r.volume-volume)>0.01))fail(rp+'.volume','must equal sum of set weight × reps');
      if(typeof r.pr!=='boolean')fail(rp+'.pr','boolean required');
      if(r.prType!==undefined&&r.prType!==null)choice(r.prType,rp+'.prType',['weight','reps','totalReps','estimatedStrength','estimated1RM']);
      choice(r.workoutType,rp+'.workoutType',['A','B',null]);choice(r.progressionResult,rp+'.progressionResult',['improved','stable','dip','unknown']);
      const s=sessions.get(r.sessionId);if(!s||s.date!==r.date||s.workoutType!==r.workoutType)fail(rp+'.sessionId','matching local session required');
      const key=r.sessionId+'|'+r.exerciseId+'|'+r.comparisonGroup;if(records.has(key))fail(rp,'duplicate record');records.add(key);
    });
  }
  if(kind==='latest')latest(data,'latest');else if(kind==='history')history(data,'history');else if(kind==='demo'){
    if(object(data,'demo',['schemaVersion','synthetic','latest','history'])){if(data.schemaVersion!==1||data.synthetic!==true)fail('demo','version 1 and synthetic=true required');latest(data.latest,'demo.latest');history(data.history,'demo.history');}
  }else fail(kind,'unknown document kind');
  return errors;
}
