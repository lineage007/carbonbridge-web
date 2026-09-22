# Fact-check: `/data` page honesty pass (2026-09-22)

Scope: `src/app/data/page.tsx` only. Stacked on #8 (the regulatory timeline was already corrected there and is not changed here). Tick each box before merging.

## What was wrong on the live page

- Header: "Real-time carbon credit price indices". Nothing on the page is live; every number is a constant in the source file.
- Price indices: "Proprietary benchmark indices updated daily. Based on weighted transaction data across major registries." CarbonBridge has not settled a transaction (README "Stub vs. Live": escrow and registry retirement are stubbed pending ADGM/FSRA permission), so there is no transaction data to weight. Footnote cited "CarbonBridge proprietary data, Ecosystem Marketplace, ACX" for the same invented values.
- Market overview: six figures attributed to named sources that do not match those sources. Ecosystem Marketplace has not published a "$1.7B" VCM value for 2025 (its latest full-year report, SOVCM 2025, covers 2024: $535M); the EUA and ACCU "spot" prices were static and undated.
- Monthly trading volume: an invented six-month series presented as retirements.
- Research & Reports: six report cards (e.g. "NRCC Buyer's Guide: What Australian Corporates Need to Know", "Credit Insurance: Why It Matters and Who Provides It") that do not exist anywhere in the repo, dated Oct 2025 to Mar 2026, with pointer cursors and no link.

A regulator reviewing the ADGM application, or a competitor, can screenshot every one of these. Under the 21 Sep content rule ("still out: statements a public record already contradicts"), they are the kind of claim to fix, not to defend.

## What the page says now

- [ ] Header: "Market reference figures, compliance milestones and CarbonBridge's compliance guides."
- [ ] Price indices: kept for the layout (Gary's call whether they stay), titled "(in development)", each card badged **Illustrative**, sub-heading and footnote say they are placeholders, not market prices, and that real indices come from settled marketplace transactions once trading starts. The numbers themselves are unchanged.
- [ ] Market overview, six sourced figures:
  - [ ] **VCM transaction value 2024: $535M** — Ecosystem Marketplace, *State of the Voluntary Carbon Market 2025*, Key Findings: "The total reported transaction value of the Voluntary Carbon Market (VCM) was $535M USD, a decrease of 29 percent from 2023." https://www.ecosystemmarketplace.com/publications/2025-state-of-the-voluntary-carbon-market-sovcm/
  - [ ] **Volume traded 2024: 84 Mt** — same report: "transaction data totaling 84 million metric tons CO2e (MtCO2e), representing a 25 percent fall in traded volume".
  - [ ] **Average price 2024: $6.34/t** — same report, Table 1 ($6.34/tCO2e). Note: the narrative text of the same report says "$6.37"; Table 1 used. Either is defensible; change to "≈$6.35" if you prefer not to pick.
  - [ ] **Credits retired 2024: 182 Mt** — Ecosystem Marketplace SOVCM 2025 launch article (29 May 2025): "182 million tons of credits retired in 2024" across the ten largest standards. https://www.ecosystemmarketplace.com/articles/sovcm-2025-finds-the-voluntary-carbon-market-in-transition-demand-holding-steady-as-turnover-stabilizes/
  - [ ] **UAE NRCC threshold 0.5 Mt/yr (Scope 1 + 2)** — as verified in `FACT-CHECK-2026-09-14-compliance-explainers.md` (Freshfields, Ropes & Gray).
  - [ ] **CORSIA baseline 85% of 2019, from 2024** — as verified in `FACT-CHECK-2026-09-19-corsia-and-index.md` (ICAO 41st Assembly, 2022).
- [ ] Available volume by credit type: sub-heading now "Indicative volumes across the projects shown on the marketplace. Availability and price are confirmed at settlement." (matches the marketplace page's own footnote). Values unchanged; they come from `src/data/credits.ts`.
- [ ] Monthly trading volume: sub-heading now says "Illustrative layout, not registry data". Series unchanged.
- [ ] Research & Reports → **Compliance Guides**: four cards that link to pages that exist (on #7/#8): `/compliance`, `/compliance/corsia`, `/compliance/eu-cbam`, `/compliance/uae-nrcc`, titles and review dates copied from each page's `metadata.title` and `REVIEWED` constant.

## Not changed (flagged)

- Homepage "Price Intelligence: Real-time benchmarks by credit type…" and root-layout metadata ("real-time pricing", "MENA's first institutional carbon credit marketplace") make the same real-time claim. Left for a separate pass: `layout.tsx` is shared with #7/#8, and "first" is a positioning call for Gary under the 21 Sep rule.
- The 6m / 1y / All time buttons on the volume chart change state but not the data. Harmless while the chart is illustrative.
- Decision for Gary: keep the illustrative indices and volume chart (as now), or remove both sections until real data exists.
