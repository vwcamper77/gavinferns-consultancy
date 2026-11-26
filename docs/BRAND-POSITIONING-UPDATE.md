# GFC brand and commercial positioning update

Implemented from Gavin's November 2026 brief. The supplied attachment ends at “Review existing case studies for opportunities” in section 11. No additional case studies or claims were inferred from the missing continuation. Existing case-study content and downloadable PDFs are preserved.

## Identity and assets

The existing 104 × 36 SVG retains the exact hexagon paths, colours, letter coordinates, Arial Bold typography and horizontal proportions. Only C–G–F changes to G–F–C. Active references use `public/gfc-logo.svg`; the old mark remains recoverable through Git history. No social handles were changed.

Run `python scripts/generate-brand-pack.py` with Pillow, Inkscape and Liberation Sans to reproduce the assets, full ZIP, favicon, Apple icon and sharing image. The ZIP contains the full GFC set, guidelines and editable SVG document and banner templates. PNG social templates can be used as backgrounds; SVG banners and document covers retain editable text. The email signature uses a hosted image: deploy the new assets before using it externally.

## Financial scenarios

The Three Multipliers still compound independently. Growth percentages are limited to 0–1,000% per multiplier and turnover to £1 trillion to reject nonsensical entries while permitting exploratory scenarios.

The ROI calculator defines its input as **gross profit margin**, after direct costs. Annual operating costs are deducted once to show operating profit before interest, tax and the one-off investment. A percentage-point improvement changes gross profit at constant turnover and operating costs. Additional annual profit = turnover × margin improvement / 100. Total investment = consulting + one-off implementation expenditure. Net first-year return = additional annual profit − total investment. ROI = net return / total investment. Payback in months = total investment / additional annual profit × 12. Zero uplift has no payback. Negative baseline operating profit is permitted and is not hidden by positive uplift. Costs cannot be negative or non-finite. Changes in recurring operating costs require separate assessment; timing, financing and tax are excluded. No personal details are required.

## Launch dependencies

- The production site could not be inspected from this environment: HTTPS and the shared browser failed with a tunnel connection error. Compare the finished preview with production when connectivity is available.
- No academic records were supplied in the checkout or attachment. Degree, major and module wording follows Gavin's supplied statements. Check the formal award and transcript wording before launch. Modules are not presented as separate qualifications; no university logo or endorsement claim is included.
- The November 2024 Core Operating Procedure remains a source document to compare when supplied; the Three Multipliers methodology is retained.
- VAT treatment and permission to enable indexing remain existing launch dependencies. Indexing and professional email gates remain in place.
- Scope and publication rights must be checked before adding further portfolio material. Corporate project values describe employment experience, not consulting revenue; founder-developed technology is distinguished from client work.
- Production deployment requires approval under AGENTS.md. This implementation does not change DNS, mailbox configuration, permissions, tracking or data-collection integrations.

## Verification

- Node.js 24.22.3; `npm ci` completed with a writable temporary npm cache.
- `npm run dev` started successfully before implementation.
- Lint, TypeScript checks, 18 unit tests and the production build passed.
- Chromium against `npm start`: 8 browser tests passed. The PostgreSQL-dependent acquisition test was skipped because its disposable database/accounts were not configured. No admin, integration or database implementation was changed.
- Browser coverage includes all public routes, canonical and noindex metadata, case-study PDFs, discovery privacy with and without JavaScript, responsive calculators, ROI after implementation expenditure, and every brand-page download link plus a real ZIP download.
- ZIP integrity and all 69 entries verified against public files; raster images decoded and SVG XML parsed. Original and updated SVG paths, fills, viewBox, glyph coordinates and typography compared directly: only the letters and accessible brand label changed.
- Additional 375 px mobile checks confirmed the MBA appears in the initial viewport and the homepage, About and brand pack have no horizontal overflow. Review screenshots are saved outside the checkout in `/workspace/gfc-review/`.
