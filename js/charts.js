import { escape, number, date, empty } from './utils.js';
export const metricNames = { weight: 'Munkasúly', totalReps: 'Összismétlés', estimatedStrength: 'Becsült erő', estimated1RM: 'Becsült 1RM', volume: 'Volumen' };
export function chart(records, metric = 'weight', unit = 'kg', compact = false) {
  // A null metric breaks a line; it is never interpolated into a result.
  const valid = records.filter(r => Number.isFinite(r[metric]));
  if (valid.length < 2) return compact ? '' : empty('A grafikonhoz legalább két összehasonlítható eredmény szükséges.');
  const width = compact ? 150 : 720, height = compact ? 50 : 250;
  const left = compact ? 3 : 62, right = compact ? 3 : 28, top = compact ? 5 : 22, bottom = compact ? 5 : 42;
  const values = valid.map(r => r[metric]);
  // A wide minimum domain keeps small changes from appearing dramatic.
  const max = Math.max(...values), min = Math.min(...values), pad = Math.max((max-min)*.2,max*.12,1);
  const low = Math.max(0,min-pad), high = max+pad;
  const times = records.map(r => Date.parse(r.date)), first = Math.min(...times), last = Math.max(...times);
  const x = r => left + (Date.parse(r.date)-first)/Math.max(1,last-first)*(width-left-right);
  const y = r => top+(high-r[metric])/(high-low)*(height-top-bottom);
  let pen = false;
  const path = records.map(r => { if(!Number.isFinite(r[metric])){pen=false;return '';}const result=`${pen?'L':'M'}${x(r).toFixed(1)},${y(r).toFixed(1)}`;pen=true;return result;}).join(' ');
  const suffix = metric==='totalReps'?'ism.':metric==='volume'?`${unit}·ism.`:unit;
  const label = `${metricNames[metric]}: ${valid.map(r=>`${date(r.date)}: ${number(r[metric])} ${suffix}`).join('; ')}`;
  const grid = compact ? '' : Array.from({length:4},(_,i)=>{const v=low+(high-low)*i/3;const gy=top+(height-top-bottom)*(1-i/3);return `<line class="grid" x1="${left}" x2="${width-right}" y1="${gy}" y2="${gy}"/><text x="${left-10}" y="${gy+4}" text-anchor="end">${number(v)}</text>`;}).join('');
  const labels = compact ? '' : `<text x="${left}" y="${height-10}">${date(valid[0].date)}</text><text x="${width-right}" y="${height-10}" text-anchor="end">${date(valid[valid.length-1].date)}</text>`;
  const dots = compact ? '' : valid.map(r=>`<circle class="point" cx="${x(r)}" cy="${y(r)}" r="5"><title>${escape(date(r.date))}: ${number(r[metric])} ${escape(suffix)}</title></circle>`).join('');
  const svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(label)}">${grid}<path class="trend" d="${path}"/>${dots}${labels}</svg>`;
  if(compact)return svg;
  return `<p class="muted">${metricNames[metric]} · ${escape(suffix)} · Utolsó: <strong>${number(valid[valid.length-1][metric])}</strong></p>${svg}<details class="chart-details"><summary>Grafikonértékek megtekintése</summary>${valid.map(r=>`<div class="session-row"><span>${date(r.date)}</span><strong>${number(r[metric])} ${escape(suffix)}</strong></div>`).join('')}</details>`;
}
