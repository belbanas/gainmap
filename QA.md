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
