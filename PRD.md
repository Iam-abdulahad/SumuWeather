# SuMo Weather — PRD.md

## 1. Overview

SuMo Weather is being rebuilt from its current UI into a visually distinctive, glassmorphism-based weather dashboard. It doubles as a portfolio centerpiece (front-end craft, live API integration, animation, accessibility) and a genuinely usable weather app.

## 2. Goals

- Ship a UI distinctive enough to stand out in a portfolio review, not a templated dashboard.
- Demonstrate integration of multiple live data sources (weather, geocoding, air quality, maps, geolocation).
- Stay on a fully free/keyless (or free-tier) API stack — no backend, deployable as-is on Netlify.
- Fully responsive, accessible (WCAG AA), and fast (Lighthouse ≥ 90 across the board).

## 3. Target Users

- **Primary:** recruiters/hiring managers reviewing the portfolio project.
- **Secondary:** anyone using it day-to-day to check the weather.

## 4. Feature Scope

### Phase 1 — MVP
- Location search with autocomplete (Open-Meteo Geocoding API) + "use my location" (browser Geolocation API)
- Current conditions: temperature, feels-like, condition + icon, humidity, wind speed/direction, pressure
- 24-hour hourly forecast (horizontal scroll)
- 7-day daily forecast
- Sunrise/sunset with visual arc
- Unit toggle: °C/°F, km/h ↔ mph
- Dynamic sky background tied to condition + day/night
- Recently searched / saved locations (localStorage — no auth needed)

### Phase 2 — Enhancements
- UV Index with risk-level scale
- Air Quality Index (Open-Meteo Air Quality API)
- Hourly precipitation-chance chart (Recharts or Chart.js)
- Interactive map (Leaflet + OpenStreetMap tiles; optional RainViewer precipitation-radar overlay, both free/keyless)
- Severe weather alerts where a data source supports it (e.g. US National Weather Service API); graceful "no active alerts" state elsewhere, since not every free source covers every country
- 10-day temperature trend line chart

### Phase 3 — Stretch
- PWA install support with offline cache of the last-fetched location
- Multi-location comparison view
- Export/share current conditions as an image card

### Out of scope
- User accounts / authentication
- Push notifications
- Native mobile app
- Any weather API that requires paid billing to function

## 5. Non-Functional Requirements

| Area | Target |
|---|---|
| Performance | First Contentful Paint < 2s; Lighthouse Performance ≥ 90 |
| Accessibility | WCAG AA contrast, full keyboard navigation, `prefers-reduced-motion` respected |
| Responsiveness | 320px–1920px, tested at mobile/tablet/desktop breakpoints |
| Browser support | Latest Chrome, Firefox, Safari, Edge |
| Reliability | Clear, in-voice error/empty states for failed geolocation, no search results, or API downtime |

## 6. Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Animation:** Framer Motion
- **Charts:** Recharts (or Chart.js)
- **Maps:** Leaflet.js — already used on the Local Legends project, so it's a reusable skill
- **Weather/geocoding/AQI data:** Open-Meteo (free, no API key required)
- **Location:** browser Geolocation API
- **Optional radar overlay:** RainViewer (free tiles)
- **Hosting:** Netlify (current host)

## 7. Key User Flows

1. **First visit:** browser prompts for location → dashboard loads local weather → if permission denied, falls back to a search prompt.
2. **Search:** type a city → glass autocomplete panel → select → sky crossfades and dashboard updates.
3. **Units:** toggle °C/°F or km/h/mph → all values convert instantly, no reload.
4. **Drill-down:** tap an hourly or daily tile → expands into a glass detail panel for that time slot/day.

## 8. Success Metrics

- **Portfolio:** used in job applications; positive feedback from recruiters/peers on visual distinctiveness.
- **Technical:** Lighthouse scores hit target, zero console errors, verified on real mobile devices.
- **Usability (if shared publicly):** return visits, saved-locations feature actually used.

## 9. Suggested Milestones

| Week | Focus |
|---|---|
| 1 | Design tokens + core components (glass card, search bar, unit toggle) |
| 2 | Data layer (API hooks, geolocation, search) + MVP screens |
| 3 | Dynamic sky backgrounds, motion, hourly/daily polish |
| 4 | Phase 2: AQI, UV, map, charts |
| 5 | Accessibility + performance pass, responsive QA, redeploy |
