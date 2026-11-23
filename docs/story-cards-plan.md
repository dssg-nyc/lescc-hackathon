# LESCC story: card plan and wireframes

Plan for the LESCC storytelling app. Seven cards, each on its own page (URL hash and header label), with the same card mechanics as the 311 Wrapped reference at `311wrapped.com/10002`: segmented progress bar, one idea per card, a tap or count-up reveal, and a hold before the next card. We copy the mechanics, not their visuals, icons, copy, or assets. Every visual below is ours.

Status: plan only. Confirm the open decisions in section 7 before building.

## 1. Architecture

```
app/src/
  story/
    config.ts            seven cards in order: id, hash, label, color token, data file
    useCardHash.ts       #hash routing, sets document.title per card
    schema.ts            Zod schemas for each data file                     (new)
    cards/               one component per card (Intro, Crowd, Quiz, ...)   (new)
  components/
    StoryShell.tsx       segmented progress, header label, info/play/close, prev/next, keys, swipe
    CountUp.tsx          rolling-digit number, reduced-motion aware
    GuessTiles.tsx       A/B/C tap tiles with reveal
    RingMap.tsx          site + 0.5 mi, 1 mi, 2 mi rings, pins, zoom
    RankBars.tsx         ranked bars for the residential reveal
    Caveat.tsx           one-line caveat under every number
    SourceSheet.tsx      info sheet: sources, pull dates, method
  hooks/
    usePrefersReducedMotion.ts
    useInView.ts
public/data/*.json       written by scripts/build_data.py only
```

Rules carried over from the README and CLAUDE.md:
- The app reads only `public/data/*.json`. It never touches `data/raw/`.
- Every number on screen has a caveat and a source (the info sheet).
- Null values show "awaiting data", never a guess.
- Revenue comparables from Parks are café and parkhouse concessions. Never label them as food truck benchmarks.

## 2. Card list (7 cards)

Each card has its own hash and header label. The hash in the URL bar matches the progress bar segment.

| # | hash | Header label | Card | Mechanic (from 311 Wrapped) | Visual reference | Data file |
|---|---|---|---|---|---|---|
| 1 | `#intro` | INTRO | Background: population image, headline, Start | Dark title card, headline reveal | Image #1 (population-image1) as background | none |
| 2 | `#crowd` | FOOT TRAFFIC | Foot traffic past 76 Delancey St (source not yet found; see section 7, decision 1) | Yellow count-up card, big number | Image #2 | foot.json |
| 3 | `#quiz` | GUESS | Quiz: restaurants vs art and cultural centers in 10002 | Tap-a-tile guess, then reveal | Image #3 | quiz.json |
| 4 | `#residents` | YOUR MIX | Residential makeup in 10002 | Ranked reveal: top group first, then the list | Image #4 | acs.json |
| 5 | `#address` | HOTSPOT | 76 Delancey St: the address and its history | Map pin, large address block, timeline | Image 5 (request says "Image #6"; see section 7, decision 2) | site.json |
| 6 | `#demographics` | RINGS | Demographics in 0.5, 1, and 2 mile rings around the site, with 2024 income and prior years | Ring map + ranked list, trend line | none (new) | rings.json |
| 7 | `#value` | VALUE | Arts center vs food trucks: revenue streams, community, food supply | Side-by-side, semantic colors | none (new) | value.json |

Why these 7: they follow the card set in the request. The earlier 10-card list (intro, today, ring, baseline count/revenue, complaints, proposal, compare, who, close) is retired. The 311 complaint and proposal-series cards can return as an appendix after the model is built.

## 3. Interaction and motion per card

Shared behavior, matching the reference:
- **Progress bar:** 7 segments across the top. The current segment fills. Click a segment to jump.
- **Header row:** card label on the left. Info, play, and close on the right. Info opens the SourceSheet. Play replays the card's reveal. Close returns to `#intro`.
- **Navigation:** round prev and next buttons. Left and Right arrow keys. Swipe on touch. Next is disabled on the last card.
- **Page title:** `document.title` is "LESCC · <label>" so each card can be bookmarked and shared.
- **Card color:** each card sets a background token. Colors are semantic. Baseline (food trucks) uses zinc grey. Proposal (arts center) uses LESCC red. Do not swap them.

Timings (from `docs/311wrapped-motion.md`, measured):
- Card change: about 0.9 s of motion, slide up 32 px and fade in. Easing `cubic-bezier(.22,1,.36,1)`.
- Count-up: about 1.5 s with rolling digits.
- Hold: about 2 s of stillness after each transition.
- Small UI moves: 150 ms.
- Reduced motion: all of the above off. Show final values at once. Arrow keys and taps still work.

Per-card motion:
- `#intro`: headline reveal, line draws under the title, 320 ms.
- `#crowd`: count-up and a bar that grows under the number.
- `#quiz`: tiles fade in. A tap locks the choice and runs a count-up of both counts.
- `#residents`: bars fill from zero, largest first, 80 ms stagger.
- `#address`: map zooms from the block to the 0.5 mi ring over the same 1.5 s as the timeline draw.
- `#demographics`: rings draw outward (600 ms). The list counts up with the rings.
- `#value`: bars grow from zero, 600 ms, staggered.

## 4. Wireframes (mobile, 390 px)

Every card ends with `[caveat]` and `[src]` (the info sheet opens from both).

### 1. `#intro`: INTRO
```
+--------------------------------+
|  LESCC · 76 DELANCEY ST        |
|  ▮▮▯▯▯▯▯                       |
|  INTRO            (i) (▶) (×)  |
|                                |
|  [ population-image1 bg ]      |
|  Two futures                   |
|  for one corner.               |
|  [ Start -> ]                  |
+--------------------------------+
```
- Background is Image #1 with a dark overlay, so the headline passes WCAG AA contrast.

### 2. `#crowd`: FOOT TRAFFIC
```
+--------------------------------+
|  FOOT TRAFFIC        (i) (▶) (×)|
|  People who pass the corner    |
|  per day                       |
|       ~ 0 ,000                 |  <- CountUp, 1.5 s
|  ▇▇▇▇▇▇▇▇▇▇▇▇ bar              |
|  [awaiting data]               |
|  [caveat] [src]                |
+--------------------------------+
```
- Foot traffic has no source in `data/` yet. The card shows "awaiting data" until a source is pulled. Do not show a placeholder number.

### 3. `#quiz`: GUESS
```
+--------------------------------+
|  Before we tell you            |
|  Which is more in 10002?       |
|  [ A  Restaurants ]            |
|  [ B  Art & cultural centers ] |
|  Tap a tile to guess           |
|  -- after tap --               |
|  Restaurants: N   Centers: M   |  <- CountUp, 1.5 s
|  [caveat] [src]                |
+--------------------------------+
```
- Answer key comes from `quiz.json`, not hard-coded.
- Data: restaurants and centers need a citywide source. The DPR eateries feed covers parks concessions only, so it cannot answer this quiz alone.

### 4. `#residents`: YOUR MIX
```
+--------------------------------+
|  Your #1 group in 10002        |
|  [group name]                  |
|  NN% of residents              |
|  1 · group   NN%  ▇▇▇▇▇▇▇      |
|  2 · group   NN%  ▇▇▇▇         |
|  3 · group   NN%  ▇▇           |
|  [caveat] [src]                |
+--------------------------------+
```
- Groups are ACS categories (for example household type, tenure, age band, or race and ethnicity). Pick one set and state it on the card.

### 5. `#address`: HOTSPOT (76 Delancey St)
```
+--------------------------------+
|  The address                   |
|  76 DELANCEY ST                |  <- big block, like the reference
|  New York, NY 10002            |
|  [map: pin on the site]        |
|  History                       |
|  1950s ── ● ── 2020s           |  <- timeline, tap each point
|  toilet → street → art         |
|  [caveat] [src]                |
+--------------------------------+
```
- The history needs sources before it is written. The content must not be invented. Sources to pull: NYC Parks and DPR records for the site, NYC Landmarks and planning records, and press archives. The timeline stays "to research" until each point has a source.
- Interaction: tap a timeline point for the fact and its source.

### 6. `#demographics`: RINGS
```
+--------------------------------+
|  Within 0.5, 1, and 2 miles    |
|  [ring map: three rings]       |
|  Population   0.5 mi  1 mi 2 mi|
|  Median income  2024 values    |
|  Trend 2019–2024 ───●          |
|  Projection: trend only        |
|  [caveat] [src]                |
+--------------------------------+
```
- Source: ACS 5-year tract data. 2024 income for each ring, prior vintages for the trend. Use area weights for tracts that cross a ring boundary, and say so in the info sheet.
- Projected income is a trend extrapolation, shown as a range. It is not a forecast and not a causal effect.

### 7. `#value`: VALUE
```
+--------------------------------+
|  Arts center vs food trucks    |
|  Revenue streams               |
|  Food trucks  ▓▓▓░░░  [range]  |  <- grey
|  Arts center  ▓▓▓▓▓▓  [range]  |  <- red
|  Community   [ list of proxies ]|
|  Food supply  units in ring    |
|  Not a like-for-like comparison|
|  [caveat] [src]                |
+--------------------------------+
```
- Revenue for food trucks is not public. Show a range with its assumption. Parks café and parkhouse numbers are shown only as concession comparables, never as food truck numbers.
- Arts-center revenue has no source in `data/` yet. The Americans for the Arts AEP6 benchmarks are the lead. Add them to `data/README.md` before they appear.
- Community and food supply use the proxies in the README (count of units from the DPR eateries feed; 311 and civic signals to be defined).

## 5. Desktop layout (applies to all cards)

- Story column about 1000 px wide, centered.
- Map and chart cards (`#address`, `#demographics`, `#value`) use a two-column split above 900 px.
- Progress bar full width above the card.
- Keyboard: Left and Right change cards. Sliders and tiles stay keyboard-operable.

## 6. Build order

1. **Shell:** StoryShell (progress, header, info/play/close, prev/next, keys, swipe, hash routing), CountUp, Caveat, SourceSheet. Check at 320 and 1440 px.
2. **Data contract:** `schema.ts` with Zod for each JSON file. Update `build_data.py` to write the real shapes.
3. **Static cards:** `#intro` (Image #1), `#address` (text and map, history marked "to research").
4. **Data cards:** `#residents`, `#demographics`, `#value`, `#crowd`, `#quiz`. Use "awaiting data" until each pull lands.
5. **QA:** Playwright screenshots at 320, 768, 1024, 1440 for all 7 cards; reduced-motion run; keyboard-only run; Lighthouse against the performance budget.

Tests per the repo rules: Vitest for schema and hook logic, Playwright for the 7-card flow.

## 7. Decisions needed

1. **Card 2: decided, foot traffic** (user, 2026-11-21). No source in `data/` yet, so the card shows "awaiting data" until one is pulled. Candidates to find: NYC DOT pedestrian or bike counts near the site, or a paid foot-traffic dataset (needs licensing review first). Record the chosen source in `data/README.md`.
2. **Card 5 image:** the request labels the address card "Image #6". No Image #5 was attached. I used the hotspot screenshot as the reference for this card. Confirm.
3. **Look: decided, mechanics only** (user, 2026-11-21). Same card flow, hash pages, progress bar, and reveals. Our own colors, icons, and copy.
4. **Basemap** for the ring and address maps: MapLibre GL with a free vector style, or a flat SVG outline of the study area?
5. **Dependencies:** zod, maplibre-gl (if chosen), vitest, @playwright/test.

## 8. Risks

- **Data arrives late.** Cards 2 to 7 depend on pulls that are not done. Build with "awaiting data" visible. Never show a placeholder number as a result.
- **Missing sources.** Foot traffic, restaurant and cultural-center counts, arts-center revenue, and the 76 Delancey St history all need sources. Do not fill them from memory.
- **Revenue comparison.** The $1,000/day coffee concession and the ~$40k/yr vendor profit are different measures. Show both and label them. Parks café comparables are not food truck benchmarks.
- **Projection overreach.** Income projections are trend extrapolations. Show a range, label the method, and never call them an effect of the arts center.
- **Motion over-use.** Seven cards with count-ups can feel busy. Keep one signature motion per card.
- **Accessibility.** Maps need a text alternative per card (counts in a list). Charts need a table view in the info sheet.
- **Brand.** Matching the reference's look, icons, or copy would copy someone else's design. Keep the mechanics and build our own assets.

## 9. Implementation plan

Sources: this file, `docs/311wrapped-motion.md` (measured timings), `docs/311wrapped-journey.md` ("Patterns to borrow", journey mechanics). Status: awaiting confirmation. No code written.

### 9.1 What we borrow, mapped to cards

| Pattern (journey / motion doc) | Where it lands |
|---|---|
| Hash route per card, reloadable, shareable | All 7. `useCardHash` replaces `useChapterHash` |
| Segmented progress bar, header label, info / play / close | `StoryShell` |
| Prev / next, Right arrow advances, Left goes back | `StoryShell`, plus swipe |
| "Preparing the map and cards" loading state | `StoryShell` until all JSON parsed |
| One idea per card: one number, one chart, one line | Card layout rule, checked in review |
| Guess, then reveal (journey cards 3–4) | `#quiz`. Only ship if `quiz.json` has a clear answer |
| Count-up with rolling digits, ~1.5 s | `#crowd`, `#quiz` reveal, `#demographics` list |
| Map zoom in the same window as the count-up | `#address` (block → 0.5 mi), `#demographics` rings |
| Pin appears after zoom settles | `#address` |
| Bar grows during count-up | `#crowd`, `#residents`, `#value` |
| Hold ~2 s after each transition | Autoplay timer only. Manual nav never blocked |
| Comparison to a reference (median / baseline line) | `#value` (dashed baseline), `#demographics` (borough median) |
| Semantic color, solid vs faded for years | `#value` baseline vs proposal; `#demographics` prior years faded, 2024 solid |
| Caveat on the card | `Caveat` on every card that shows a number |
| Shareable end card (Send, Copy, Save poster) | `#value` footer: Copy link, Share (Web Share API). Poster export deferred |
| No sound by default | No audio |
| Reduced motion turns everything off | `usePrefersReducedMotion` gates every animation |

### 9.2 Motion tokens (add to `app/src/styles/tokens.css`)

```css
--dur-card: 900ms;      /* card change, measured ~0.9 s */
--dur-count: 1500ms;    /* count-up and map zoom, same window */
--dur-hold: 2000ms;     /* autoplay hold after transition */
--dur-ui: 150ms;        /* small UI moves, 150–350 ms band */
--dur-draw: 600ms;      /* rings, bars */
--stagger: 80ms;
--ease-story: cubic-bezier(.22,1,.36,1);
```
Only `transform`, `opacity`, `clip-path` animate. Bars use `scaleX` from 0, not `width`.

### 9.3 Phases

**Phase 0: Reconcile with existing code (S)**
- `app/` already has `story/config.ts` (5 chapters: today/baseline/proposal/map/who), `useChapterHash.ts`, `App.tsx`, `tokens.css`, and `public/data/{site,baseline,proposal,map,who}.json`.
- Replace the 5-chapter config with the 7-card config. Keep `site.json`; retire the others once their content moves into `value.json` and `rings.json`.
- Color fix: `tokens.css` sets `--color-proposal` to green (`--accent`), but this plan says LESCC red. Pick one before building (see decision 6).
- Add `population-image1` to `app/public/img/` (not found in repo; user to provide). Export AVIF/WebP at 1x and 2x.

**Phase 1: Shell (M)** — tests first
- `useCardHash(ids)`: read hash, fallback `#intro`, set `document.title`, return `[index, go]`. Vitest: unknown hash, clamp, back button.
- `StoryShell`: progress segments (click to jump, `aria-current="step"`), header label, info / play / close, prev / next, keys, swipe (pointer events, 40 px threshold), loading state.
- Autoplay: off by default. Play starts timer = card motion + `--dur-hold`; pauses on any input or hidden tab.
- Card transition: outgoing fades, incoming slides up 32 px + fades over `--dur-card`. Focus moves to the card `h1`.
- `CountUp`: rAF, rolling digits per column, `tabular-nums`, final value in an `aria-live="polite"` sr-only span. Vitest with fake timers.
- `Caveat`, `SourceSheet` (`<dialog>`, focus trap, Esc closes).

**Phase 2: Data contract (M)**
- Add `zod`. `schema.ts`: one schema per file, all numeric fields `number | null`, each file has `source[]`, `pulled`, `caveat`.
- Loader: fetch all 7 files in parallel; on schema fail show "data unavailable" on that card only.
- `scripts/build_data.py` writes the new shapes with nulls where data is missing. Python test checks the JSON validates the same shape.

**Phase 3: Static cards (S)**
- `#intro`: image bg + dark overlay (AA contrast), headline, line draw 320 ms, Start → `#crowd`. Hero image `fetchpriority="high"`.
- `#address`: big address block, map with pin, timeline points marked "to research" until sourced.

**Phase 4: Data cards (L)** — each ships with "awaiting data" first
- `#crowd`: CountUp + bar. Null today.
- `#quiz`: `GuessTiles` (radio group, keyboard), lock on choice, reveal both counts via CountUp, right/wrong state from `quiz.json`.
- `#residents`: `RankBars`, largest first, 80 ms stagger, top group as headline.
- `#demographics`: `RingMap` (rings draw outward 600 ms) + table per ring; trend sparkline 2019–2024, prior years faded, 2024 solid, projection as dashed range band.
- `#value`: paired bars, baseline grey, proposal semantic color, dashed baseline reference, "Not a like-for-like comparison" caveat, share footer.

**Phase 5: QA (M)**
- Playwright: 7-card flow by keys, by buttons, by direct hash load; reduced-motion run (final values at once); screenshots at 320, 768, 1024, 1440; no horizontal overflow at 320–390 px.
- axe check per card. Lighthouse vs budget (app page: JS < 300 kb gz; map lib lazy-loaded only on `#address` / `#demographics`).
- Coverage ≥ 80% on hooks, schema, loader.

### 9.4 Dependencies

`zod`, `vitest`, `@testing-library/react`, `@playwright/test`, `@axe-core/playwright`. `maplibre-gl` only if decision 4 picks it (dynamic import). Otherwise SVG rings, no map dep.

### 9.5 Added decisions

6. **Proposal color:** code uses green, plan says red. Which?
7. **Autoplay:** off by default with Play to start (recommended), or on like the reference?
8. **End card:** add a share footer on `#value`, or an 8th `#summary` card like the reference?

### 9.7 Decisions applied (user, 2026-11-21)

1. **Palette:** proposal = green (`--accent`). Supporting: white, zinc grey, dark (zinc-900/950). Baseline (food trucks) stays grey. Card backgrounds rotate white / dark / green-soft; never red.
2. **Autoplay on**, like the reference. Hold = **5 s** (`--dur-hold: 5000ms`) after each card's motion. Pauses on any tap, key, hidden tab, open info sheet, and on `#quiz` and `#summary` until the user answers. Play/pause in header.
3. **Story grows to 9 cards:**

| # | hash | label | card | data |
|---|---|---|---|---|
| 8 | `#summary` | WRAPPED | Recap of cards 2–7 + vote: Food Truck or Cultural Center | votes API |
| 9 | `#results` | RESULTS | Vote tally: bars count up, user's pick highlighted, share | votes API |

   - Vote tiles reuse `GuessTiles`. One vote per browser (localStorage flag + server-side check by anonymous id). `#results` is locked until a vote is cast; direct hash load without a vote redirects to `#summary`.
   - **Needs a backend.** The app is static, so a shared tally needs a small store. Proposal: one serverless function + one table (`votes`: choice, created_at, anon_id hash). Options: Supabase or a Vercel function with KV. Rate limit per IP, validate choice enum, no personal data stored. Fallback if API down: show "results unavailable", keep the user's own pick.
   - Results caveat: "Self-selected visitors. Not a survey or a poll of residents."
4. **Map: SVG.** 311 Wrapped's map library could not be confirmed (bundle analysis ran out of memory). Its maps are tiled street basemaps with choropleths, which suggests a WebGL map library. We use flat SVG (study-area outline, rings, pin) for zero dependencies and a small bundle. MapLibre stays an upgrade path.
5. **Card 5 reference:** hotspot screenshot confirmed.

Progress bar and Playwright flow now cover 9 cards. New phase between 4 and 5: **Phase 4b, vote API (M)**: schema, function, rate limit, tests, security review.

### 9.6 Complexity

Shell M, data contract M, static cards S, data cards L (blocked on pulls), QA M. Cards can ship in "awaiting data" state before any pull lands.

### 9.8 Status (2026-11-22)

- Phases 0–4 built. 70 Vitest tests (93% statements), 14 pytest tests. Playwright walkthrough of all 9 cards at 320, 390, 1440: no overflow, no console errors.
- Vote is stored per browser. `#results` shows "results unavailable" until Phase 4b (Vercel function) supplies the tally.
- Waiting on: `population-image1` (intro falls back to a gradient), `CENSUS_API_KEY` (income trend and projection), food truck and arts-center revenue sources, history before 1956.

### 9.9 Decisions (user, 2026-11-22)

- **Vote store: Google Sheet, not Vercel.** Apps Script web app (`scripts/google-sheet-vote/`) appends `[timestamp, choice]` and returns the tally. Endpoint in `VITE_VOTE_ENDPOINT`. No server of our own, no personal data. Phase 4b (Vercel) dropped.
- **Income trend: hardcoded from published ACS.** No Census key. ACS 5-year B19013 via DataUSA for Lower East Side & Chinatown (PUMA 3604103, CD3) and Manhattan, 2013–2024, saved as dated snapshots in `data/external/`. 2029 trend range from 2013–2024 and 2019–2024 growth rates, nominal dollars, labelled as a trend, not a forecast.
