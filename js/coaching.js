import { escape as e, empty } from './utils.js';

const assessments = { improving: 'Javuló teljesítmény', stable: 'Stabil teljesítmény', mixed: 'Vegyes eredmények', needs_attention: 'Érdemes változtatni', insufficient_data: 'Kevés összehasonlítható adat' };
const list = items => items?.length ? `<ul>${items.map(text=>`<li>${e(text)}</li>`).join('')}</ul>` : '';

// The updater writes the assessment. The browser only presents it.
export function coachingView(coaching) {
  if (!coaching) return empty('Még nincs edzői értékelés.');
  return `<div class="coaching-content"><span class="coach-label">${assessments[coaching.assessment]}</span><p class="evaluation">${e(coaching.evaluation)}</p>
    ${coaching.evidence.length?`<h4>Mire alapozom?</h4>${list(coaching.evidence)}`:''}
    ${coaching.advice.length?`<h4>A következő lépés</h4>${list(coaching.advice)}`:''}
    ${coaching.possibleCauses.length?`<h4>Lehetséges okok</h4>${coaching.possibleCauses.map(c=>`<p class="cause"><span>${c.confidence==='supported'?'Adatokkal alátámasztva':'Feltételezés'}</span>${e(c.text)}</p>`).join('')}`:''}
    ${coaching.alternative?`<div class="alternative"><h4>Megfontolható gyakorlatcsere</h4><strong>${e(coaching.alternative.name)}</strong><p>${e(coaching.alternative.reason)}</p><p class="muted">Mikor: ${e(coaching.alternative.condition)}</p></div>`:''}
    ${coaching.followUp.length?`<h4>Ezt érdemes még tisztázni</h4>${list(coaching.followUp)}`:''}</div>`;
}
