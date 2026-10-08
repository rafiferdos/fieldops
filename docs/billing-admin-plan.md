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
