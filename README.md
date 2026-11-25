# Gavin Ferns Coaching & Consulting

A Next.js, TypeScript and Tailwind CSS site for gavinferns.com. It presents the coaching, consulting and transformation services and gives prospective clients a way to prepare for a strategic discovery call.

## Local development

Use Node.js 24 and npm. The project requires no secrets or external services for local development.

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. Copy `.env.example` to `.env.local` only when you need to test the optional settings.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

In another terminal, run `npm run test:browser` against the default production configuration. Chromium must be installed. Set `CHROMIUM_PATH` if its executable differs from `/usr/bin/chromium` and `TEST_BASE_URL` if the server uses a different address. The tests exercise all content pages, desktop and mobile layouts, preview metadata and the discovery brief.

## Vercel and production domain

1. With owner authorisation, import the GitHub repository into Vercel and select the Next.js preset and Node.js 24. Use a commercial plan such as Vercel Pro. Keep the package-lock file in version control and use `npm ci` if overriding Vercel’s install command.
2. Use a protected preview for review. The site defaults to `noindex`, which is a crawler instruction. Use Vercel Deployment Protection for access control.
3. Confirm VAT treatment and the displayed price presentation with Gavin. Review offer terms and ensure each total paid engagement exceeds £2,500. Have the owner approve the privacy notice, including the controller identity, actual retention schedule, provider arrangements and applicable international transfers.
4. Test the supplied Calendly, WhatsApp, telephone and Instagram destinations. In Calendly, confirm the event and availability, and configure invitee questions for turnover, challenge, goal, investment budget and timescale if the booking flow should collect them directly. The site prepares a brief in the browser and visitors choose whether to copy and share it. No backend collects the answers.
5. Export the existing DNS zone and record the current web and mail routes. Add the apex and optional `www` domains in Vercel. Record the exact DNS changes Vercel requests and obtain approval before applying them. Preserve MX, authentication TXT, mail subdomains and third-party verification records. Choose `gavinferns.com` as canonical and redirect the alternate host. After the approved change, validate TLS, redirects, pages and current mail delivery.
6. Set the Production values below after the applicable checks pass, then redeploy. Verify the live canonical URLs, sitemap, robots metadata and contact flow. Review these settings after any preview or production environment change.

| Variable | Purpose |
| --- | --- |
| `SITE_PUBLIC_INDEXING` | Set to `true` for approved production indexing. The build also requires a supported VAT value. |
| `SITE_VAT_TREATMENT` | Set to `inclusive`, `exclusive` or `no-vat` after the owner confirms the wording. |
| `SITE_EMAIL_VERIFIED` | Set to `true` only after inbound and outbound testing of the professional mailbox. |
| `SITE_INSTAGRAM_VERIFIED`, `SITE_YOUTUBE_VERIFIED` | Set each to `true` only after separately verifying the public profile. |
| `GOOGLE_SITE_VERIFICATION` | Optional Search Console HTML verification token. For domain-property verification, use the authorised DNS workflow. |

## Measurement

The site currently loads zero analytics tags and has no analytics consent state to store. Before adding Google Analytics, verify the business property and measurement ID, update the privacy notice and implement prior opt-in with a clear reject and withdrawal path. Record only aggregated or categorical events such as discovery CTA clicks and booking handoff, with no brief contents or personal data. In Search Console, verify the property under the approved business Google identity and submit the production sitemap after indexing is enabled.

## Operations

- [Roadmap and account consolidation](docs/ROADMAP.md)
- [Digital asset register](docs/DIGITAL-ASSET-REGISTER.md)
- [Zoho email migration](docs/EMAIL-MIGRATION.md)
- [Repository instructions](AGENTS.md)
