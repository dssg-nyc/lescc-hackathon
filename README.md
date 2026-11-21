# lescc-hackathon

Two linked deliverables that tell the story of what a **Cultural Arts Center (museum) concession** would add to Allen Street Mall, measured against the **food truck** concession it would replace.

1. **A storytelling app** (311 Wrapped style) that turns 311 service-request data into a scroll-driven, slide-by-slide narrative about the neighborhood. Reference: https://311wrapped.com/
2. **A model** (Jupyter, Python) that measures the difference between the baseline (food trucks) and the proposal (Cultural Arts Center) as incremental value on social capital, cultural capital, and revenue, with revenue benchmarked against food truck revenue.

---

## Context: the solicitation

NYC Parks **Solicitation #M4-SB-2026**, concession at **Allen Street Mall**. Proposals due **Friday, May 22, 2026**. The license term is **25 years**, and each proposer submits a fee offer for every year (Year 1 through Year 25).

### Proposal requirements (from the solicitation checklist)

Every item must be marked Yes before submission:

- [ ] Hard copy: four (4) copies of the proposal
- [ ] Fee offer for each of the 25 license years
- [ ] $5,000.00 proposal deposit, certified/official bank check, money order, or cashier's check, payable to **NYC Parks & Recreation** (no personal or business checks). If sent electronically, include a copy of the deposit and the postal receipt.
- [ ] Resume or detailed description of professional qualifications
- [ ] At least three (3) recent relevant references
- [ ] Detailed operational plan for the entire Licensed Premises
- [ ] Financial statement(s) prepared under standard accounting procedures
- [ ] Identified intended source of all funds to be invested in the Licensed Premises
- [ ] Hard copy: four (4) copies of the Doing Business Data Form (plus one electronic copy)
- [ ] Acknowledgment of all addenda issued for this solicitation
- [ ] Statement of whether a new entity will be created to hold the contract, or whether the proposer will operate under a DBA (DBA requires NY Department of State filing)

### Financial benchmarks provided by Parks

Parks lists comparable concessions "for informational purposes" and asks proposers to build fees from their own business plan. These are the only revenue comparables in the packet, and they are **café and parkhouse concessions, not food trucks**.

**Hunter's Point South Café, Long Island City, Queens**

| Operating year | Gross receipts | Fees paid to Parks | Fee as % of gross |
|---|---:|---:|---:|
| 6/2020–5/2021 | $578,727.86 | $108,052.59 | 18.7% |
| 6/2021–5/2022 | $736,856.79 | $115,616.27 | 15.7% |
| 7/2022–7/2023 | $1,036,318.51 | $193,500.00 | 18.7% |
| 8/2023–7/2024 | $1,361,347.00 | $193,500.00 | 14.2% |
| 8/2024–7/2025 | $1,334,129.00 | $201,303.00 | 15.1% |

**McCarren Parkhouse, Brooklyn**

| Operating year | Gross receipts | Fees paid to Parks | Fee as % of gross |
|---|---:|---:|---:|
| 6/2021–5/2022 | $114,533.32 | $50,000.00 | 43.7% |
| 6/2022–5/2023 | $1,168,777.61 | $114,693.76 | 9.8% |
| 6/2023–5/2023 (sic) | $1,267,064.95 | $126,701.60 | 10.0% |
| 6/2024–5/2025 | $1,456,041.00 | $145,603.70 | 10.0% |

Notes:
- The McCarren row labeled `6/2023–5/2023` is a typo in the source. It is most likely 6/2023–5/2024. Confirm before using it.
- McCarren's first-year fee ($50,000) looks like a flat start-up amount. From year two it is 10% of gross.

---

## What the project produces

### Output 1: 311 storytelling app

A scroll-driven story built from 311 service-request data for the Allen Street Mall area. It should read like 311 Wrapped: one idea per screen, a headline number, a chart, and a plain-language takeaway.

Requirements:
- Narrative structure, not a dashboard. Each section makes one point and leads to the next (for example: what residents report most, when, how fast the city responds, and what changes if a cultural anchor is added).
- Every number on screen traces back to a documented source.
- Charts follow one visual system, with color used semantically (for example, baseline vs. proposal).
- Responsive from 320px to 1920px wide, with no horizontal overflow. Keyboard accessible. Respects `prefers-reduced-motion`.
- Static-first: the built app reads pre-computed data. It should not query raw 311 data at page load.
- Shows the model outputs as the proposal-vs-baseline section.

### Output 2: Model

A Jupyter-based model that compares the two scenarios and produces the figures the story uses.

Model logic:
- **Baseline** = status quo food truck concession.
- **Proposal** = Cultural Arts Center operating the same premises.
- **Incremental value** = Proposal − Baseline, per year over the 25-year term.
- Metrics:
  - **Revenue**: gross receipts and Parks fees. Benchmarked against the food truck revenue baseline and the comparables above.
  - **Social capital**: proxies to be defined before any result is shown in the app (for example, 311 civic-engagement and neighbor-reported signals before and after). Document each proxy and its source.
  - **Cultural capital**: proxies to be defined before any result is shown in the app (for example, cultural program and venue activity). Document each proxy and its source.
- Every assumption is stated in one place, with its source cited.

---

## Open questions and data gaps

- **Food truck revenue is not in the packet.** The Parks tables cover cafés and a parkhouse. A food truck baseline needs its own source (vendor receipts, permit records, or published estimates). Until one is found, the baseline is an explicit assumption.
- **Social and cultural capital are not measured in the packet.** Proxies must be defined before any result is shown in the app.
- **Museum visitor and revenue assumptions** have no source yet.
- **Study-area boundary** for Allen Street Mall needs to be fixed (set of 311 geographies or radius) before analysis runs.
- **Entity question** (new entity vs. DBA) affects who the model names as the operator. It is still open.

---

## Setup

### Storytelling app

```bash
cd app
npm install
npm run dev
```

### Vercel

The repo-root `vercel.json` builds the Vite app in `app/` and publishes `app/dist`. Import this GitHub repository in Vercel and leave **Root Directory** as the repo root. No environment variables are required.
