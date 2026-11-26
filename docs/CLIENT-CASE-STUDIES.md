# Client case studies

Four client case studies are listed at `/case-studies`, each with a dedicated page and an individual PDF under `/downloads/`.

- Best Behaviour School for Dogs: `/case-studies/best-behaviour-dog-training`
- Sensitive-project AI: `/case-studies/sensitive-project-ai`
- Coffee shop location development: `/case-studies/coffee-shop-location-development`
- Mindfulness business expansion: `/case-studies/mindfulness-business-expansion`

Content is held in `lib/site.ts`. The PDFs reproduce the four approved branded case studies, one page per download. Client surnames are omitted. Existing rail experience remains on the listing page. The AI prototype stage and the mindfulness revenue target remain explicitly qualified.

The sitemap includes the new pages only when the existing production-indexing checks permit indexing. This change introduces no data collection, analytics or account changes.

Before production release, complete lint, type checking, unit tests, the production build and Chromium browser tests. Obtain production deployment approval as required by `AGENTS.md`.


Validation on 26 November 2026: all five unit tests passed using bundled Node.js 24. Each PDF was opened with PyMuPDF and verified to contain one page with no client surname. Dependency installation was attempted with `npm ci`; it was blocked by DNS access to registry.npmjs.org. Lint, type checking, production build and browser tests therefore remain pending. Browser regression coverage is included for desktop and mobile cards, detail routes, PDF responses, canonical URLs and missing pages.
