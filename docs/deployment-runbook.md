# FieldOps release runbook

Reviewed October 10, 2026. Both applications are live; executed proof is in
[hosted release evidence](hosted-release.md) and the [coordinated photo release](media-images.md).
Do not reset/reseed existing production storage or deploy an
unverified revision. Free hosting has resource/cold-start limits.

## Destinations and isolation

| Concern            | Destination                                     | Configuration                                            |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| Frontend           | Vercel project `fieldops-rafiferdos`            | Node 24, Next.js, npm ci, npm run build, Singapore sin1  |
| Canonical frontend | `https://fieldops-rafiferdos.vercel.app`        | Live production alias                                    |
| API                | `https://fieldops-api-xu3s.onrender.com/api/v1` | Existing Render service and database                     |
| Sessions           | Dedicated authenticated TLS Redis               | Keep separate from backend public-catalog cache          |
| Google             | Existing FieldOps Web client                    | Existing localhost origins retained; Vercel origin saved |
| Payment            | Existing SSLCommerz sandbox                     | Gateway credentials remain backend-only                  |

Frontend `vercel.json` disables automatic Git deployments; a push triggers CI,
not an application release. Production is released manually from an exact CI-passed
Git SHA through Vercel's deployment API or its Create Deployment Git-reference form;
both use the connected repository without uploading ignored local files.

## Production environment

| Variable                                         | Rule                                                            |
| ------------------------------------------------ | --------------------------------------------------------------- |
| API_BASE_URL                                     | Exact hosted `/api/v1` HTTPS URL above                          |
| APP_ORIGIN                                       | Exact verified Vercel origin, identical at build/runtime        |
| GOOGLE_CLIENT_ID                                 | Existing public client ID matching backend audience             |
| IMAGE_CLOUD_NAME                                 | Public cloud name matching the backend, with no API credentials |
| SESSION_REDIS_URL                                | Dedicated password-authenticated `rediss://` connection         |
| SESSION_ENCRYPTION_KEY                           | Fresh base64 32-byte encryption key; shared across instances    |
| DEMO_CUSTOMER_EMAIL / DEMO_CUSTOMER_PASSWORD     | Dedicated evaluation CUSTOMER account                           |
| DEMO_TECHNICIAN_EMAIL / DEMO_TECHNICIAN_PASSWORD | Dedicated evaluation TECHNICIAN account                         |
| DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD           | Dedicated evaluation ADMIN account                              |

Store secrets as protected server-only production variables; no NEXT_PUBLIC
passwords/tokens, client imports, command-line secret arguments or public credential
documents. Do not upload DATABASE_URL, JWT keys or provider merchant credentials.
Local testing permission for existing demo credentials does not authorize copying
those credentials to a host. Production uses separately approved evaluation values.

Use the existing node-redis client through the provider's native TLS TCP interface;
no extra REST SDK is needed. Verify compatibility for Lua scripts and expiry/lease
commands. Review persistence/eviction and free-plan capacity before connecting.
Storage failure denies sessions. An encryption-key change invalidates saved sessions
and checkout intents; it is not a routine release step.

The owner specifically approved Free Marketplace Terms and the dedicated production
secret upload. The Free Singapore Upstash database is provisioned with eviction off.
Only its native TLS URL is stored as a sensitive Vercel production variable; the
unused integration environment connection was removed. The database remains intact.
Four actual native Redis coordination tests pass. No paid plan or recurring charge
was accepted. Do not change billing under this free-hosting authorization.

## Release order

1. Run strict checks with dedicated real Redis, production build and relevant browser
   verification. Install from the committed lockfile using Node 24.
2. Push the reviewable source and wait for successful GitHub CI on that exact SHA.
3. Configure approved protected production values. Keep Render FRONTEND_ORIGIN aligned
   with the exact canonical Vercel origin. For photos, store CLOUDINARY_CLOUD_NAME,
   CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together in Render; put only the matching
   public IMAGE_CLOUD_NAME in Vercel Production. Never transfer provider upload credentials
   to the frontend. Rebuild after changing APP_ORIGIN or image delivery configuration.
4. Deploy the exact CI-passed backend revision before a frontend that depends on new APIs
   or projections. The normal Render start runs `npm run db:deploy && npm run start:prod`.
   The October 10 photo release adds nullable image columns and owned media through
   `20261010123000_owned_media_images`; inspect successful migration and health before
   proceeding. Keep existing data and migration history intact.
5. Deploy the verified frontend Git SHA to Production with Vercel's official API or
   Create Deployment form. Check that the resolved revision and production target match
   before submitting. Keep API authentication tokens out of arguments and logs. Record
   the returned deployment identity before another write; inspect readiness and the
   canonical alias instead of blindly repeating creation.
6. Check API liveness/readiness, expected source revision, current-skills routing and
   frontend/API reachability. Do not expose secret settings to prove configuration.
7. Complete the hosted acceptance checks below. Keep a concrete failing stage open;
   project/domain configuration alone is not successful publication.

## Hosted acceptance

- Public service/Contact pages, matching canonical/OG/sitemap origin and no private
  work in the sitemap.
- Three dedicated demo role destinations; wrong-role redirects, foreign-record 404,
  HttpOnly/Secure `__Host-` cookie and explicit logout.
- Real Google account sign-in on the HTTPS canonical origin. Origin changes can
  take time to propagate; do not create another unrelated OAuth client.
- Disposable request approval, qualified assignment, progress, completion and one
  immutable invoice. Do not change existing customer records or technician skills.
- Actual provider sandbox cancel and explicit replacement, verified success,
  browser 303 return, matched invoice/payment and one settlement. Exercise provider
  server IPN over public HTTPS; do not post forged callbacks as evidence.
- Real paid-work feedback and reload. Inspect lost/stale outcomes explicitly.
- Mobile/theme checks and lab performance on the deployed build; report actual
  Safari/hardware/field-data limitations separately.
- Real profile upload/save/reload/removal and catalog/detail optimizer delivery with
  explicitly disposable records. Inspect missing-image fallbacks and ownership/role
  rejection; clean only exact test references/assets and retain audit history.

Keep proof limited to synthetic identities, safe record IDs and verification status.
Never capture tokens, Redis passwords, merchant keys or provider session URLs in
public screenshots/logs. Evaluation credentials belong in the private submission
channel, not this repository.

## Recovery

A failed build/health check stops the release. Inspect logs without printing secrets.
Frontend rollback must retain the same session encryption/store configuration.
The media migration is additive: code rollback can retain the nullable image columns and
owned-media table. Do not drop media records or reverse migrations as an emergency rollback.
If rolling back the media backend, first disable frontend upload controls by restoring the
previous frontend build; then restore the previously verified backend revision. Existing
nullable fields allow that older code to run without a database reset. Payment callbacks
remain backend-authoritative even during frontend
outage; returning to a URL cannot create a settlement. Inspect the actual invoice
and payment before any replacement attempt.

References: [Vercel environments](https://vercel.com/docs/deployments/environments),
[Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration),
[Upstash Redis compatibility](https://upstash.com/docs/redis/overall/compatibility),
[Google client setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
