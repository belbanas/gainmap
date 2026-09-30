# GainMap

A Hungarian, mobile-first static workout dashboard: today's A/B recommendation,
working load, target reps, progression guidance, and comparable performance trends.
The foundation included synthetic demo examples; current latest/history may contain
sanitized real training data. Demo remains separately available. There is no live Lyfta
connection, scheduled updater, backend, authentication, framework, or build step.

## Preview and validate

Requires Python for a local static server; Node.js 16+ for validation/tests only.
From the repository root:

```sh
python -m http.server 8000
node scripts/validate-data.mjs
node scripts/test.mjs
```

Open `http://localhost:8000`. Opening index.html through file:// cannot load JSON
reliably. No dependency installation is needed; package.json only defines module
type and optional `npm run validate` / `npm test` aliases.

## Structure and rendering

```text
index.html, 404.html             Static shell and error page
css/style.css                   Responsive visual system
js/app.js                       Loading, cards, summaries, history
js/charts.js                    Accessible native SVG time series
js/utils.js, js/schema.js        Formatting and shared defensive validation
data/latest.json                 Current sanitized recommendation
data/history.json                Normalized sessions and performance records
data/demo.json                   Clearly synthetic demonstration bundle
assets/brand/                   Original home-screen icons
assets/exercises/               Local illustrations and fallback convention
scripts/validate-data.mjs        Schema and metadata leakage checks
scripts/test.mjs                 Failure and comparability regression checks
AGENTS.md, WORKOUT_RULES.md      Future updater instructions
DESIGN.md, DATA_SCHEMA.md        Stable visual and data contracts
SECURITY.md                      Public-data boundary
favicon.svg, site.webmanifest, robots.txt
```

The browser fetches latest and history independently with no-store. An explicit
valid `empty` latest state loads demo.json and prominently displays **Demo adatok**.
Missing/invalid latest does not silently activate demo. To view a completely empty
state, keep latest empty and temporarily remove demo.json in a local copy.
Switch to real mode by writing valid ready latest and valid history; no frontend
edits are needed. Unsupported schema versions produce a useful notice.
Missing history leaves today's plan usable. An upstream_error document must retain
the complete previous valid plan to display it. No stale browser cache is required.

Exercise cards, chart metric/window selectors, expandable results, weekly training
frequency, producer-marked PRs, and paginated session history use only stored facts.
Summary counts cover 28 days ending at the last recorded session, not today.
PRs come from explicit producer flags. Becsült erő/1RM are estimates.
Cards show mixed per-set loads explicitly, with each load paired to its rep target.
Duration-only exercises appear in session history rather than fabricated rep charts.
Unidentified machines remain in separate session groups; older single-point groups
are preserved in history without crowding the chart selector. No machine equivalence
is assumed from the exercise name. This connector does not currently expose notes
or unit metadata; import requires reviewed user clarification. See AGENTS.md.

## Comparability and images

History is normalized around local sessions. A chart line requires the same exercise
slug, comparisonGroup, and unit. No frontend machine-equivalence inference or unit
conversion occurs. Each distinct group is selectable separately. Null metrics break
lines. Full history is stored; 10/26-week display windows keep charts manageable.

Add original/licensed `assets/exercises/<slug>.svg`, or set the optional local image
path. Missing images display fallback.svg. See assets/exercises/README.md.

## Privacy

Weights, reps, sets, training dates, trends, PRs, estimated strength, and other
sanitized performance metrics may intentionally be public. Identity, contact and
location information, credentials, account metadata, external IDs, and raw service
responses must never be public. Read SECURITY.md. The key scanner is a guardrail;
manual review of strings is still necessary. Public GitHub Pages is public:
robots.txt and noindex are not access control.

## GitHub Pages

Push the reviewed files to the main branch. In GitHub choose:
**Settings → Pages → Deploy from a branch → main → / (root) → Save**.
All asset and JSON references are relative, supporting repository subpaths.
No Actions workflow is required. A push triggers publication when Pages is enabled;
deployment completion must be checked separately. The manifest supports home-screen
installation and includes iOS raster icons; there is deliberately no service worker
or offline cache that could conceal stale workout recommendations.

## Future local updater

Not implemented here. An authorized local agent will access the read-only Lyfta
plugin, infer the next A/B session from completed workouts, analyze comparable
working sets, sanitize data, and update **data/latest.json and data/history.json**.
Follow AGENTS.md, WORKOUT_RULES.md, DATA_SCHEMA.md, and SECURITY.md.
Never regenerate the interface on routine runs or overwrite valid data on failure.

```sh
node scripts/validate-data.mjs
git add data/latest.json data/history.json
git commit -m "Update GainMap workout plan for YYYY-MM-DD"
git push
```

Review staged changes before committing. Use short imperative commit subjects of
at most one sentence. Validation failure prevents push; failed push is not deployment.
