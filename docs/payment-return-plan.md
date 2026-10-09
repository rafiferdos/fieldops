# Payment return and sandbox verification

The user authorized the automatic return flow and real sandbox payment/cancellation,
retry and paid-feedback verification, followed by a narrowly scoped backend change.
No push, deployment, live funds, public tunnel or existing customer work is authorized.

## Return transport

The backend preserves its four existing JSON notification endpoints. New hosted
checkouts use `POST /api/v1/payments/sslcommerz/return/{success|fail|cancel}` for
the browser, with the unchanged `/ipn` endpoint for server notifications.

The browser handler resolves the internal payment UUID from the stored merchant
transaction, runs the existing provider validation/settlement service, and returns
a no-store 303 to the configured FRONTEND_ORIGIN. Success selects `/payment/success`;
failure/cancellation select `/payment/cancel`. Client destinations, status, amount,
payment UUID and provider claims cannot override stored identity or money rules.

A verification/transaction failure returns the known attempt for inspection, without
claiming payment success or changing financial state. Invalid/unknown attempts are
rejected. The frontend authenticates again and independently reads the owned payment
and immutable invoice. An expired session preserves `/payments/{id}` through login.
Only matching verified settlement enables the completed-service link; feedback still
checks current completed, paid work and backend eligibility.

FRONTEND_ORIGIN is an HTTPS origin with no credentials, path, query or fragment.
Loopback HTTP is accepted for local development. PUBLIC_API_URL permits loopback
HTTP only for a non-production sandbox; live/production returns require HTTPS.
Local browser callbacks work without a tunnel. Provider server IPN cannot reach
loopback, so local tests must not claim out-of-band IPN delivery.

## Verification gates

- Real Nest/PostgreSQL tests cover return identity, injection, terminal verification,
  unavailable verification, IPN/browser races, late negative callbacks and charge blocking.
  These tests replace only provider HTTP and cannot establish sandbox completion.
- Opt-in browser tests must use the actual sandbox checkout, synthetic customer/billing
  data and fresh completed work. No manufactured successful callback or direct PAID update.
- Verify cancellation remains UNPAID, explicit replacement changes the attempt ID, real
  success settles the replacement once, old-attempt recovery cannot start another charge,
  and one immutable feedback submission survives a lost response and reload.
- Repeat on the deployed HTTPS origins after deployment is authorized. Existing hosted
  API builds and already-created checkouts keep their original JSON return destinations.

Official references: [SSLCommerz integration and transaction queries](https://developer.sslcommerz.com/doc/v4/),
[Nest redirection](https://docs.nestjs.com/controllers#redirection), and installed
Next.js Route Handler/redirect documentation. The linked Notion contract requires
sign-in in this session; the implemented backend source and API README are available
and were used to check the actual contract.

## Verified checkpoint

October 9, 2026: the actual sandbox UI completes cancellation → explicit new attempt
→ safe dummy-card/OTP success → frontend 303 return → paid feedback. Feedback loses
its real browser response, remains blocked against replay, then inspection/reload
recovers the one saved review. A signed-out return resumes its exact attempt after
login; injected status is ignored; the paid screen fits 320px. Navigating the old
cancelled attempt explains that its invoice is already paid and offers no checkout.
The prior lost-checkout-response/foreign-owner regression also passes separately.

The test uses the production frontend on localhost:3002, updated local backend on
3000, isolated fieldops_payment_test database and dedicated frontend Redis. Stored
proof confirms exactly two attempts, one safe settled receipt, one payment-settled
and invoice-paid event, and one feedback/audit. Frozen amounts and settlement times
match. Records are synthetic/disposable; completed records are retained.

The observed merchant query reports CANCELLED while its closed session reports
FAILED and omits currency, as does the official session response example. Closure
still requires stored transaction/session identity, matching gross/original amounts
and BDT original currency; any supplied settlement currency must be BDT. A merchant
cancellation without a closed verified session cannot release the attempt.

Frontend strict checks and production build pass with 167 checks (including six
real-Redis checks). Backend strict checks, build, 129 unit tests, 89 database-backed
payment/feedback checks and offline documentation validation pass. Provider HTTP is
stubbed only for the database suite; the opt-in browser flow uses the real gateway.
No single full 28-scenario run, deployed HTTPS/server IPN, real fail/risk UI,
Safari/mobile hardware or live funds are claimed verified here. No push/deployment.
