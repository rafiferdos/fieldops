# FieldOps Frontend

Programming Hero B7A7 frontend for Field Service Management (student ID ending in 7).
Next.js App Router with strict TypeScript and the exact shadcn preset `b2w3Yl9Ygc`.

Implemented: responsive public pages and real service browsing, secure server-owned
sessions, registration/login/account management, and customer request list, wizard,
detail, edit and cancellation; admin review, qualified dispatch and rescheduling;
technician progress/completion and role-scoped work tracking; immutable invoices,
durable checkout recovery, verified payment inspection, eligible customer feedback,
period reporting, administrative service catalog management, confirmed user access
changes and filtered audit-history inspection.
The backend is a separate repository and has not been modified.

## Project guide

- [Implementation status and verification limits](docs/implementation-status.md)
- [Target route, role and API mapping](docs/route-plan.md)
- [Screen flows and design handoff](docs/screen-flows.md)
- [Design refinement and motion verification](docs/design-refinement.md)
- [Hero motion, frosted navigation and component decisions](docs/optical-design.md)
- [Original editorial imagery and generation prompts](docs/editorial-assets.md)
- [Dispatch/execution plan and recovery rules](docs/dispatch-execution-plan.md)
- [Billing, reporting and catalog boundaries](docs/billing-admin-plan.md)
- [User access, session revocation and audit boundaries](docs/access-audit-plan.md)
- [Payment return transport and sandbox verification](docs/payment-return-plan.md)

Twenty-eight route templates exist, including two payment-return pages that read
actual owned payment/invoice state. The narrowly authorized backend browser-return
transport is implemented; the hosted API still needs a separately authorized update.
Route count alone does not establish assignment completion. Technician skills, verified contact content and delivery
remain incomplete. The route plan maps all 38 backend domain APIs and two health endpoints.

## Run locally

Use Node **24.21.0 LTS** and npm **11.19.0**. Versions and the lockfile are pinned.
With the existing mise installation:

```bash
cd /home/rafiferdos/dev/programming_hero/assignments/assignment7/fieldops
mise exec node@24.21.0 -- npm ci
cp .env.example .env.local
docker compose up -d sessions
```

Generate the SESSION_ENCRYPTION_KEY once and save its output privately in `.env.local`:

```bash
mise exec node@24.21.0 -- node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Set API_BASE_URL to the actual backend (`http://localhost:3000/api/v1` by default,
or `https://fieldops-api-xu3s.onrender.com/api/v1`). APP_ORIGIN must exactly match
the browser origin, without a trailing slash. Start the frontend:

```bash
mise exec node@24.21.0 -- npm run dev
```

Open http://localhost:3001. The frontend uses 3001 so the backend can use 3000.
The local session store listens only on loopback port 6397 and is independent of
the backend Redis service. Stop it with `docker compose down`; the volume persists.
Do not regenerate the encryption key on each restart.

Google login requires an optional public GOOGLE_CLIENT_ID matching the backend
Google audience and authorized JavaScript origin. Its button is absent when not
configured; no fake Google flow is offered. Optional DEMO_CUSTOMER/TECHNICIAN/ADMIN
email/password variables enable server-side demo buttons. Use dedicated sandbox
accounts; the backend determines their actual roles. No password/token belongs in
NEXT_PUBLIC variables, client source, committed docs or screenshots.

Production requires HTTPS APP_ORIGIN and a private authenticated TLS Redis URL.
All application instances need the same encryption key and session store. A session
store outage denies access; it does not grant access from a fallback cache.

## Verify

With Node 24 active:

```bash
npm run check
npm run build
npm run start
```

`check` runs Prettier, typed ESLint, generated route types, TypeScript and Vitest.
The ordinary suite has 156 tests. Enable six additional real-Redis concurrency
checks using the dedicated local store:

```bash
SESSION_TEST_REDIS_URL=redis://127.0.0.1:6397 npm test
```

CI installs from the lockfile and provisions a pinned Redis image for all 162 tests,
checks and build. Official GitHub actions use immutable revisions. CI does not
deploy. A hosted CI run has not occurred because this repository has not been pushed.

The supported `npm run build -- --webpack` production build passes locally.
Default Turbopack was blocked by this execution environment's port restriction;
the default build command is preserved. For the same restricted environment, use
`npm run dev -- --webpack` for development.

Browser tests require a running frontend and real backend, plus matching Chromium:

```bash
npx playwright install chromium
npm run test:e2e
E2E_DEMO_ACCOUNTS=1 E2E_LIVE_WRITES=1 npm run test:e2e
```

The first command runs read-only/validation browser tests. The opt-in flags enable
configured demo accounts and create a disposable customer/request, verify profile
update and request edit/cancellation, then verify foreign-record privacy. The test
eligible unstarted requests are cancelled. Execution checks create a real completed
work order and an unpaid invoice; completed/rejected records and audit history remain. Catalog
checks soft-delete only their uniquely named disposable services. Checkout checks initiate
an actual sandbox session, deliberately lose its response and recover the same attempt.
Do not run
these writes against real customer accounts. Tests have no automatic retries and
record no auth traces/video. Opted-in test files wait for a fresh authentication
window before running, respecting the backend's ten-logins-per-minute limit. Browser
output folders and environment files are ignored.

The unit/integration suite contains 162 checks. The Chromium suite contains 27 scenarios:
fifteen real-API workflows, six design scenarios and six presentation/component scenarios. It covers
no-JavaScript public content, reduced motion and cleanup, keyboard disclosures,
password visibility, 320–1440px layouts, theme contrast, stable animated word geometry,
CSS frost and styled Select submission. Dispatch coverage includes stale review, competing
assignment and price-preserving reschedule. Execution commits a real completion,
deliberately loses its browser response, preserves the report and explicitly reads
the result without automatic replay. A separate identical backend completion replay
returns the same invoice. The earlier 24-scenario checkpoint passed (23 in the full run
and the corrected read-only overview scenario in a focused rerun). Three additional
scenarios cover newly created disposable users, actual revocation/reactivation,
stale and lost access responses, self-change sign-out and real audit inspection. See
[current verification](docs/implementation-status.md) and the
[design checkpoint](docs/design-refinement.md).

Real Redis is used for refresh coordination; its backend HTTP rotation response is
stubbed. Firefox public presentation/control smoke checks pass. WebKit cannot launch
on this host because required system libraries are missing. Real Google OAuth,
backend replay after token expiry, distributed failover, actual Safari/mobile
hardware and deployment HTTPS behavior are not claimed as verified.

## Architecture and engineering rules

```text
src/
  app/                         # Small route compositions and framework boundaries
    (public)/                  # Home, process, FAQ and service catalog
    (auth)/                    # Login and registration
    (workspace)/               # Protected role entries, account and customer requests
  features/
    services/                  # Catalog schemas, server reads, cards and tests
    marketing/                 # Server-rendered public journey and featured catalog
    auth/                      # Auth actions, current viewer, return policy and forms
    account/                   # Own-profile form, schema and action
    requests/                  # Shared customer/admin requests and customer forms
    dispatch/                  # Review, qualified availability, assignment and reschedule
    work-orders/               # Scoped queues, tracking, progress, completion and recovery
    billing/                   # Frozen invoices, encrypted checkout intents and verified payment state
    feedback/                  # One-time eligible reviews and explicit outcome inspection
    admin/                     # Overview/reporting, managed access and read-only audit history
  shared/
    ui/                        # Official shadcn primitives
    components/                # Reused presentation and layout pieces
    providers/                 # Theme provider
    lib/                       # Small typed formatting/query/result helpers
  infrastructure/
    api/                       # Server-only fetch, validated envelopes and safe errors
    env/                       # Lazy, server-only configuration validation
    session/                   # Redis coordination, authenticated encryption and origin checks
```

Colocate schemas/types/tests with their workflow. Add concise English intent comments
for mini-features, business rules and non-obvious decisions; avoid narrating syntax. Routes compose features; shared
code and infrastructure never import domain features. Server Components read/render;
client boundaries handle interactive forms, navigation and dialogs. React Hook Form
and Zod validate client input again at the explicit server boundary. External data
is parsed; there is no any, unsafe cast, ignored type error or unrestricted API proxy.

Preserve the exact preset: Base UI Rhea, zinc/emerald semantic tokens, Outfit headings,
Geist body and supported light/dark themes. Use installed shadcn controls, including
Select, Card, Collapsible, NavigationMenu, Empty, Pagination, Separator, Sheet,
AlertDialog and Toast. Navigation uses shadcn button variants with native link semantics. Do not use browser alert/confirm. Add a
component with the pinned CLI only when a real screen needs it:

```bash
npx shadcn add dialog
```

API_BASE_URL stays server-only and is constrained to an HTTPS `/api/v1` base, with
HTTP allowed on loopback. The transport validates success/error envelopes, confines
paths to that origin/version, rejects redirects, keeps tokens in headers, uses
no-store and a 30-second timeout, and supports GET/POST/PUT/PATCH/DELETE. GET/DELETE
cannot carry bodies through its typed interface. No write is automatically retried.

Sessions use opaque HttpOnly cookies, encrypted Redis tokens, same-origin actions,
per-request backend account checks and coordinated single-use refresh. Request
mutations carry explicit versions and respect backend ownership/state rules.
Conflict/uncertain outcomes preserve inputs and require latest-state inspection.
Prices are BDT minor units; immutable invoice/payment behavior is not reimplemented.
User access changes require review and confirmation, preserve backend last-admin/work
rules and revoke sessions. Audit metadata uses an explicit per-action allowlist.
See implementation status for the precise session lifecycle and its failure limits.

## Versions and dependency limits

Verified against official documentation and registry metadata on October 8, 2026:

- Next.js 16.4.0, React/React DOM 19.3.0, Tailwind 4.3.3 and shadcn 4.21.4.
- TypeScript 6.0.3 and typed typescript-eslint 8.71.1. Registry TypeScript 7.0.2 is
  outside the linter's supported range (below 6.1).
- ESLint 9.39.5 remains within Next's React/accessibility/import plugin peer ranges;
  registry ESLint 10.12.0 is outside them. ESLint 9's end of support remains a limitation.
- Zod 4.6.5, React Hook Form 7.89.0, resolvers 5.9.1 and Redis client 6.3.0.
  Forms support React 19/Zod 4; Node 24 satisfies the client runtime requirement.
- GSAP 3.15.0 and @gsap/react 2.1.2 were verified on October 9, 2026. Marketing
  uses scoped word transforms and ScrollTrigger; shared entry effects use native
  Web Animations. Motion was removed to avoid overlapping animation engines.
- Recharts 3.10.1 with react-is 19.3.0 was verified against official registry metadata
  and shadcn Chart documentation on October 9, 2026. The stable version supports
  React 19 and provides the actual reporting chart. No new résumé claim is implied.
- Vitest 5.0.3 and Playwright 1.64.0. The pinned official Redis test image reports 8.10.2.

The audit still has nine high-severity development/build-tool findings through braces
(GHSA-vfj7-8cjw-p6xm); no compatible patched release was available when reviewed.
Runtime-only audit reports zero vulnerabilities at this checkpoint. Do not force
incompatible downgrades with `npm audit fix --force`; recheck upstream before release.
This is not a zero-risk dependency claim.

## Requirements, evidence and remaining work

Read [official README](https://github.com/Apollo-Level2-Web-Dev/B7A7),
[requirements](https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/project-requirements.md),
[timeline](https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/timeline-breakdown.md)
and the [implemented backend contract](https://app.notion.com/p/3f34ab5df14481afa4acc3e9a092b940).
Exactly CUSTOMER, TECHNICIAN and ADMIN are supported. The explicit 18-page rule
takes precedence over the conflicting 15-page heading. Delivery also requires real
APIs, three demo logins, validated forms, supported test-mode payments, at least 20
meaningful frontend commits, live URL/demo credentials and a 5–10 minute walkthrough.
Those delivery requirements remain incomplete.

The backend retains JSON/IPN callbacks and adds a no-store 303 browser transport.
An expired frontend session preserves the attempt through login. Invalid or forged
return queries cannot establish payment success. See the payment-return plan for
verification and deployment limits.
There is no current-skill read API, so do not silently overwrite unknown skills with
an empty prefilled editor. No contact channel, public review feed, earnings report
or unsupported write endpoint has been invented.

The [previously reviewed resume assessment](https://app.notion.com/p/3f14ab5df14481b9bdccd1349fd83a18)
lists React/Next.js, TypeScript, Docker and CI/CD as existing skills. RHF/Zod,
TanStack Query and automated testing were not listed; absence does not imply lack of
ability. The original resume file was not available in this workspace. New project
evidence now includes validated forms, tested API boundaries, Redis-backed encrypted
sessions and browser tests; these are potential resume additions, not a claim that
the full product is finished. TanStack Query and an additional client state store are not installed;
Recharts is used only for the actual administration chart.
The previously reviewed [Hyperlink role](https://www.thehyperlink.io/jobs/full-stack-engineer-mid-senior-typescript)
provides one signal for RHF/Zod, Vitest and Playwright, not a market ranking or verified
posting date. Contract needs and working evidence take precedence over dependency count.

Official references: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication),
[Next.js installation](https://nextjs.org/docs/app/getting-started/installation),
[environment variables](https://nextjs.org/docs/app/guides/environment-variables),
[shadcn CLI](https://ui.shadcn.com/docs/cli),
[shadcn Chart](https://ui.shadcn.com/docs/components/base/chart),
[Recharts installation](https://recharts.github.io/en-US/guide/installation/),
[SSLCommerz integration](https://developer.sslcommerz.com/doc/v4/),
[RHF forms](https://ui.shadcn.com/docs/forms/react-hook-form),
[Zod resolver](https://github.com/react-hook-form/resolvers#zod),
[Google Identity Services](https://developers.google.com/identity/gsi/web/guides/display-button),
[node-redis](https://redis.io/docs/latest/develop/clients/nodejs/),
[Playwright configuration](https://playwright.dev/docs/test-configuration),
[Node.js releases](https://nodejs.org/en/about/previous-releases).
