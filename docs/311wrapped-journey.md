# 311 Wrapped: journey study (ZIP 10002)

Study of the story flow at https://311wrapped.com/10001, captured 2026-11-21. Used to design our storytelling app. We borrow structure and interaction patterns only. We do not copy their copy, art, icons, or data.

## How the journey works

- **Entry:** home page at `/` lets the user search by neighborhood, city, or 5-digit ZIP. Featured cards show sample neighborhoods, with a year toggle (2026 / 2025 full year).
- **Story route:** `/{zip}#{card}`. Each card is a hash route, so the URL shows the current card and can be shared.
- **Length:** 18 cards. A segmented progress bar sits at the top. The header shows the story name (for example "VOLUME") and buttons for info, play/pause, and close.
- **Navigation:** previous/next buttons on each card. The Right arrow key advances. A close "x" sits bottom-right.
- **Loading:** a "Preparing the map and cards" state shows for several seconds on first load before the story is ready.
- **End card:** a summary card with actions: Send, Copy, Save poster, Another ZIP.

## Card-by-card

| # | Hash | Chapter label | Headline | What it shows |
|---|---|---|---|---|
| 1 | `#intro` | INTRO | 10001 · 14,957 complaints, Jan 1–Oct 24 | "One every 29 minutes." Animated area outline over a street map. |
| 2 | `#volume` | VOLUME | 14,957 · −17.8% vs 2025 · #102 of 191 ZIPs | Big number and trend chip. Choropleth of all NYC ZIPs (yellow ramp). Ranked bar chart of every ZIP, with this ZIP in white and a dashed median line. |
| 3 | `#guess` | GUESS | "Guess your #1": A residential noise, B illegal parking, C encampment | Quiz. Tap a tile on a dot map to guess. Each dot is one report. |
| 4 | `#reveal` | YOUR #1 | Encampment, 2,669 reports, 1 in 6 complaints | Answer reveal. Top three with counts and shares. Dot map (200 of 2,669 shown). "Send your #1 to a friend". |
| 5 | `#day` | YOUR DAY | Busiest hour: 8AM | 24-hour axis (12AM–12PM–12AM). Tuesdays busiest. Dashed band marks after-dark hours, 10PM–3AM (18.4% of reports). |
| 6 | `#year` | YOUR YEAR | Busiest day: May 5 (101 complaints, 2× a normal day) | Month strip J–D. Biggest month called out (June, led by encampment). |
| 7 | `#hotspot` | HOTSPOT | Busiest address: 330 West 30th St (300 complaints) | One building, one dot per residential-noise report. Makes one address concrete. |
| 8 | `#turf` | ON THE MAP | Encampment vs illegal parking by area | Split map on ~250 m squares. Blank squares mean too few reports. Counts of squares where each is more common. |
| 9 | `#encampments` | ENCAMPMENTS | 9,731 reported locations citywide; 389 in 10001 (4.0%) | Dot map. Caveat on the card: dots are reported locations, not verified encampments or people. |
| 10 | `#agencies` | REPORT CARD | Half close within 4 HRS (median NYC ZIP: 9 hours) | Grade badge. Bar ladder by agency (NYPD <1H, DHS 12H, DOT 40H, TLC 4D). MAP toggle for a by-ZIP view. |
| 11 | `#lowlights` | LOWLIGHTS | Slowest to close: 17 weeks (taxi complaints) | Timeline with one dash per week. Context: 1 in 10 complaints waited more than 17 days. |
| 12 | `#quiet_wins` | QUIET WINS | Obstruction −63% (437 → 163) | Paired bars. 2025 faded, 2026 solid. Three categories with before/after counts. |
| 13 | `#distinct` | ONLY HERE | Encampment 15× the NYC share (17.8% vs 1%) | Ratio bars against a dashed 1× line. Top three categories with multipliers. |
| 14 | `#personality` | PERSONALITY | "Jack of All Gripes" | Persona label built from the data. Top three share = 36% of complaints. |
| 15 | `#twins` | TWINS | Cosmic twin 10003; evil twin 11230 | Compares this ZIP to two others by complaint mix. Playful copy. |
| 16 | `#rats` | RATS | Peak in October | Month strip J–D. Subway lines serving the ZIP named. |
| 17 | `#subway` | SUBWAY | 23 St: 13 rodent reports within 200 m | Nearest stations, tick mark per report, busiest five shown. |
| 18 | `#summary` | WRAPPED | Shareable recap | Top complaints and busiest hour. Send, Copy, Save poster, Another ZIP. |

## Patterns to borrow

- **Hash route per card.** Every card is linkable and reloadable. Our app should do the same.
- **One idea per card.** One headline number, one chart, one plain-language line.
- **Guess, then reveal (cards 3–4).** A quiz before the answer is a strong engagement device. Use only where the data gives a clear answer.
- **Semantic color.** Yellow ramp for volume. Separate colors for encampment vs illegal parking. Solid vs faded for 2026 vs 2025.
- **Caveats on the card.** Card 9 states what the dots do not prove. Every proxy and assumption in our model needs the same line.
- **Comparison to a reference.** Cards 2, 10, and 13 each compare to a median or a share baseline. Our proposal-vs-baseline section should follow this.
- **Shareable end card.** Card 18 offers Send, Copy, and Save poster. We should plan a poster export.

## Mobile vs desktop

- **Desktop:** story column centered, about 700 px wide, with wide margins on both sides. The volume card has a yellow background.
- **Phone width (390 px):** same centered column, scaled down. One screenshot only (volume card). Horizontal overflow, touch behavior, and other cards were not checked.

## Not captured

- REA's bundle analysis (option 1) ran out of memory on this site at every setting tried. This study is from the visible UI only: page text, screenshots, and hash navigation. No source code or data endpoints were examined.
- Other cities, neighborhood pages, and search results were not studied.
- Only ZIP 10001 was checked. Tablet and 1920 px layouts were not checked.

## Implications for our app

1. Build a card sequence of about 15–18 cards, with hash routes and a progress bar.
2. Build the baseline (food truck) vs proposal (cultural arts center) comparison as its own card set.
3. Put a caveat line on every card that shows a proxy or an assumption.
4. Use a quiz card only where the data supports a clear answer.
5. Test the phone column for horizontal overflow at 320–390 px.
