# Billing and administration slices

## Authorized sequence

1. Immutable invoice pages for the owning customer and administrative inspection.
2. Owner checkout, durable idempotency recovery and provider-verified payment state.
3. One customer feedback submission after completed, paid work.
4. Period administration overview and exact verified revenue.
5. Active service catalog management with explicit creation, edit and soft deletion.

User management, audit browsing and technician skills remain later slices. The
backend repository stays unchanged. All writes enforce current role and same-origin
access again; reads validate IDs and preserve foreign-record privacy. Use existing
shadcn primitives, Server Components and small validated client forms. Each slice
must pass strict checks and production build before its meaningful commit.

## Payment constraints

The implemented backend fixes SSLCommerz success/fail/cancel URLs to its JSON
callback handlers. It does not redirect the browser to the frontend or accept a
frontend return URL. Checkout therefore keeps a separate frontend status page and
opens the provider in another tab. Automatic success/cancel return remains a backend
integration gap; conditional frontend pages must read actual payment and invoice
state, never trust a return query. No callback is forged to claim payment success.

Retain one immutable billing body and idempotency key per customer/invoice before
network I/O. An explicit recovery reuses that exact intent. A timeout never creates
a new key. New attempts require a freshly verified terminal failure/cancellation,
an unpaid invoice and no review hold. Gateway URLs must use the exact supported
HTTPS SSLCommerz origin without credentials. Administrative inspection cannot pay
as a customer. Revenue remains exact decimal minor units, without floating-point
coercion. Report ranges are paired, half-open and at most 366 days.

## Checkout recovery storage

The frontend's private Redis stores AES-256-GCM encrypted billing and its immutable
UUID key before the API call. Authenticated context binds the payload to customer
and invoice. Atomic reservation shares one intent across tabs/instances; guarded
updates prevent stale responses overwriting a replacement. Retention is 30 days,
independent of logout. Persist and protect the Redis volume and encryption key.
Eviction, expiry or loss can remove recovery information; the backend still rejects
a different key while an attempt is unresolved. There is no attempt-list or lookup
by key API, so a lost unresolved intent needs operator investigation, not guessing
a replacement key. Storage errors fail closed. No billing is written to localStorage.

Sandbox initiation/recovery is implemented through the real API. A successful
settlement and cancellation require the actual sandbox flow; focused schema/policy
tests alone do not establish gateway completion or automatic return readiness.

## Verification scope

The strict check and production Webpack build pass at every feature checkpoint.
All 130 unit/integration checks pass with the dedicated frontend Redis, including
concurrent intent reservation, authenticated encryption and guarded intent updates.

Browser verification uses the production frontend and actual hosted API. The checkout
test completes newly created disposable work, receives its real unpaid invoice, drops
only the browser response after actual checkout initiation, reloads frozen billing
and recovers the same payment ID. It opens the real sandbox page, rejects a forged
success query and confirms a different customer's invoice/payment reads return 404.
No provider callback is manufactured. Settlement, cancellation and feedback on freshly
paid work still require provider-flow verification.

The catalog test creates, edits and soft-deletes only its uniquely named service.
It verifies an already-stale edit stays blocked after closing/reopening the Sheet.
The preflight does not claim atomic concurrency protection absent a backend version.
Overview checks use actual aggregates, reject an incomplete period and verify an
empty future cohort without inventing chart data. Narrow layout checks use 320px.

The only new direct runtime dependencies are pinned stable Recharts and matching react-is for
the official shadcn Chart. Runtime-only dependency audit reports zero findings;
nine development-tool findings remain through braces without a compatible fix.
See the README for official references and dependency limits. No deployment, push,
live-mode charge or mutation of pre-existing customer work is part of these checks.
