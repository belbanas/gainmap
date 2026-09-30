# GainMap schema v1

JSON uses UTF-8. Required means the field must exist. Optional fields may be omitted;
only fields explicitly listed as nullable accept null. All numeric values are finite,
nonnegative, ≤10,000,000 unless marked signed. Reps/sets are integers. Strings are
nonempty, ≤500 characters. IDs are local lowercase hyphen-separated slugs (example
`chest-press`); no external identifiers. Dates are real calendar `YYYY-MM-DD` values.
Timestamp format is UTC ISO `YYYY-MM-DDTHH:mm:ss[.sss]Z`.

Frontend tolerates unknown additive fields but validates required known fields;
publication validator rejects unknown fields until this contract and allowlists are
reviewed. Unsupported schemaVersion is rejected. Invalid documents are isolated;
missing history does not invalidate the current plan. Optional numeric estimates
missing/null break chart lines. Chart groups require identical exercise, group, unit.

## latest.json / demo.latest

| Field | Type / required | Values, meaning, example |
|---|---|---|
| schemaVersion | integer, yes | Exactly 1 |
| generatedAt | timestamp, yes | Recommendation creation, `2026-09-28T05:00:00Z` |
| status | string, yes | ready, empty, upstream_error |
| workoutType | string or null, yes | A/B; null only for empty |
| mainFocus | string[], yes | 0–3 reviewed guidance items |
| exercises | exercise[], yes | Nonempty for ready; empty for empty; retained plan for upstream_error |
| summary | string, optional | Short reviewed workout introduction |
| coaching | object/null, optional | Stored scheduled assessment; see Coaching below |

Empty status explicitly enables synthetic demo fallback. It must never be used to
replace valid real data after upstream failure. upstream_error may have an empty
exercise array only when no previous valid plan exists; otherwise retain the plan.

## Exercise object

| Field | Type / required | Meaning / example |
|---|---|---|
| id | slug, yes | Stable local exercise ID, chest-press |
| name | string, yes | Display name, Chest Press |
| displayName | string, optional | Short display label; name remains the source exercise name |
| image | string/null, optional | assets/exercises/chest-press.svg; local svg/png/webp/jpg |
| coaching | object/null, optional | Exercise-specific stored assessment; see Coaching below |
| weight | number, yes | Recommended first working-set load, 70 |
| workingWeights | number[], optional | One load per working set, e.g. [70,60]; first equals weight. Omission means weight applies to every set. Not nullable. |
| unit | string, yes | Preserved unit, kg; no implicit conversion |
| sets | integer, yes | Working sets, 3; reps array must have this length |
| targetReps | integer[], yes | One target per set, [10,10,9], nonempty |
| repRange | object/null, optional | `{ "min":8, "max":12 }`, integer min ≤ max |
| strategy | enum, yes | WEIGHT_INCREASE, REP_PROGRESSION, HOLD, CORRECTION |
| previous | performance/null, yes | Most recent comparable result; null when absent |
| reasoning | string, yes | Reviewed concise recommendation explanation |
| progressSummary | string/null, optional | Factual producer-derived summary |
| comparisonGroup | slug, yes | Local comparability label, chest-press-machine-1 |
| pr | boolean, optional | Producer marked recent PR; omitted means no badge |
| change | object/null, optional | Required signed finite weight and totalReps deltas versus previous |
| estimatedStrength | number/null, optional | Producer's load-unit strength estimate |
| estimated1RM | number/null, optional | Estimated maximum in the same load unit |
| chart | point[], optional | Same-group weight sparkline fallback if history absent |

Strategy mapping: SÚLYEMELÉS, REP-PROGRESSZIÓ, TARTÁS, KORREKCIÓ.
Reasoning is supplied by the future coach, not invented by the browser.
Change fields and optional estimates are supported storage; card targets and history
charts remain the primary display. Do not insert identifying text into these strings.

### previous performance

All fields required: `date` (date), `weight` (number), `unit` (string), `sets`
(integer), `reps` (nonempty integer array, one per set), `comparisonGroup` (slug).
Optional `workingWeights` uses the same rules as the exercise array and preserves
mixed loads. Unit and comparisonGroup must match the parent exercise. Example: 70 kg, three sets,
[10,10,8]. No external ID or free-text notes.

### chart point

All fields required: `date` (date), `value` (nonnegative working weight),
`comparisonGroup` (slug identical to parent), `unit` (same as parent).
Example: `{ "date":"2026-09-25", "value":70,
"comparisonGroup":"chest-press-machine-1", "unit":"kg" }`.

## history.json / demo.history

Required top-level fields: `schemaVersion` (exactly 1), `sessions` (session array),
`records` (performance record array). Empty arrays are valid. Preserve full history.

### Session

| Field | Type / required | Meaning |
|---|---|---|
| id | slug, yes | Generated local session ID, session-001; not source workout ID |
| date | date, yes | Completion date |
| workoutType | A/B/null, yes | Actual completed workout; null for an unclassified session |
| durationMinutes | number/null, optional | Duration if available |
| timedExercises | object[], optional | Duration-only exercises; each requires local id (slug), name (string), durationSeconds (nonempty array of nonnegative integer seconds, one per recorded set). No weight or fabricated reps. |

IDs are unique. Multiple sessions on one date are allowed and counted separately.
Timed exercises are displayed within session history. They do not enter load/reps
charts or volume calculations. Example: Front Plank with durationSeconds [94,94].

### Performance record

| Field | Type / required | Meaning |
|---|---|---|
| sessionId | slug, yes | References a local session |
| date | date, yes | Must match referenced session date |
| exerciseId | slug, yes | Matches stable exercise id |
| name | string, yes | Exercise display name |
| comparisonGroup | slug, yes | Reviewed machine comparability group |
| weight | number, yes | First working-set load, chart's primary weight |
| workingWeights | number[], optional | All working-set loads in order; first equals weight; one per rep value; omission means uniform load |
| unit | string, yes | Source load unit |
| sets | integer, yes | Working-set count |
| reps | integer[], yes | One result per working set, nonempty |
| totalReps | integer, yes | Exact sum of reps |
| volume | number/null, optional | Sum of each working-set weight × reps, in load-unit·reps |
| estimatedStrength | number/null, optional | Same-unit estimate |
| estimated1RM | number/null, optional | Same-unit 1RM estimate |
| pr | boolean, yes | Explicit producer decision |
| prType | enum/null, optional | weight, reps, totalReps, estimatedStrength, estimated1RM |
| workoutType | A/B/null, yes | Must match session |
| progressionResult | enum, yes | improved, stable, dip, unknown |

One record per session/exercise/group. Different unit histories remain separate even
if their group names match. Mixed-load working sets use workingWeights; never imply
every set used the first load. Weight charts compare first working-set load; estimates
may use only same-method comparable sets. Volume does not assume doubled dumbbell
or unilateral loads unless that meaning is explicitly documented by the source.
For `reps` PRs the UI shows total reps at the stored load; PR criteria remain producer
responsibility. This foundation's demo estimates use Epley on the best working set,
weight × (1 + max reps/30), for demonstration only. Future estimates must use a
consistent documented calculation within a comparison group.

## Coaching

Optional `latest.coaching` and `latest.exercises[].coaching` are null or objects.
The browser displays these fields and never generates training advice. Missing/null
shows an empty assessment state; the scheduled producer supplies the content.
All fields below are required when an object exists. Text uses the same 500-character
limit and privacy rules as other strings; empty arrays are allowed.

| Field | Type | Meaning |
|---|---|---|
| generatedAt | timestamp | Assessment creation time |
| assessment | enum | improving, stable, mixed, needs_attention, insufficient_data |
| evaluation | string | Concise Hungarian progress evaluation |
| evidence | string[] | Factual observations from comparable working sets |
| advice | string[] | Practical next steps |
| possibleCauses | object[] | Each requires text (string), confidence (hypothesis or supported) |
| alternative | object/null | A conditional substitution: name, reason, condition (all strings), optional startingPlan below |
| followUp | string[] | Questions needed to clarify insufficient evidence |

Never present a possible cause as established without evidence. The UI labels
hypotheses explicitly. A substitution is a suggestion, not a silent plan change.
Do not store identifying comments or raw source notes in any coaching text.

### Alternative starting plan

`alternative.startingPlan` is optional and nullable for compatibility. An object
requires `weight` (first working-set load), `unit` (kg), `sets` (integer),
`targetReps` (nonempty integer array, one per set), `basis` (comparable_history or
estimate), and `reasoning` (string explaining the source and limits). Optional
`workingWeights` preserves mixed loads and obeys the exercise weight-array rules.
These are proposed starting targets, never completed lifts or PRs.

Prefer the alternative exercise's own comparable history. A load from a different
exercise or machine is not an equivalent kg value. A defensible starting estimate
must be labeled estimate and explain its basis; missing evidence leaves startingPlan
null with a followUp question rather than inventing a precise load. The card is
visible on the original exercise, outside collapsed details; no program replacement
or cross-group chart comparison occurs automatically.

## demo.json

Required fields: `schemaVersion` (1), `synthetic` (exactly true), `latest` (latest
object), `history` (history object). Demo content belongs to no real user. It must
remain labeled Demo adatok when rendered. Replace latest/history with ready real
documents to leave demo mode without editing frontend files.

## Validation and security

`node scripts/validate-data.mjs` validates every JSON under data/, required files,
schema versions, fields, enums, numeric types, rep lengths/sums, dates, local assets,
comparability, duplicate keys at record level, references, and suspicious metadata
keys. Unknown publication fields are rejected. Exit code is nonzero on any failure.
Review allowed string values manually: a key scanner cannot detect every identity
embedded in an otherwise permitted field. See SECURITY.md.
