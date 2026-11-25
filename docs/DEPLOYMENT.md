# Deployment

Use Node.js 24, the Next.js preset and the committed npm lockfile. Confirm the approved Vercel project, plan and production branch with the owner before publishing. Use a protected environment for review, since `noindex` only affects crawlers.

## Configuration

| Variable | When to set |
| --- | --- |
| `SITE_PUBLIC_INDEXING` and `SITE_VAT_TREATMENT` | Set indexing to `true` only after launch approval and specify `inclusive`, `exclusive` or `no-vat` after confirming actual VAT treatment. |
| `SITE_EMAIL_VERIFIED` | Set to `true` only after mail delivery and sending are verified. |
| `SITE_BOOKING_URL` | Enter a tested HTTPS Calendly or Google Calendar appointment scheduling URL. The default is the supplied Calendly page. |
| `SITE_INSTAGRAM_VERIFIED`, `SITE_YOUTUBE_VERIFIED` | Individually enable the supplied public profiles after verifying them. |
| `SITE_LINKEDIN_URL`, `SITE_GOOGLE_BUSINESS_PROFILE_URL` | Leave blank until the exact public profiles have been verified. |
| `GOOGLE_SITE_VERIFICATION` | Optional verified Search Console HTML token for the production site. |
| `SITE_GA_MEASUREMENT_ID` | Optional verified GA4 ID. Leave blank until the privacy notice and analytics setup are approved. |

GA4 is disabled by default. A configured tag loads after explicit permission and preferences can be changed from the footer. Check accept, decline and withdrawal in a browser before enabling measurement. Review the Google property and turn off unneeded measurement, advertising and enhanced events. Never add discovery brief values or calculator inputs to analytics.

## Domain and launch

1. Approve pricing, privacy notice, contact destinations, and required public content. Complete a test booking and confirm access to any verified contact method. Check the booking provider’s abuse controls and configure the eight qualification questions there if you want to collect them directly. The site prepares a browser-local brief for voluntary handoff, with no enquiry submission endpoint to receive spam.
2. Export the DNS zone and confirm internet and mail providers. Get the exact Vercel verification and web records from the authorised Vercel project. Obtain approval before any DNS edits.
3. Preserve mail, verification and unrelated records. Coordinate with the [Zoho plan](EMAIL-MIGRATION.md). Use the apex as canonical and redirect the alternate host.
4. Verify HTTPS, canonical redirects, page titles, robots, sitemap, booking and mail delivery. After approval, enable production indexing, verify Search Console and submit the sitemap.
