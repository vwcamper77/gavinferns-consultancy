# Gavin Ferns Business Consulting and Coaching

Next.js, TypeScript and Tailwind CSS site for gavinferns.com, including the Three Multipliers of Growth, an interactive revenue calculator and a browser-local discovery brief.

## Local development

Use Node.js 24.

```sh
npm ci
npm run dev
```

The default workflow requires no secrets or external services. Copy `.env.example` to `.env.local` only to test optional settings.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

In another terminal, run `npm run test:browser` against the default production build. Set `TEST_BASE_URL` for a different port or `CHROMIUM_PATH` for a non-default Chromium executable.

To verify the acquisition workflow, use a disposable PostgreSQL database, apply the acquisition schema, and provision the two local browser-test accounts as documented in [acquisition operations](docs/ACQUISITION.md). Set `TEST_ACQUISITION=true`, `TEST_SALES_PASSWORD` and `TEST_PARTNER_PASSWORD` for the browser test process. The acquisition test needs attribution and email queueing enabled, a Calendly URL and a local webhook secret. The browser intercepts the external calendar. Use synthetic applicant details and run against a clean database.

## Operations

- [Deployment and environment settings](docs/DEPLOYMENT.md)
- [Client acquisition and sales operations](docs/ACQUISITION.md)
- [Business strategy](docs/BUSINESS-STRATEGY.md), [methodology](docs/CONSULTING-METHODOLOGY.md) and [offers](docs/SERVICE-OFFERS.md)
- [Roadmap](docs/ROADMAP.md), [content register](docs/CONTENT-REGISTER.md) and [digital asset register](docs/DIGITAL-ASSET-REGISTER.md)
- [Google consolidation](docs/GOOGLE-CONSOLIDATION.md) and [Zoho Mail migration](docs/EMAIL-MIGRATION.md)
- [Private operations workspace guide](docs/PRIVATE-OPERATIONS-STRUCTURE.md) and [repository instructions](AGENTS.md)
