# The Practical Life Pack

Twelve free, print-ready printables for using AI well and getting life admin out from underfoot. Six AI guides, six life-admin guides, and a small gallery that ties them together. Built to be clear, warm, low-energy friendly, and useful on ordinary paper.

Made by **Asdale Dynamics, LLC** — Dylan Asdale's Indiana-based education studio. Dylan is a registered nurse turned AI author, the person behind *The Massive AI Manual* and [dylanasdale.github.io](https://dylanasdale.github.io).

**Copyright (c) 2026 Asdale Dynamics, LLC.** Free for personal, family, classroom, and client use with credit; not for resale. See [LICENSE](LICENSE).

## The 50/50 promise

The pack is deliberately balanced: **six AI printables and six life-admin printables**, with equal prominence in the gallery and the download.

| # | Guide | Track | Pages |
| --- | --- | --- | --- |
| 01 | AI Prompt Cheat Sheets | AI | 9 |
| 02 | Beginner AI Glossary | AI | 7 |
| 03 | AI Privacy Checklist | AI | 10 |
| 04 | AI for Job Search | AI | 10 |
| 05 | AI for Budgeting | AI | 15 |
| 06 | The 7-Day AI Learning Challenge | AI | 12 |
| 07 | The Low-Energy Weekly Reset | Life admin | 18 |
| 08 | The Paper Pile Triage Kit | Life admin | 17 |
| 09 | Bills, Renewals & Subscriptions | Life admin | 19 |
| 10 | The Appointment Companion | Life admin | 18 |
| 11 | The Low-Energy Meal Plan | Life admin | 16 |
| 12 | The Household Command Center | Life admin | 17 |

**168 pages total.** Each guide includes a cover, print-ready writing pages, and a closing page. Every page is US Letter (8.5 × 11 in) and designed to work as a standalone sheet.

The combined PDF is `site/downloads/asdale-practical-life-pack-complete.pdf`; the twelve individual PDFs are in `site/downloads/asdale-practical-life-pack.zip`.

## What it is for

- **Using AI without the hype.** Plain-English prompts, privacy habits, a glossary, and small workbooks for job search and budgeting.
- **Life admin with less friction.** Paperwork triage, bills and renewals, appointments, low-energy meals, a weekly reset, and a household hub.
- **ADHD-friendly by design.** Short entry points, no streaks or required order, generous writing space, explicit stop points, and pages that still work when you only have five minutes.
- **Local-first and quiet.** No accounts, sign-ups, cookies, trackers, remote scripts, or remote fonts. The gallery and the guides work from a local folder.

These are educational tools, not clinical treatment or professional advice. See [Scope and limits](#scope-and-limits).

## Quick start

There is nothing to install and no build step needed just to use the pack.

1. Open `site/index.html` in a browser, or serve the folder:

   ```bash
   npm run serve
   ```

   Then open <http://localhost:8080>.

2. Download one guide, the complete PDF, or the ZIP from the gallery.
3. Print at **100% scale** on US Letter. On A4, choose **fit to page**. Turn on background graphics for the intended look; the writing space still works without them.

The print-ready HTML editions are in `site/print/`. Each one includes a Print button and a small screen hint; those controls do not appear in the PDF.

## Build

Requirements:

- Node.js 18 or newer (no npm dependencies)
- Google Chrome or Chromium for PDF rendering
- `pdfinfo` from Poppler for page-count checks
- Python 3 for ZIP creation and verification

```bash
npm run build
```

The build reads the twelve Markdown files in `docs/`, regenerates:

- `site/print/*.html` and `site/print/complete-pack.html`
- twelve PDFs and the combined PDF in `site/downloads/`
- `site/downloads/asdale-practical-life-pack.zip`
- `site/index.html`
- `.build-manifest.json`

Chrome is only needed for PDFs. Without it, the build still writes the HTML and gallery, then reports that PDF rendering was skipped. The build does not use a bundler, framework, or network request.

## Verify

```bash
npm test          # full verification
npm run status    # one-line summary of the same checks
```

The verifier checks, among other things:

- twelve sources, sequential numbering, and an exact 6 AI / 6 life-admin split;
- manifest, source metadata, HTML page counts, and PDF page counts agree;
- every PDF is US Letter and the combined PDF totals 168 pages;
- the ZIP contains exactly the twelve current PDFs;
- every local link, stylesheet, script, and font resolves;
- **every printable page fits at desktop width without clipping**, measured in headless Chrome at 1440 px;
- gallery cards, filter counts, accessible filter state, and `?filter=ai` / `?filter=life` deep links;
- JavaScript parses, site code makes no network requests, and no credential-shaped strings are present;
- the licence and README carry the Asdale Dynamics, LLC copyright and credit.

Browser checks are skipped with a warning if Chrome is unavailable. The PDF checks still need `pdfinfo`. Run `npm run build` before `npm test` after changing content.

## Project structure

```text
docs/                         twelve Markdown source guides
site/index.html               generated gallery
site/assets/                  site CSS, print CSS, small JS files
site/assets/fonts/            bundled Fraunces and Source Sans 3
site/assets/licenses/         SIL Open Font License texts
site/print/                   generated print-ready HTML
site/downloads/               generated PDFs and ZIP
tools/build.mjs               Markdown → HTML → PDF → ZIP → gallery
tools/verify.mjs              automated checks, including page-overflow measurement
.build-manifest.json          generated list of guides, groups, files, and page counts
.qa/                          local screenshot/QA scratch space (ignored by git)
```

`site/index.html`, `site/print/`, `site/downloads/`, and `.build-manifest.json` are generated. Edit `docs/` or `tools/build.mjs` rather than patching the output by hand.

## Editing the guides

Each source file starts with YAML-like frontmatter. Required fields include:

```yaml
---
title: "The Low-Energy Weekly Reset"
shortTitle: "Weekly reset"
number: "07"
group: "life"                 # "ai" or "life"
category: "Weekly planning"
subtitle: "A gentler way to start the week."
description: "One-line gallery description."
coverLine: "A line for the cover."
inside:
  - "First thing inside"
  - "Second thing inside"
  - "Third thing inside"
nextAction: "One small next step."
accent: "#6b7f63"
---
```

Inside the body:

- `<!-- page -->` starts a new printable page. The build adds the cover and closing page.
- `# Heading` becomes the page title; `##` and `###` are section headings.
- Tables become fill-in tables; `- [ ]` becomes a checklist.
- `:::lines 4` adds four writing lines. The number is capped at 20.
- `:::grid-3` (or `grid-2`, `term-grid`) lays out sections in columns.
- Fenced ` ```prompt Label ` blocks become prompt recipe cards.
- `> [!TIP]`, `> [!NOTE]`, and `> [!WARNING]` become callouts.

Page count is chosen by the page breaks, not by automatic pagination. After moving content, run `npm run build` and `npm test`; the verifier will name any page that clips.

## Printing

- **Paper:** US Letter, portrait, 100% scale. A4 works with “fit to page.”
- **Margins:** the layout includes its own margins; do not add extra scaling.
- **Background graphics:** on, if your printer supports it. The pages remain readable without colour.
- **One page per sheet:** designed for single-sided printing, though most pages also work double-sided.
- **Ink:** the design is mostly dark text on cream with restrained accent colours.

## Accessibility and tone

The pack uses large headings, high-contrast text, plain language, and predictable page structure. It avoids required sequences, timed exercises, and “streak” mechanics. Writing lines and check boxes are generous. The goal is a usable page, not a perfect system.

If a page is too much today, use the shorter version in the guide or write one line and stop. That is a valid use of the tool.

## Scope and limits

- **Education only.** The AI, budgeting, job-search, paperwork, meal, and household guides are general education. They are not medical, nursing, legal, tax, or financial advice.
- **Medical content.** Health-related pages are organisational aids only. For care decisions, follow the instructions of a qualified clinician. In an emergency, contact local emergency services.
- **Legal, tax, benefits, and money decisions.** Use an appropriate professional or the official source for your jurisdiction.
- **Food safety.** When in doubt about whether food is safe, throw it out. Follow local health authority guidance. The meal plan cannot assess your specific food, allergies, or medical needs.
- **ADHD.** “ADHD-friendly” describes layout and tone choices, not a clinical claim, assessment, or treatment.
- **Accuracy.** AI outputs change and can be wrong. The AI guides teach verification and privacy habits; they do not guarantee any tool’s behaviour.

## Privacy

The gallery is static. It has no backend, analytics, account system, cookies, remote fonts, or remote scripts. Opening `site/index.html` does not send your reading or printing activity anywhere.

The printable pages can hold personal information once you fill them in. Store completed pages somewhere private, and leave sensitive details off pages that a sitter, visitor, or shared printer might see. When using an AI prompt, replace names, addresses, account numbers, patient details, and confidential project names with placeholders.

## Fonts

- **Fraunces** — Copyright 2018 The Fraunces Project Authors, SIL Open Font License 1.1.
- **Source Sans 3** — Copyright 2010–2024 Adobe, SIL Open Font License 1.1.

The font files and full licence texts are in `site/assets/fonts/` and `site/assets/licenses/`.

## Licence

Copyright (c) 2026 Asdale Dynamics, LLC.

Free to print and share for personal, family, classroom, and client use with the Asdale Dynamics, LLC credit intact. Please do not resell, repackage, sublicense, or present the pack as your own product. The full terms, warranty disclaimer, and font notices are in [LICENSE](LICENSE).

## Status

See [STATUS.md](STATUS.md) for the build and verification record, including known gaps.
