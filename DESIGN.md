# GainMap visual system

Dark-first, mobile-first Hungarian workout companion. Training is first; analytics
follow all exercise cards. The opening screen shows the A/B plan, focus, and first
exercise at 375–430 px. Desktop uses two exercise columns within a 1180 px container.

Palette: background #101513, panel #19211d, text #eef3ed, secondary #a6b3aa,
progress lime #c7f894, repetition mint #86dfc5, correction amber #f1c38c.
System fonts avoid remote dependencies. Load and target reps dominate each card.
Rounded 22 px panels, faint borders, restrained gradients, and ample spacing create
depth. The original upward map mark is available as SVG and raster home-screen icons.

Strategy labels always include a symbol and producer-supplied reasoning: ↗ weight,
+ repetition, = hold, ↘ correction. Never encode meaning with color alone.
Decorative fallback illustrations use the same palette. Touch targets are ≥44 px.
Keyboard focus, semantic sections, details/summary, chart text alternatives, and
reduced-motion behavior are required. Avoid animated chart reveals.

Charts have explicit numeric axes, chronological x coordinates, units, subtle grids,
and expanded minimum domains to avoid exaggerating small changes. Missing metric
values break lines. A comparison group and unit never share a line with another.
Every detailed chart exposes readable values for keyboard and touch users.
Visible windows anchor to the last recorded session, with a full-history option.
