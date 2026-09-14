# SuMo Weather

React + Tailwind, deployed on Netlify, Open-Meteo APIs, no backend.

Before writing any code, read `style.md` (colors, type, layout, motion) and
`PRD.md` (feature scope, phases, tech stack). Follow both exactly — don't
invent your own palette, fonts, or component patterns.

## Current phase: Phase 1 (MVP) only

- Glass-card UI + dynamic sky-gradient background (crossfade on data change)
- Search (Open-Meteo Geocoding) + geolocation fallback
- Current conditions, 24h hourly, 7-day daily, sunrise/sunset arc, unit toggle
- Bento-grid layout, mobile-first responsive
- Framer Motion only for the sky crossfade + tile expand; respect
  prefers-reduced-motion
- WCAG AA contrast, visible keyboard focus

Stop and check in before starting Phase 2 (AQI, UV, map, charts, alerts) —
don't build ahead of the current phase without asking.
