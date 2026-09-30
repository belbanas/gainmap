# Foundation verification

Verified locally through an HTTP server on 2026-09-30.

* Data validator and regression suite pass using Node.js standard libraries.
* All created text files read; all JSON/manifests parsed and SVGs XML-parsed.
* Browser visual checks: 375×812, 430×932 mobile and 1280×900 desktop.
  No horizontal overflow; first load and rep targets are visible on mobile.
* Explicit empty state loads visibly labeled synthetic demo; no real data included.
* Empty latest with demo unavailable shows intentional empty plan/history/PR states.
* Invalid latest JSON shows “Nincs még aktuális edzésterv” without crashing.
* Missing history preserves all four current exercise cards and shows a notice.
* Upstream error preserves all four retained plan cards and displays a warning.
* Missing exercise images resolve to the loaded local fallback SVG.
* All four Hungarian strategy labels are rendered. Repetition selector changes the
  detailed chart; history button expands from 10 to 24 sessions.
* Regression suite covers incompatible units/groups, null chart gaps, malformed
  dates, invalid reps, missing session references, unsupported schema versions,
  forbidden nested keys, and unsafe image paths.
* Credential/identity pattern scan has no matches; metadata-key scan passes.

Tests restore original empty latest/history and synthetic demo before commit.
GitHub Pages setup and deployment are separate from local QA. No backend, build,
service worker, runtime authenticated API, or scheduled Lyfta access is included.

## Real Lyfta import verification (2026-09-30)

20 sessions (2026-08-17 through 2026-09-30), 177 load/repetition exercise records,
and 17 duration-only exercise entries imported through the read-only connector.
The user confirmed kilograms and that every populated load/reps set is a performed
working set, despite the connector's false completion flags. External IDs, titles
other than A/B, raw responses, and comments are not persisted. Raw notes are not
available in this connector. Machine identity is not assumed; unidentified machines
use separate local session groups. Dumbbell movements and matching bodyweight
movements remain separate from machines. No machine-wide PRs or trends are invented.

The last completed session is B; the next A plan contains 9 exercises and 17 sets.
Targets preserve per-set loads. Free-weight repetition targets only increase after
observed same-load first-set improvement; unverified machines use HOLD for the
previous setup. No unverified load-unit conversion or strength estimates added.
Duration strings are converted from mm:ss into stored integer seconds.

Validation and regression tests pass for mixed-load volume, per-set load lengths,
primary-load agreement, and timed-set durations. Browser at 375 px verifies real
mode, 9 cards, explicit 32/26 kg prescription, and no horizontal overflow. Selector
retains useful groups (26 choices) while preserving all underlying history records.
