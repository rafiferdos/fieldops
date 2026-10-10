# Frontend conformance and audit recovery

Implemented October 10, 2026. Backend application code and data contracts were not
modified for this frontend release.

## Audit page recovery

Image uploads append `IMAGE_UPLOADED` records with entity type `MEDIA`. The frontend
previously restricted response entity types to the six query-filter entity types.
Consequently, a legitimate upload event failed response validation and produced the
generic production Server Component error on `/admin/audit-logs`.

Response validation now accepts `MEDIA`. Upload metadata exposes only the bounded
`purpose` field. Provider URLs, credentials, tokens and arbitrary nested metadata
remain excluded. The backend does not accept `MEDIA` as an entity filter, so the
filter choices retain the backend's six-type allowlist; an exact `IMAGE_UPLOADED`
action can inspect these events. A regression test covers this distinction and
safe projection.

## Protected-route preflight and catalog loading

Next.js uses `src/proxy.ts` for an early redirect when the correct opaque session
cookie is missing or malformed. HTTPS accepts the host-only secure cookie;
loopback HTTP uses the development cookie. The login return path retains the
original same-origin path and query. Public pages, API transports and assets are
outside the matcher.

A shaped cookie only permits the normal server rendering path. Session/account
validation, role enforcement and ownership checks still run in pages, reads,
actions and the backend. Proxy neither trusts a client role nor performs remote
backend authorization.

Both catalog routes inherit the accessible shadcn `PageSkeleton` through
`src/app/(public)/services/loading.tsx`.

## Forms and URL state

Service, request, work-order, account-directory, audit and reporting filters use
RHF/Zod through a shared client form composition. Feature components own the field
choices and validation rules; shared UI does not import domain modules. Server
Components still fetch the records and validate URL input independently.

Submission keeps explicit service scope and page size, drops the old page number,
encodes search/sort/filter values and navigates through the Next.js router.
`useSearchParams` identifies the active URL. Form reset also handles restored route
segments that would otherwise retain dirty input on Back/Forward. Suspense isolates
URL-dependent controls and validation errors remain associated with their fields.
Invalid filter input preserves the last valid records and sends no invalid read.

Cancellation uses the server's 3–500 character reason schema with RHF. Pending,
stale-version and uncertain-outcome protections still prevent unsafe retries.

## Demo account notice

Selecting a role opens a shadcn dialog before the existing demo login action.
Dismissal never authenticates. The safe close control receives initial focus,
pending sign-in prevents dismissal and the selected role remains explicit.
The notice explains that shared demonstration records use the real API, changes
can be seen by other visitors, and personal service history requires one's own
customer account. It does not claim that demo accounts have mock-only data or
that public registration grants technician/admin access. The registration link
and explicit continue button provide both next actions.

## Verification

- Local format, strict type checking and lint pass.
- 215 unit tests pass; six dedicated Redis integration tests are skipped locally
  because no isolated Redis service is running. CI supplies that service.
- The default Turbopack production build passes. The initial sandbox-denied worker
  port left a failed cache; moving that build cache aside resolved the retry.
- Three targeted production browser checks pass: cancellation of all demo notices
  without authentication, filter URL/history behavior, and real upload audit
  rendering with local invalid-filter rejection and confirmed logout.
- Existing production browser regressions for CUSTOMER, TECHNICIAN and ADMIN
  sign-in, role protection, responsive navigation, session cookies and confirmed
  logout pass (3/3). These use existing evaluation accounts and do not modify
  customer requests, assignments, invoices or payments.
- Paired reporting/audit calendars, keyboard focus and the 320px calendar popup
  accessibility check also pass (1/1).
- Screenshot proof is outside Git in `../delivery/demo-login-confirmation.png`.

These checks do not replace an exhaustive browser/device audit. Required walkthrough
coverage, accessible video upload and official submission remain delivery work.
