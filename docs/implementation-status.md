# Implementation status

Reviewed October 8, 2026. This checkpoint implements roadmap steps 2–4. The backend
repository is unchanged. No push, deployment, dispatch or payment implementation
was performed. Real verification created disposable customer/request records and
cancelled the verification requests; these records remain because no deletion API
exists. Demo credentials are local-only and were used with explicit permission.

## Delivered routes and workflows

| Area           | Routes                                                                  | Implemented behavior                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public         | `/`, `/about`, `/faq`                                                   | Preset-based responsive shell, real catalog preview, accurate process/FAQ content, theme and accessible mobile Sheet                                  |
| Catalog        | `/services`, `/services/[serviceId]`                                    | Real API data, search/sort/pagination in URL, empty/failed/missing states, validated service entry into login/request flow                            |
| Authentication | `/login`, `/register`                                                   | Customer registration, password login, configured three-role demo login, safe role destinations, Google Identity Services integration when configured |
| Account        | `/account`                                                              | Backend-verified current account, name/nullable-phone update, logout                                                                                  |
| Customer       | `/customer`, `/customer/requests/new`, `/customer/requests/[requestId]` | Scoped list, URL filters, three-step wizard, Dhaka timestamps, request detail, pending edit, eligible cancellation with AlertDialog                   |
| Role entry     | `/admin`, `/technician`                                                 | Backend-verified role landing and account navigation; operational dashboards/queues are not implemented                                               |

There are 13 route templates, including the two limited role landing pages. This
does not satisfy or claim the assignment's 18-functional-page delivery requirement.
Fourteen domain API operations are bound in production code. Google login is
configuration-dependent; refresh uses real Redis tests with a mocked HTTP rotation
response, not a claim of live Google or backend replay validation.

## Session design

- The cookie contains a random 256-bit opaque ID. It is HttpOnly, SameSite=Lax,
  path=/ and Secure on HTTPS. HTTPS uses the `__Host-` cookie prefix. HTTP is accepted
  only on loopback for local development/testing.
- Redis keys hash the cookie ID. AES-256-GCM encrypts backend tokens and binds the
  payload to its session key through authenticated additional data. The configured
  32-byte key must be identical across instances; changing it invalidates sessions.
- The frontend Redis store is independent of backend cache/data ownership. Production
  requires a private authenticated `rediss://` store, persistent storage and deliberate
  expiry/eviction settings. Local Compose exposes Redis only on loopback with a pinned
  official image and persistent volume. Browser tests used a separate ephemeral store.
- Current account and role are verified through `/users/me` per request. React's
  request-scoped cache avoids redundant reads within one render; it is not a shared
  authorization cache. Page reads and every mutation enforce access independently.
- Refresh uses a distributed per-session lease, re-reads after acquisition, and
  writes an in-progress marker before using the single-use backend token. Concurrent
  callers share the rotated result. A crash or uncertain outcome discards the session
  instead of replaying the old token. Guarded writes cannot resurrect a deleted session.
- Access expiry has a conservative 35-second margin covering the 30-second API timeout.
  Redis commands have a five-second timeout, bounded queue and no offline replay.
  Storage failure denies access; there is no in-memory authorization fallback.
- Same-origin Server Actions validate APP_ORIGIN in addition to Next.js protections.
  They never expose backend credentials or a generic proxy. Logout attempts backend
  revocation and clears the browser cookie even if storage removal fails. An uncertain
  backend failure is reported; global revocation is not falsely claimed in that case.

## Request rules and composition

Schemas, server reads/actions, policy tests and client forms live together under
`features/requests`. Services, auth and account have their own modules. App routes
compose those features; shared primitives do not import domain features. Server
Components render reads; forms/dialogs/navigation alone use client boundaries.

The wizard preserves values between steps and submits a strict backend-shaped
body. Customers cannot supply ownership, price or role. The preferred visit is
explicitly Dhaka UTC+06:00, independent of the browser's timezone. Large catalogs
can be searched from the public catalog; a selected service outside the first 100
options is fetched separately and included.

Edits use the request version and exclude service changes. Cancellation uses the
request version and only appears before assigned work leaves ASSIGNED. Backend
transactions remain authoritative. Stale or uncertain outcomes block another
submission until the latest record is inspected. No mutation is automatically retried.
Request detail includes its available work summary; full work tracking is a later slice.

## Verification and remaining limits

- `npm run check`: formatting, typed lint, generated route types, TypeScript and
  59 ordinary tests; four real-Redis tests are skipped without SESSION_TEST_REDIS_URL.
- With the isolated Redis URL: all 63 tests pass, including concurrent refresh,
  uncertain/crashed rotation, ciphertext integrity, role return paths, strict schemas,
  timezone conversion and cancellation rules. CI provisions Redis for those tests.
- `npm run build -- --webpack`: production build passes. The default Turbopack
  build was blocked by this execution environment's port restriction; no default
  bundler change is committed. Hosted CI has not run because no push occurred.
- Seven Chromium browser tests pass against the hosted API and production frontend:
  real catalog/URL history, mobile/keyboard/theme, registration validation, all three
  demo role login/logout/cookie protections, disposable registration/profile update,
  request create/edit/cancel and foreign request privacy. Tests do not ship mocks.
- Real Google OAuth requires an authorized Web client ID, configured Google origins
  and a human Google account. Its browser/provider round trip has not been verified.
- Refresh HTTP behavior is stubbed in focused concurrency tests. Browser tests do
  not wait 15 minutes to exercise actual backend rotation/replay. Distributed Redis
  failover and production HTTPS cookies need deployment-environment verification.
- Automated checks are not a complete accessibility audit or a Firefox/WebKit
  compatibility claim. Admin dispatch, technician execution, invoice/payment return,
  feedback and reporting remain outside this checkpoint.

Payment-return and current-skill read gaps remain as described in the route plan.
No contact page was invented without verified support details.
