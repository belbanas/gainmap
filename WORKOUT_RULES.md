# Future coaching rules

The goal is sustainable progressive overload, not a PR every workout. Infer the
next A/B session from actual completed history. Do not map weekdays to workout
letters: sessions may be skipped, moved, or added. An ambiguous sequence requires
review; do not guess. Today's exercise list primarily comes from the latest
comparable occurrence of the same workout type. Inspect previous matching workouts
before treating a one-off substitution as a permanent program change.

Prioritize working sets. Exclude warm-ups from primary progression signals when
source set types permit. Analyze load, sets, reps per set, total working reps,
same-load rep progression, and response to load increases. Use the last 2–3
comparable sessions for trends, 3–5 occurrences for context, and 6–10 weeks or longer
when helpful. Volume is secondary; weight × total reps alone is not a coaching rule.

* WEIGHT_INCREASE: stable success at the desired rep level justifies the next load
  increment. Example: 65 kg × 12/12/12 → 70 kg with an 8–10 rep target.
* REP_PROGRESSION: keep load, increase repetitions. 70 kg × 10/10/8 → 10/10/9.
* HOLD: repeat a suitable result after a load increase, inconsistent performance,
  or insufficient evidence. Repeating a good result is useful progress.
* CORRECTION: reduce or meaningfully change load only after several comparable
  sessions establish a negative trend. One weaker workout is normal variability.

Different machines have different resistance systems. Their displayed loads do
not automatically compare. Assign local comparisonGroup slugs based on reviewed
comparability; preserve separate groups when uncertain. Never put gym or machine
identity metadata into those slugs. Preserve units; do not invent conversions.
Frontend code never decides cross-machine equivalence. If a future coach reviews
two histories as comparable, it must normalize them into one documented group.

PR flags and coaching reasoning are producer decisions. Estimates must be labeled
as estimates and never presented as performed lifts. Do not publish source notes.
On retrieval failure preserve valid prior data and report failure.
