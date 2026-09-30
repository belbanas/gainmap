# GainMap agent instructions

Read this file first, then WORKOUT_RULES.md, DESIGN.md, DATA_SCHEMA.md, and SECURITY.md
before modifying or committing workout data.

The frontend is stable. Scheduled runs normally modify only `data/latest.json` and
`data/history.json`. Do not regenerate HTML, CSS, JS, or DESIGN.md each workout.
Assets may occasionally be added using the documented local slug convention.

Future authorized workflow: read-only Lyfta plugin → sanitized history → infer A/B
from completed sessions → comparable working-set analysis → JSON update → validate
→ review staged diff → commit → push → GitHub Pages. Do not implement this workflow
or connect to Lyfta as part of foundation work. Schedules may run Monday, Wednesday,
Friday before training, but weekdays do not determine A/B.

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
