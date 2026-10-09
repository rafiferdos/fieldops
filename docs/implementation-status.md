# Implementation status

Reviewed October 9, 2026. This checkpoint implements roadmap steps 2–6 and five
billing/administration slices from steps 7–8, followed by user access and audit browsing.
Automatic browser return and real sandbox cancellation/retry/settlement/paid-feedback
verification are now implemented under the explicitly authorized payment-only backend
exception. The hosted API has not been updated. No push or deployment was performed. Verification creates
only disposable accounts and requests, cancels eligible unstarted requests, and
retains rejected/completed records and unpaid invoices because no deletion API exists.
Demo credentials remain local-only and were used with explicit permission.

## Delivered routes and workflows

| Area           | Routes                                                                  | Implemented behavior                                                                              |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Public         | `/`, `/about`, `/faq`                                                   | Responsive preset shell, real catalog preview, process/FAQ, theme and accessible mobile Sheet     |
| Catalog        | `/services`, `/services/[serviceId]`                                    | Real search/sort/pagination URL state, empty/error/missing states and validated request entry     |
| Authentication | `/login`, `/register`                                                   | Customer registration, password/demo login, role destinations and configurable Google integration |
| Account        | `/account`                                                              | Current backend-verified profile, own name/phone update and logout                                |
| Requests       | `/customer`, `/customer/requests/new`, `/customer/requests/[requestId]` | Own queue, three-step wizard, pending edit, eligible cancellation and linked work                 |
| Dispatch       | `/admin/requests`, `/admin/requests/[requestId]`                        | Review queue, versioned approval/rejection, cancellation and qualified assignment                 |
| Admin work     | `/admin/work-orders`, `/admin/work-orders/[workOrderId]`                | Global scoped work queue, timeline, invoice/feedback summaries and eligible reschedule            |
| Technician     | `/technician`, `/technician/work-orders/[workOrderId]`                  | Scheduled queue, legal progress, completion report and explicit uncertain-outcome inspection      |
| Customer work  | `/customer/work-orders`, `/customer/work-orders/[workOrderId]`          | Own confirmed visits, report, timeline, invoice and existing feedback                             |
| Admin overview | `/admin`                                                                | URL period validation, creation-cohort counts, exact verified revenue and status chart            |
| Invoices       | `/customer/invoices/[invoiceId]`, `/admin/invoices/[invoiceId]`         | Frozen amount/status, owner checkout entry and role-restricted administrative inspection          |
| Payments       | `/payments/[paymentId]`, `/payment/success`, `/payment/cancel`          | Provider browser returns and verified attempt/invoice inspection; no invented settlement          |
| Catalog admin  | `/admin/services`                                                       | URL-driven active list, validated create/edit, stale preflight and confirmed soft deletion        |
| User access    | `/admin/users`                                                          | Safe directory filters, confirmed role/status edits, stale/uncertain blocking and self sign-out   |
| Audit history  | `/admin/audit-logs`                                                     | Exact filters, paired Dhaka period, newest-first pagination and safe metadata disclosure          |

There are 28 route templates, including two authenticated payment returns, and 33 domain API
operations bound in production code. Route count is not a claim of full assignment
compliance: technician skills, contact content and delivery remain incomplete.
Hosted HTTPS payment return/IPN verification remains part of delivery. Google login is
configuration-dependent. Refresh concurrency tests use real Redis with a stubbed
HTTP rotation response, not live Google or backend replay validation.

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
  official image and persistent volume. Browser checks use the dedicated frontend session store, never the backend Redis service.
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
Request detail includes its available work summary and links to role-scoped work tracking.

## Dispatch and execution rules

The [implementation plan](dispatch-execution-plan.md) records scope, composition
and acceptance gates. Admin queues reuse request presentation with independently
checked role boundaries. Approval/rejection use the request version; rejection
requires its reason. Assignment uses only technicianId/start/end and accepts no
version or client price. Reschedule uses the work version and preserves the agreed
price. Available technicians are active, qualified and unbooked according to the API.

Visit windows are explicit Dhaka times, future, positive and at most eight hours.
Window and availability page are URL state. Editing the window clears technician
selection; even re-searching the identical URL reads again. Availability does not
reserve a visit. A conflict or uncertain write blocks submission until the record
and availability are refreshed and a technician is explicitly chosen again.

The availability API cannot exclude the current booking. To keep the same technician
when rescheduling, the operator must search outside that booking's window. No
unsupported exclusion parameter, skill overwrite or eligibility shortcut was added.

Only the assigned technician sees execution controls. The UI offers ASSIGNED →
EN_ROUTE → IN_PROGRESS, then a separate report/completion action. Backend ownership,
versions and transactions remain authoritative. Completion atomically freezes the
report and creates the unique invoice; the browser cannot specify invoice data.

On stale or uncertain execution, the report stays in the form and actions are
blocked. Explicit inspection reads the latest work; a confirmed completed state
removes write controls and shows the actual invoice. No action is automatically
retried. Customer/admin screens show request review state separately from work
progress, the latest 100 timeline events and immutable invoice summaries. Existing
feedback is readable; eligible customers can now submit one immutable review.

## Billing, reporting and catalog management

The [five-slice plan](billing-admin-plan.md) records financial boundaries and remaining
integration gaps. Customer/admin invoice pages read the actual frozen snapshot;
technicians keep only their nested summary. Checkout saves encrypted billing and a
UUID intent in the private frontend Redis before provider I/O. Concurrent tabs use
one intent, reloads retain it and explicit recovery reuses the same key/body. New
attempts require a verified failed/cancelled payment, unpaid invoice and no review hold.

Payment status reads both the actual attempt and invoice. Success requires matching
identity/money, SUCCEEDED/PAID and settlement evidence. Review flags are independent
of paid status. Only supported exact HTTPS gateway origins can open checkout. The
provider opens in another tab and returns that tab through the new backend 303
transport. Return pages never trust status queries or manufacture success/cancel.
Reauthentication preserves the exact attempt. A cancelled/failed attempt whose
invoice is now paid is identified as an earlier attempt, not a successful charge.

Feedback validates rating and optional comment, checks current owned work and any
known saved payment hold, and never retries an uncertain submission automatically.
Explicit inspection retains the explanation and discovers existing feedback. The
API does not expose payment history; review information outside the saved attempt
remains a backend-authoritative eligibility concern.

Overview dates represent Dhaka midnight in a bounded half-open range. Revenue uses
BigInt formatting of exact decimal minor units; counts and their cohort meanings
remain explicit. The official shadcn Chart uses stable pinned Recharts and text
counts remain readable without JavaScript. No unsupported daily trend is invented.
Catalog forms parse decimal BDT exactly and send only changed fields. A stale
updatedAt preflight avoids already-stale edits but cannot provide atomic versioning
on the unversioned catalog API. Sheet/AlertDialog controls preserve blocked outcomes
until inspection; soft deletion preserves historical work and financial records.

## User access and audit history

The [access/audit plan](access-audit-plan.md) records behavior and verification limits.
The ADMIN directory uses URL search/role/status/sort/pagination and exposes only safe
managed-user fields. Invalid known criteria withhold reads; forms retain entered
values for correction. A Sheet reviews role/status edits before explicit AlertDialog
confirmation. Only changed fields are sent. The original directory page is re-read
and matched by exact ID, role/status and updatedAt, because there is no single-user
read or atomic access-version API. A moved/stale record requires inspection; this
preflight cannot eliminate a race after the read.

The backend protects the last active administrator and active technician work,
revokes every session on real changes and preserves history. Leaving TECHNICIAN
removes obsolete skills; suspension retains assignments. Reactivation requires a
new login. Confirmed self-changes clear the current frontend session. Uncertain
or conflicting writes remain blocked after reopening the editor until explicit
directory inspection. Access changes are never automatically retried.

Audit history is read-only. Entity/actor UUIDs, exact uppercase action, optional
paired Dhaka dates and pagination are validated before reads. Events always use
the backend's newest-first ordering. Backend metadata is projected through a second
per-action allowlist with bounded scalar/string-array values before UI serialization.
Unknown actions retain event identity but no metadata; nested payloads and credential
keys are omitted. User cards link directly to their real access-change history.

## Design refinement

The implemented screens share editorial typography, readable card/detail surfaces,
responsive icon navigation and the original emerald/zinc preset. Public composition
is server-rendered; the homepage streams only its featured catalog. Authentication,
queues, wizard steps, timelines and recovery screens use the same visual hierarchy.
Preset-matched shadcn Select, Card, Collapsible, NavigationMenu, Empty and Pagination
compositions replace browser-native dropdowns and custom panel controls. Native
link semantics remain intact with shadcn button styles.

GSAP 3.15.0 owns marketing word entry and scroll-linked image/card depth. Shared entry
effects use native Web Animations; Motion is removed. Reduced motion reverts text and
transforms. Stable server word markup avoids clipping and completion spacing shifts.
The navbar uses one CSS frosted shadcn Card with an opaque accessibility fallback.
Public FAQ uses original editorial image cards with accessible in-card disclosures. See
[hero and navbar design](optical-design.md), [asset provenance](editorial-assets.md) and
[design verification](design-refinement.md) for decisions and precise limits.

## Verification and remaining limits

- `npm run check`: formatting, typed lint, generated route types, TypeScript and
  161 ordinary tests. Six real-Redis tests require SESSION_TEST_REDIS_URL.
- All 167 checks pass with the dedicated frontend Redis. They cover session concurrency/integrity,
  role return paths, scheduling bounds, strict write schemas, legal transitions,
  timezone conversion, cancellation, encrypted intent reservation, payment evidence,
  feedback eligibility, report periods, exact BDT arithmetic, access schemas and safe audit projection.
- `npm run build -- --webpack`: production build passes. Default Turbopack was
  previously blocked by this execution environment's port restriction; its default
  command is preserved. Hosted CI has not run because no push occurred.
- The Chromium suite has sixteen real-API workflows, six design scenarios and six
  presentation/component scenarios. Coverage includes no-JavaScript homepage/process,
  reduced motion and cleanup, keyboard FAQ, password visibility, 320–1440px
  public/auth layouts, theme contrast, stable animated word geometry, CSS frost and
  styled Select keyboard/form behavior. Demo queues verify readable status labels in both themes.
- At the earlier billing/catalog checkpoint, the full Chromium run passed 23 scenarios. The overview
  scenario then passed separately after its alert locator was scoped to main content
  instead of also matching Next.js's route announcer. All 24 scenarios have passing
  results; production application code was identical across those runs. The three
  access/audit scenarios are verified separately against the expanded production build.
  All three pass: self-change in the initial run, the other two in a focused rerun
  after test-only locator/URL assertion corrections. Application code was unchanged.
  Retries are disabled; no single 28-scenario run is implied. The new real sandbox
  scenario and existing checkout-recovery regression each pass in focused runs
  against the updated local production frontend/backend.
- Operational coverage against the hosted API and production frontend includes:
  catalog/mobile/auth/customer flows, plus stale review, qualified dispatch,
  competing-slot rejection, price-preserving reschedule, progress, stale technician
  recovery, completion, customer tracking and foreign-record privacy.
- One browser scenario deliberately drops a real completion response after the
  backend commits. It confirms the report is retained, only one completion call was
  made, and explicit inspection discovers the actual invoice. A separate intentional
  identical API replay returns that same invoice. Business data is not mocked.
- A real checkout response is deliberately lost after initiation. Reload restores
  encrypted billing and explicit recovery returns the same payment ID. The real
  sandbox page opens; a fabricated success query cannot change its pending state.
  Another customer receives 404 for both invoice and payment. This regression passes
  again against the updated local backend. A separate actual provider UI scenario
  cancels checkout, explicitly creates a different attempt, uses the official dummy
  card/OTP to settle it, and submits feedback on the freshly paid work. It drops only
  the real feedback response, blocks replay, discovers the saved review through
  inspection and verifies reload. Signed-out return preserves payment identity, an
  injected status cannot alter verified state, old-attempt navigation cannot reopen
  checkout, and the payment screen fits 320px. Business data/provider I/O are real.
- These sandbox checks use the production frontend on localhost:3002 and an updated
  local Nest backend with a separate fieldops_payment_test database, synthetic
  accounts/billing and real sandbox credentials retained only in backend settings.
  Stored proof independently confirms two attempts (CANCELLED/SUCCEEDED), one safe
  receipt, one settlement/invoice-paid event and one feedback/audit, with matching
  frozen amounts and settlement timestamps. No live charge or existing work mutation.
- The actual cancellation shape is merchant CANCELLED plus session FAILED without
  currency. Closing requires stored merchant/session identity, equal gross/original
  amounts and BDT original currency; a supplied settlement currency must also be BDT.
  Merchant cancellation alone cannot close an open session. Seven additional adapter
  checks cover this shape and incomplete/mismatched evidence. Backend strict checks,
  build, 129 unit tests, 89 payment/feedback database tests and offline API docs pass.
  Gateway HTTP is replaced only in those database tests, not the browser scenario.
- The new browser transport was not deployed. Loopback cannot receive server IPN;
  hosted HTTPS return/IPN, real fail/risk UI and live-mode funds are not claimed
  verified by this checkpoint. Already-created hosted sessions keep their JSON returns.
- Catalog verification creates only a unique disposable service, edits its exact
  decimal price, rejects a stale second tab even after reopening its Sheet, and
  confirms soft deletion removes its public detail. It does not mutate existing services.
- Access checks lose one real suspension response, verify original access/refresh
  revocation and rejected login, block a stale second tab, then reactivate and verify
  fresh login. A role change revokes that fresh session. The resulting real audit
  events, metadata and pagination are inspected. A separate disposable self-demotion
  clears the frontend cookie and requires a new customer login. Shared demo access
  is unchanged and fixtures restore their own accounts to ACTIVE CUSTOMER.
- Administrative read checks cover invalid criteria, preserved incomplete periods,
  empty future audit history, filter/page URL state, wrong-role redirects and
  320–1440px layout fit in light/dark presentation. The backend last-admin/active-work
  guards are retained, not tested by changing existing operational users.
- Opted-in browser groups wait for a fresh authentication window to respect the
  backend's ten-logins-per-minute limit; throttling is not disabled or bypassed.
- The hosted connection can time out. Test writes have no automatic retries; inspect
  uncertain outcomes. Tests do not progress or complete pre-existing work fixtures.
- Real Google OAuth still needs configured authorized origins/client ID and a human
  account. Refresh HTTP behavior is stubbed in focused Redis tests; browsers do not
  wait 15 minutes to exercise actual backend refresh replay or distributed failover.
- Firefox public presentation, keyboard/control and responsive smoke checks pass.
  WebKit cannot launch because host system libraries are missing. Production HTTPS
  cookies, actual Safari/mobile hardware and a complete accessibility audit remain
  deployment/review verification. No claim of these checks is made.

The current-skill read gap remains. Payment return transport is implemented and
locally sandbox-verified; deployed HTTPS verification waits for deployment authorization.
No unsupported contact channel, technician earnings or operational report was invented.
