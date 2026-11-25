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

## Operations

- [Deployment and environment settings](docs/DEPLOYMENT.md)
- [Business strategy](docs/BUSINESS-STRATEGY.md), [methodology](docs/CONSULTING-METHODOLOGY.md) and [offers](docs/SERVICE-OFFERS.md)
- [Roadmap](docs/ROADMAP.md), [content register](docs/CONTENT-REGISTER.md) and [digital asset register](docs/DIGITAL-ASSET-REGISTER.md)
- [Google consolidation](docs/GOOGLE-CONSOLIDATION.md) and [Zoho Mail migration](docs/EMAIL-MIGRATION.md)
- [Private operations workspace guide](docs/PRIVATE-OPERATIONS-STRUCTURE.md) and [repository instructions](AGENTS.md)
