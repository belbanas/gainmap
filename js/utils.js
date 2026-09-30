export const $ = id => document.getElementById(id);
export const number = value => new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 }).format(value);
export const date = value => new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric', timeZone: 'Europe/Budapest' }).format(new Date(value.length === 10 ? value + 'T12:00:00Z' : value));
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const empty = message => `<div class="empty">${escape(message)}</div>`;
export const performanceText = value => value.workingWeights
  ? value.reps.map((reps,i)=>`${number(value.workingWeights[i])} ${escape(value.unit)} × ${number(reps)}`).join(' · ')
  : `${number(value.weight)} ${escape(value.unit)} · ${value.reps.map(number).join(' / ')}`;
export const durationText = seconds => `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
export const strategies = {
  WEIGHT_INCREASE: ['SÚLYEMELÉS', '↗', 'weight'],
  REP_PROGRESSION: ['REP-PROGRESSZIÓ', '+', 'rep'],
  HOLD: ['TARTÁS', '=', 'hold'],
  CORRECTION: ['KORREKCIÓ', '↘', 'correction']
};
export async function loadJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Adatbetöltési hiba: ${response.status}`);
  return response.json();
}
export function assetPath(exercise) {
  const path = exercise.image ?? `assets/exercises/${exercise.id}.svg`;
  return /^assets\/exercises\/[a-z0-9-]+\.(svg|png|webp|jpg)$/.test(path) ? path : 'assets/exercises/fallback.svg';
}
export function comparable(records, exercise) {
  return records.filter(record => record.exerciseId === exercise.id && record.comparisonGroup === exercise.comparisonGroup && record.unit === exercise.unit).sort((a, b) => a.date.localeCompare(b.date));
}
