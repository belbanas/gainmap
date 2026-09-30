# GainMap visual system

Light, mobile-first Hungarian workout companion. White cards on #f7f8fa, text
#202530, secondary text #667080, restrained blue #2864d7. No green theme. System
fonts and local assets avoid external runtime dependencies.

Today, Progress and History are separate hash-routed views. Today's screen shows
the next A/B plan and one column of spacious exercise rows in a 940 px container.
Each row has an exercise-specific picture, title and per-set load × target reps.
Detailed reasoning, past results and coaching are collapsed under a 44 px summary.
The focus list is also collapsed. Rounded white panels, thin gray borders and
generous spacing keep the main plan readable at 375–430 px widths.

Original public Lyfta thumbnails were added at the user's explicit request; their
public sources and third-party ownership are documented in assets/exercises/README.md.
The site loads only local images. Missing artwork uses a local fallback.

Strategy labels combine text and a symbol: ↗ weight, + repetition, = hold,
↘ correction. Meaning never relies on color alone. Progress displays stored
coaching at the end of Progress; absent coaching has an honest empty state. Hypotheses are labeled and
alternative exercises include a condition. No advice is inferred in the browser.

Keyboard focus, semantic headings, details/summary, chart text alternatives and
reduced-motion behavior are required. Bottom navigation identifies the current
view. Charts use numeric axes, chronological coordinates, units, subtle grids and
expanded minimum domains. Missing values break lines. A line requires identical
exercise, comparison group and unit. Charts expose readable data for touch and
keyboard users. Windows anchor to the last recorded session; full history is optional.
