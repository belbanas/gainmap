# GainMap agent instructions

Read this file first, then WORKOUT_RULES.md, DESIGN.md, DATA_SCHEMA.md, and SECURITY.md
before modifying or committing workout data.

The frontend is stable. Scheduled runs normally modify only `data/latest.json` and
`data/history.json`. Do not regenerate HTML, CSS, JS, or DESIGN.md each workout.
Assets may occasionally be added using the documented local slug convention.

Real-data import: preserve per-set workingWeights; never apply the first load to
every set. Timed exercises use session.timedExercises, not invented reps. The current
Lyfta connector does not expose units, set type, reliable completion semantics, or
exercise comments. Obtain missing unit/set semantics from the user. Do not infer
machine identity from an exercise name. Without reviewed machine identification,
use separate local comparison groups per session and conservative HOLD guidance
valid only on the previous setup. Do not store source comments verbatim.

Future authorized workflow: read-only Lyfta plugin → sanitized history → infer A/B
from completed sessions → comparable working-set analysis → JSON update → validate
→ review staged diff → commit → push → GitHub Pages. Do not implement this workflow
or connect to Lyfta as part of foundation work. The user has now authorized an
ongoing update schedule on Monday, Wednesday, Friday at 15:00 Europe/Budapest;
weekdays do not determine A/B. See AUTOMATION_PROMPT.md for the authorized workflow.

Never fabricate history or recommendations. Never commit identity, credentials,
account metadata, external IDs, raw responses, or unreviewed free-text source notes.
Public performance metrics are permitted. Comparison groups and units must match.

If upstream retrieval fails: report failure, keep the last valid plan, do not write
empty replacement data, and do not commit fabricated data. An optional
`upstream_error` status may retain the complete previous plan. No browser storage
cache is relied upon: the producer must preserve that plan in latest.json.

Before every commit run `node scripts/validate-data.mjs` and relevant tests.
Inspect the entire staged diff for leaks and unintended frontend changes.
If validation fails, do not push. If push fails, report it; never claim deployment
succeeded. A successful push is not proof that GitHub Pages has finished deploying.

Commit messages must be short, clear, imperative, and at most one sentence.
Prefer a subject under 72 characters, without a trailing period.
Example: `Update GainMap workout plan for YYYY-MM-DD`.
The user has authorized committing and pushing the completed foundation for this
task. For future tasks, follow the user's authorization and repository policy.
When the user authorizes an update, complete validation, commit, and push in that
run without asking again. Verify the remote branch matches the committed HEAD.
Report commit and push separately; locally committed is not remotely published.
