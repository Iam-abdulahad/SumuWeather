# SuMo Weather — Design.md

**Redesign direction:** Glassmorphism — the sky itself is the interface. Cards read as panes of glass or ice suspended over a living, shifting atmosphere, so the "frosted" surface isn't decoration, it's the metaphor: you're looking *through* weather at more weather.

---

## 1. Concept

The one bold move: the entire background is a slow-crossfading gradient driven by real data — current condition + time of day at the searched location. Every glass card sits on top of that live sky. This is the signature moment; everything else stays quiet and disciplined around it.

---

## 2. Color System

**Base tokens (fixed, regardless of sky state):**

| Token | Hex | Use |
|---|---|---|
| Cloud White | `#F5F7FA` | Primary text on dark/glass surfaces |
| Deep Atmosphere | `#0B1526` | Night fallback background, footer/scrims |
| Amber Flare | `#FFB454` | Primary accent — active states, current temp, focus ring, UV scale high-end |
| Storm Violet | `#7C6FF0` | Secondary accent — charts, night-mode highlights, secondary CTAs |
| Signal Red | `#FF6B6B` | Severe weather alerts only — never decorative |
| Glass Surface | `rgba(255,255,255,0.12)` fill, `rgba(255,255,255,0.25)` 1px border, `backdrop-blur: 20px` | Every card shell |

**Dynamic sky gradients** (background layer, crossfades on data change, ~1.2s ease):
- Clear day → `#4FA8E0 → #8FD3F4`
- Clear night → `#0B1526 → #1B2A4A`
- Cloudy → `#6B7B8C → #9AA7B0`
- Rain → `#33465A → #56707E`
- Storm → `#241B3A → #443A66`
- Snow → `#B9CBDA → #E7F0F7`

A thin dark scrim (`rgba(11,21,38,0.25)`) sits between the sky and the glass cards on light sky states, so Cloud White text always clears 4.5:1 contrast — checked per gradient, not assumed.

---

## 3. Typography

Two families, clearly distinct roles — not one default everywhere:
- **Space Grotesk** — big numerals only: current temp, hourly temps, the hero readout. Geometric and a little mechanical, which suits a data instrument rather than a lifestyle app.
- **Inter** — everything else: labels, body, nav, forecast lists.

Type scale (desktop): hero temp 96px/1.0, section heads 20px/1.3 (Inter, medium — no all-caps, no tracked-out eyebrows), body 15px/1.5, micro-labels 13px/1.4. Line length for any paragraph copy (about/empty states) stays under 70 characters.

---

## 4. Layout

Bento-grid dashboard, left-aligned content within each card (not centered blocks):

```
┌─────────────────────────────┬───────────────┐
│  HERO: location, temp,      │  7-DAY        │
│  condition, hi/lo, feels    │  FORECAST     │
│  like — largest tile        │  (vertical)   │
├───────────────┬─────────────┤               │
│ HOURLY (24h,  │  SUNRISE /  │               │
│ horiz scroll) │  SUNSET arc │               │
├───────────────┼─────────────┼───────────────┤
│ WIND          │  HUMIDITY   │  UV INDEX     │
├───────────────┴─────────────┴───────────────┤
│  AIR QUALITY (AQI) + PRECIPITATION CHART     │
├───────────────────────────────────────────────┤
│  MAP (radar/precip overlay, expandable)      │
└───────────────────────────────────────────────┘
```

Mobile: single column, same top-to-bottom priority (hero → hourly → daily → sunrise/sunset → wind/humidity/UV → AQI/chart → map). Tablet: 2-column. Desktop: the grid above, hero always largest tile.

---

## 5. Motion

One orchestrated moment, not scattered hover fades: the sky gradient crossfade on location/condition change is the only "big" animation. Beyond that, motion only answers a person's action:
- Tapping an hourly/daily tile expands it into a glass detail panel (spring, not fade-slide).
- Search results appear as the list is ready, not staggered for effect.
- A subtle, low-opacity particle layer (rain streaks / snowfall / sun rays) reflects the current condition behind the glass — kept faint enough to never compete with data.

`prefers-reduced-motion` disables the particle layer and the gradient crossfade (instant swap instead).

---

## 6. Components

- **Glass card**: shared shell (surface token above), 20px radius, used for every tile — but hierarchy comes from *size and position*, not extra borders or shadows layered on top.
- **Search bar**: pill-shaped glass input, live autocomplete dropdown as its own glass panel.
- **Unit toggle**: two-state pill switch, Amber Flare on the active unit.
- **Sunrise/sunset**: an actual arc (SVG) with a sun marker at current position along it — not just two timestamps in text.
- **AQI/UV scales**: horizontal gradient bar (green → amber → red) with a marker, plus the plain-language label ("Moderate", "High") — never just a bare number.
- **Alerts banner**: only appears when real alert data exists; Signal Red, dismissible, sits above the hero.

---

## 7. Accessibility floor

- Contrast checked per sky-state, not assumed from the base palette.
- Visible keyboard focus ring in Amber Flare on every interactive element.
- All icons carry text alternatives (screen-reader labels: "Partly cloudy", not just an icon).
- Reduced motion respected as above.
- Touch targets ≥ 44px on mobile.
