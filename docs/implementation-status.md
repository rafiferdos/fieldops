# Implementation status

Reviewed October 9, 2026. Product slices now include safe technician skills and
owner-verified Contact channels. The owner authorized the remaining delivery stages,
including limited backend skills/payment changes, QA, publishing and submission
artifacts. Both applications have live CI-verified baseline releases; the workspace
upgrade below has a separate verification/release record. Dedicated
session storage, protected production settings and evaluation accounts are configured
with specific owner approval. See [hosted release evidence](hosted-release.md).
Use [Frontend CI](https://github.com/rafiferdos/fieldops/actions/workflows/ci.yml)
to inspect the exact source revision before release.

Verification uses dedicated disposable accounts and work. Eligible unstarted test
requests are cancelled; completed work, invoices and audit records remain. Secrets
stay in ignored local files or approved protected host configuration.

## Delivered routes and workflows

| Area           | Routes                                                                           | Implemented behavior                                                                              |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Public         | `/`, `/about`, `/faq`, `/contact`                                                | Responsive shell, real catalog preview, process/FAQ, verified support and mobile Sheet            |
| Catalog        | `/services`, `/services/[serviceId]`                                             | Real search/sort/pagination URL state, empty/error/missing states and validated request entry     |
| Authentication | `/login`, `/register`                                                            | Customer registration, password/demo login, role destinations and configurable Google integration |
| Account        | `/account`                                                                       | Current backend-verified profile, own name/phone update and logout                                |
| Dashboards     | `/customer`, `/technician`, `/admin`                                             | Account-scoped live counts, status charts, recent records and explicit refresh                    |
| Requests       | `/customer/requests`, `/customer/requests/new`, `/customer/requests/[requestId]` | Own queue, three-step wizard, pending edit, eligible cancellation and linked work                 |
| Dispatch       | `/admin/requests`, `/admin/requests/[requestId]`                                 | Review queue, versioned approval/rejection, cancellation and qualified assignment                 |
| Admin work     | `/admin/work-orders`, `/admin/work-orders/[workOrderId]`                         | Global scoped work queue, timeline, invoice/feedback summaries and eligible reschedule            |
| Technician     | `/technician/work-orders`, `/technician/work-orders/[workOrderId]`               | Scheduled queue, legal progress, completion report and explicit uncertain-outcome inspection      |
| Customer work  | `/customer/work-orders`, `/customer/work-orders/[workOrderId]`                   | Own confirmed visits, report, timeline, invoice and existing feedback                             |
| Admin overview | `/admin`                                                                         | URL period validation, creation-cohort counts, exact verified revenue and status chart            |
| Invoices       | `/customer/invoices/[invoiceId]`, `/admin/invoices/[invoiceId]`                  | Frozen amount/status, owner checkout entry and role-restricted administrative inspection          |
| Payments       | `/payments/[paymentId]`, `/payment/success`, `/payment/cancel`                   | Provider browser returns and verified attempt/invoice inspection; no invented settlement          |
| Catalog admin  | `/admin/services`                                                                | URL-driven active list, validated create/edit, stale preflight and confirmed soft deletion        |
| User access    | `/admin/users`                                                                   | Safe directory filters, confirmed role/status edits, stale/uncertain blocking and self sign-out   |
| Audit history  | `/admin/audit-logs`                                                              | Exact filters, paired Dhaka period, newest-first pagination and safe metadata disclosure          |

There are 31 route templates, including two authenticated payment returns, and 35
domain API operations bound in production code. The backend has 39 domain APIs,
two health endpoints and one additional browser-return route template. This count
excludes framework utility routes and does not establish delivery completion.
Hosted HTTPS returns and production Redis/configuration are verified. Provider IPN
evidence is tracked in the hosted release record. Real Google OAuth passes locally;
the owner confirmed hosted sign-in after the supported FedCM button update.

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

GSAP 3.15.0 owns marketing word entry, shared surface reveals and scroll-linked image/card
depth. Desktop public pages use ScrollSmoother; touch and reduced-motion browsing retain
native scrolling. Entry observers start near the viewport edge and keep reading contrast
at full opacity. Reduced motion reverts text and
transforms. Stable server word markup avoids clipping and completion spacing shifts.
The navbar uses one CSS frosted shadcn Card with an opaque accessibility fallback.
Public FAQ uses original editorial image cards with accessible in-card disclosures. See
[hero and navbar design](optical-design.md), [asset provenance](editorial-assets.md) and
[design verification](design-refinement.md) for decisions and precise limits.

## Baseline verification and remaining limits

This section preserves the earlier release's evidence. The newer session-scoped dashboards,
account menu, sidebar and motion changes have their own
[workspace-upgrade verification](workspace-upgrade.md#local-verification-checkpoint): 185
passing checks, a production build, real-role follow-ups and eight presentation checks.

- Frontend strict checks pass: formatting, typed lint, generated route types,
  TypeScript and 170 tests (164 ordinary plus six real-Redis checks). Redis refresh
  coordination uses a stubbed HTTP rotation response; it is not live backend replay.
- Both default Turbopack and webpack production builds pass locally.
- Backend checks, build, API docs, 129 unit tests and 472 database integration tests
  pass. Current pushed revision f6e9670 also passed [GitHub CI](https://github.com/rafiferdos/fieldops-api/actions/runs/37898892822).
- The current Chromium source contains 34 scenarios, including three axe scenarios,
  actual skills replacement and metadata verification. A complete 33-scenario run
  passed 32; its metadata check detected different build/runtime test origins.
  The final build passed the 15 design/accessibility checks and the corrected
  metadata check separately (all 16 passing). Normal-motion text contrast passes
  in both themes. The metadata test also waits for actual detail navigation before
  reading its identity. No new application change was required for that test race.
  Retries remain disabled; no passing 34-scenario full run is claimed.
- Real browser flows cover catalog, registration, roles, ownership, request edits,
  dispatch collisions, stale review, reschedule, completion, immutable invoices,
  encrypted checkout recovery, feedback, administrative access/audit and skill CAS.
  Losing committed completion/checkout/feedback/access/skills responses blocks
  automatic replay and requires inspection. These writes use actual backend data.
- The real provider sandbox cancellation/replacement/settlement/paid-feedback
  scenario passes in that full run. Synthetic card/OTP data is used, with no live
  funds. One cancelled and one successful attempt retain matching frozen money and
  one settlement/invoice-paid result. That local checkpoint used loopback browser
  returns; newer HTTPS/IPN results are recorded in the hosted release evidence.
- Actual Google Identity Services sign-in passes on localhost:3001 with the existing
  backend audience. The owner-approved Vercel origin is saved and survives reload.
  The owner subsequently confirmed production Google sign-in on the final hosted
  frontend with explicit FedCM account consent.
- Axe scans use WCAG A/AA tags, both themes and no rule exclusions. Reduced-motion
  public pages and all three role workspaces pass. Normal-motion contrast receives
  its own regression check. These scans complement keyboard/layout tests; they do
  not replace human screen-reader and device review.
- Lighthouse 13.5 local webpack production-build lab measurements: mobile 92/100/100/100 and desktop
  99/100/100/100 (performance/accessibility/best practices/SEO). Mobile LCP is 3.3s,
  TBT 40ms and CLS 0; desktop LCP 0.9s, TBT 0ms and CLS 0. Removing opacity from
  unentered process text fixed the measured desktop contrast finding. Accurate
  image candidates removed the desktop image-delivery warning. These are individual
  lab runs on the production build, not field evidence or hardware guarantees.
- Firefox public/control smoke checks previously pass. WebKit cannot launch because
  host libraries are missing. Actual Safari/mobile hardware, live-mode money,
  distributed failover and long-running token-expiry replay are not claimed.
- Runtime dependency audit reports zero findings. Nine development/build findings
  through braces have no compatible patched release; no forced downgrade is applied.

See [skills, support and delivery](skills-support-delivery.md) for current contracts,
metadata/contrast decisions and release gates. The actual 6:19 walkthrough is recorded, with 23 English-captioned scenes and
verified paid feedback. Its output is a local artifact outside Git. Hosted deployment,
protected session configuration and the newer acceptance results are documented in
the release record. No external video upload or portal submission is claimed.

## Hosted acceptance checkpoint

The hosted baseline passed 33/34 scenarios in 14.3 minutes, with retries disabled.
The new HTTPS cookie assertion detected that a generic deletion omitted the Secure
attribute required by the __Host- prefix. Server-side revocation already denied
access; the fix additionally expires the browser cookie with Secure and Path=/.
The final deployed frontend passes self-access revocation and all three demo-role
cookie/logout scenarios (4/4, 2.5 minutes). Earlier local results above retain their
original provenance; no single all-passing full 34-scenario run is claimed.

Four native Upstash coordination tests pass on the dedicated authenticated TLS store.
They verify the actual Lua/lease behavior with stubbed backend refresh HTTP, not a
real token-expiry journey. Hosted Lighthouse 13.5 scores are mobile 87/100/100/100
and desktop 100/100/100/100. Mobile LCP is 3.7s, TBT 90ms and CLS 0; desktop LCP
is 0.5s, TBT 0ms and CLS 0. These are individual warm-host lab runs.
