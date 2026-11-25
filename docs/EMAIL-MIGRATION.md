# Zoho Mail migration for gavinferns.com

Proposed mailbox is `gavin@gavinferns.com`, with `hello@`, `consulting@` and `accounts@` as aliases on the same domain. Confirm the Zoho plan supports the required aliases, send-as and migration options. Use the appropriate regional Zoho tenant and keep credentials in approved storage.

## Inventory and backup

1. Confirm which provider receives mail today, who manages the DNS zone, which services send mail for the domain and whether old Google Workspace data is recoverable.
2. Export the existing DNS zone and record MX priorities, SPF, DKIM selectors, DMARC, Vercel web records, verification tokens and TTLs. Store the export securely.
3. If Google data is accessible, run an authorised mailbox export or supported migration. If the tenant was discontinued, assess recovery with the former admin or reseller before any cutover. Validate message counts where available and open sampled folders, attachments and date ranges from the backup.

## Prepare Zoho and the change record

1. Add the domain in the approved Zoho admin console. Obtain the exact domain verification record and record the hostname, type and value. Submit the proposed DNS change for approval. Verify the domain after the approved record propagates.
2. Create the mailbox and aliases. Test authorised access, recovery and MFA. Configure replies from aliases where required and supported. Use the tenant's migration tool if a verified source can be read.
3. Obtain exact regional MX hostnames and priorities and the official SPF guidance from this tenant. Plan a single SPF record per hostname that includes all verified senders still in use. Remove obsolete mechanisms only after their owners confirm retirement.
4. Generate a Zoho DKIM selector and record the exact TXT name and key from the console. Plan to validate it before enabling signing. Keep other valid selectors for active senders.
5. Review existing DMARC policy. If introducing DMARC, plan initial reporting to an approved monitored destination, then consider enforcement after daily reports show alignment for all legitimate senders. Keep any existing enforcement until an approved policy change. Protect data in aggregate reports and authorise any external reporting destination.
6. Write a change record with the old and new rows, purpose, TTL, verification steps, owners, timing and escalation and rollback contacts. Leave this document free of guessed account-specific DNS values.

## Approved cutover and acceptance

Schedule any approved TTL reduction in advance. During the approved mail cutover, change the necessary mail records without altering Vercel apex and `www` web records. Coordinate website cutover timing with the DNS owner so the complete zone is preserved. Keep access to the previous mailbox where available while caches expire and the final incremental mail copy completes.

Poll authoritative and public resolvers for MX, SPF, DKIM and DMARC. Send and receive test messages via independent external providers. Test replies, alias reception, permitted alias send-as, and delivery to the inbox. Inspect message authentication headers for SPF, DKIM and DMARC alignment, and check the live website and TLS. Record timestamps, sanitised evidence and any discrepancies. The site email flag can be enabled only after the mailbox passes the tests.

If delivery fails, determine whether propagation, routing, provider provisioning or authentication is responsible. Use the approved rollback plan and previous zone records only if the previous service has been verified as able to receive mail. Otherwise coordinate remediation with the active providers. Preserve all messages accepted by either provider during the transition, reconcile any split delivery and repeat the mail and website checks.
