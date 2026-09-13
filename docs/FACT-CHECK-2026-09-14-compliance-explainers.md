# Fact-check checklist: /compliance/eu-cbam and /compliance/uae-nrcc (night-20260914)

Every item below should be ticked by a human before merge. Assessments in parentheses record what the night shift verified on 2026-09-14 (source and date), or flag where it relied on general knowledge. The pages carry a "last reviewed" date and a not-advice disclaimer; both should be updated whenever a claim below changes.

Source files: `src/app/compliance/eu-cbam/page.tsx`, `src/app/compliance/uae-nrcc/page.tsx`, `src/app/compliance/_components/Explainer.tsx`, `src/app/sitemap.ts`, `src/app/layout.tsx` (two FAQ answers), `src/app/page.tsx` (two compliance-countdown rows, two footer links).

## EU CBAM page

- [ ] Regulation (EU) 2023/956 established CBAM (verified — EUR-Lex reference; general knowledge)
- [ ] Regulation (EU) 2025/2083 adopted 8 October 2025, published OJ 17 October 2025, in force 20 October 2025 (verified — EY Global tax alert "EU adopts CBAM Omnibus Regulation")
- [ ] Transitional period 1 October 2023 to 31 December 2025, reporting only, no payment (verified — ICAP news 2025; general knowledge)
- [ ] Definitive period from 1 January 2026; only authorised CBAM declarants may import CBAM goods (verified — EY; CBAMCheck timeline)
- [ ] 31 March 2026: importers who applied for authorisation before this date could keep importing pending the decision (verified — EY "grace period provision: applications filed by 31 March 2026"; CBAMCheck "Art. 17(7a)")
- [ ] Certificate sales begin 1 February 2027 and cover 2026 imports (verified — EY "February 2027"; CBAMCheck "1 February 2027")
- [ ] First annual declaration due 30 September 2027 for calendar-year 2026, repeating annually; moved from 31 May (verified — EY "30 September of the following year"; CBAMCheck. **Highest-risk date on the page**: some secondary sources still quote 31 August or 31 May. Confirm against the consolidated text of Regulation 2023/956 Art. 6 as amended before merge)
- [ ] CBAM factor rises yearly from 2026 to 100% in 2034 as EU ETS free allocation is withdrawn (general knowledge of Art. 31 and the ETS Directive phase-out schedule; the page deliberately quotes no per-year percentage)
- [ ] 50-tonne per-importer annual threshold, all CBAM goods except electricity and hydrogen (verified — EY "50-ton per-importer annual threshold ... iron, steel, aluminum and fertilizers/chemicals"; the electricity/hydrogen exclusion is general knowledge of the Omnibus text — confirm)
- [ ] Goods: cement, iron and steel, aluminium, fertilisers, electricity, hydrogen, plus precursors and certain downstream articles (verified — EY; Regulation Annex I, general knowledge)
- [ ] Certificate price derived from EU ETS allowance prices averaged over a period fixed in the Regulation (general knowledge: originally the weekly average auction price; the Omnibus changed the averaging period. The page deliberately does not say "weekly" or "quarterly" — keep it that way unless the consolidated text is checked)
- [ ] Only deduction is a carbon price effectively paid in the country of origin; voluntary credits cannot be surrendered (general knowledge of Art. 9; consistent with every source read. This is the page's central claim — confirm against the Regulation text)
- [ ] Indirect emissions: iron and steel, aluminium and hydrogen charged on direct emissions only in the current phase; cement and fertilisers include indirect electricity emissions (general knowledge of Annex II — confirm)
- [ ] Third-country operators may register in the CBAM registry and share verified installation data with importers (general knowledge of the definitive-period registry design — confirm the registry feature is live)
- [ ] Default values published by the Commission may be used where verified actual data is unavailable and are set conservatively (verified — EY "default values may now be used more broadly"; "set conservatively" is characterisation — soften if the firm prefers)
- [ ] The UAE has no domestic carbon price in force that a declarant could deduct, and the NRCC is not a carbon price (general knowledge as of the review date; **confirm nothing has been enacted** since June 2026)
- [ ] "Jebel Ali or Ruwais" used as illustrative industrial locations; no company, person or customer is named (editorial check)
- [ ] The page names no insurer, underwriter, regulator status or licence (consistent with PR #5 and PR #6 — editorial check)

## UAE NRCC page

- [ ] Cabinet Resolution No. 67 of 2024 concerning the National Register for Carbon Credits, effective 28 December 2024 (verified — Freshfields blog; Meysan)
- [ ] Official name "National Register for Carbon Credits" (verified — Climate Policy Database title; the site previously said "National Registry of Carbon Credits" and both spellings circulate)
- [ ] Mandatory registration at or above 500,000 tCO2e/year combined Scope 1 and 2; trading platforms must register; voluntary below the threshold (verified — Freshfields "0.5 million metric tons"; Ropes & Gray "combined annual Scope 1 and 2"; uaecarbonreporting.com guide)
- [ ] Six-month regularisation period ending 28 June 2025 (verified — Freshfields "28 June 2025"; Meysan)
- [ ] Annual reporting on GHG Protocol methods with accredited third-party verification (verified — Ropes & Gray "Greenhouse Gas Protocol standards; ISO 14065 third-party verification required")
- [ ] NRCC penalties AED 500,000 / 1,000,000 / 2,000,000 first/second/subsequent; platform registration suspension or cancellation (verified — Ropes & Gray; Freshfields "up to AED 1 million for repeated violations ... licence suspensions or cancellations")
- [ ] Federal Decree-Law No. 11 of 2024 on the Reduction of Climate Change Effects, in force 30 May 2025 (verified — PwC Middle East legal alert; Meysan)
- [ ] Applies to all public and private legal persons and individual enterprises that emit, expressly including free zones (verified — Ropes & Gray quoting the Decree; PwC "mainland and free zones")
- [ ] One-year adjustment period ending 30 May 2026; not a recurring annual filing deadline; obligations attach on designation as a source (verified — Meysan "one year from entry into force to adjust status ... 30 May 2026" and "MRV obligations ... apply only once MOCCAE or the competent Emirate/free-zone authority ... designates the entity as a Source"; reporting.academy guide dated 12 August 2026: "30 May 2026 was not a universal annual filing deadline". **This is the page's central correction — confirm with counsel before merge**)
- [ ] Records retained for at least five years (verified — PwC)
- [ ] Decree-Law fines AED 50,000 to AED 2,000,000, doubled for repeat within two years (verified — PwC; Ropes & Gray; 6clicks)
- [ ] Reduction measures listed include energy efficiency, clean energy, carbon capture and carbon offsetting; no offset quota (verified — Ropes & Gray list; "no quota" is an inference from the absence of one — soften if counsel disagrees)
- [ ] IEQT launched 15 October 2025 at GITEX Global as the national MRV platform (verified — Meysan. Note: reporting.academy gives a December 2023 IEQT origin; the October 2025 date is the MRV-system launch under the new law. Reconcile wording if the firm has better information)
- [ ] Abu Dhabi facility-level scheme: facilities at or above 25,000 tCO2e Scope 1, calendar-year cycle, third-party verification mandatory from 2027 for 2026 data (verified — Ropes & Gray "Abu Dhabi MRV System"; reporting.academy "verification currently voluntary until 2027". The page attributes it to the Environment Agency — confirm EAD is the operator)
- [ ] "Other emirates and free zones are expected to follow with their own designations" (forward-looking; the firm's expectation, not a sourced fact — keep or cut)
- [ ] Tier 1 sector list (power and water, oil and gas, aluminium, steel, cement, petrochemicals, aviation) is a general characterisation, not sourced (editorial check)
- [ ] Sources section links to the UAE Legislation portal root and MOCCAE root rather than deep links, because the deep links were not verified tonight (replace with direct instrument links once confirmed)

## Homepage and layout changes

- [ ] Compliance-countdown row "UAE NRCC" no longer implies a missed universal deadline; wording matches the explainer (editorial)
- [ ] Compliance-countdown row "EU CBAM" now counts down to 1 February 2027 (certificate sales) instead of 1 January 2027, and no longer says exporters "must purchase equivalent carbon credits" (the previous sentence was wrong: certificates are not credits and importers, not exporters, buy them)
- [ ] Layout FAQ JSON-LD answers for NRCC and CBAM rewritten to match the explainers (Google may show these as rich results — confirm they read correctly)
- [ ] Footer "Solutions" column links to both explainers (editorial)

## Sources read on 2026-09-14

- EY Global, "EU adopts CBAM Omnibus Regulation" — https://www.ey.com/en_gl/technical/tax-alerts/eu-adopts-cbam-omnibus-regulation
- CBAMCheck, "CBAM timeline and deadlines: every key date from 2026 to 2027 and beyond" — https://solidwaretools.com/cbamcheck/en/cbam-timeline-deadlines-2026-2027.html
- ICAP, "EU adopts simplifications of CBAM rules ahead of the compliance phase starting in 2026" — https://icapcarbonaction.com/en/news/eu-adopts-simplifications-cbam-rules-ahead-compliance-phase-starting-2026
- Freshfields, "Understanding the UAE's new National Register of Carbon Credits" — https://www.freshfields.com/en/our-thinking/blogs/risk-and-compliance/understanding-the-uaes-new-national-register-of-carbon-credits-102k2g0
- Ropes & Gray, "Preparing for New UAE GHG Emissions Reporting and Reduction Requirements" (April 2026) — https://www.ropesgray.com/en/insights/alerts/2026/04/preparing-for-new-uae-ghg-emissions-reporting-and-reduction-requirements
- Meysan, "UAE Launches National MRV System under the Climate Change Law" (updated 21 June 2026) — https://www.meysan.com/uae-launches-national-measurement-reporting-and-verification-system-under-the-climate-change-law/
- PwC Middle East, "UAE's Climate Change Law Mandatory Emissions Reporting Obligations" — https://www.pwc.com/m1/en/services/legal/legal-news-alerts/2025/uae-climate-change-law-mandatory-emissions-reporting-obligations.html
- London Reporting Academy, "UAE climate reporting periods, platforms and filing deadlines" (12 August 2026) — https://reporting.academy/en/knowledge-hub/disclosure-guides/uae/uae-ghg-inventory/uae-climate-reporting-periods-platforms-and-filing-deadlines-what-to-c/
- Climate Policy Database, "Cabinet Resolution No. (67) Concerning the National Register For Carbon Credits" — https://climatepolicydatabase.org/policies/cabinet-resolution-no-67-concerning-national-register-carbon-credits
- 6clicks, "UAE GHG reporting deadline 2026" (13 May 2026) — https://www.6clicks.com/resources/blog/uae-ghg-reporting-deadline-2026-compliance
