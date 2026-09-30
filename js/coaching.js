import { escape as e, empty, number } from './utils.js';

const assessments = { improving: 'Javuló teljesítmény', stable: 'Stabil teljesítmény', mixed: 'Vegyes eredmények', needs_attention: 'Érdemes változtatni', insufficient_data: 'Kevés összehasonlítható adat' };
const list = items => items?.length ? `<ul>${items.map(text=>`<li>${e(text)}</li>`).join('')}</ul>` : '';

export function alternativeCard(alternative) {
  if (!alternative) return '';
  const start=alternative.startingPlan;
  const weights=start?(start.workingWeights??start.targetReps.map(()=>start.weight)):[];
  return `<aside class="alternative" aria-label="Javasolt gyakorlatcsere"><p class="alternative-label">⇄ Javasolt gyakorlatcsere</p><h4>${e(alternative.name)}</h4>
    ${start?`<p class="alternative-basis">${start.basis==='comparable_history'?'Korábbi összehasonlítható eredmény alapján':'Becsült kezdőterhelés'}</p><div class="alternative-targets" aria-label="Az új gyakorlat sorozatonkénti célja">${weights.map((weight,i)=>`<span>${number(weight)} ${e(start.unit)} × ${number(start.targetReps[i])} ism.</span>`).join('')}</div><p class="muted">${e(start.reasoning)}</p>`:'<p class="muted">A kezdősúly és ismétlésszám pontosításához még adat szükséges.</p>'}
    <p>${e(alternative.reason)}</p><p class="muted">Mikor: ${e(alternative.condition)}</p></aside>`;
}

// The updater writes the assessment. The browser only presents it.
export function coachingView(coaching, { showAlternative=true } = {}) {
  if (!coaching) return empty('Még nincs edzői értékelés.');
  return `<div class="coaching-content"><span class="coach-label">${assessments[coaching.assessment]}</span><p class="evaluation">${e(coaching.evaluation)}</p>
    ${coaching.evidence.length?`<h4>Mire alapozom?</h4>${list(coaching.evidence)}`:''}
    ${coaching.advice.length?`<h4>A következő lépés</h4>${list(coaching.advice)}`:''}
    ${coaching.possibleCauses.length?`<h4>Lehetséges okok</h4>${coaching.possibleCauses.map(c=>`<p class="cause"><span>${c.confidence==='supported'?'Adatokkal alátámasztva':'Feltételezés'}</span>${e(c.text)}</p>`).join('')}`:''}
    ${showAlternative?alternativeCard(coaching.alternative):''}
    ${coaching.followUp.length?`<h4>Ezt érdemes még tisztázni</h4>${list(coaching.followUp)}`:''}</div>`;
}
