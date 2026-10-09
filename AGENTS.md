# Assignment 7 — FieldOps Frontend

Use Bengali in conversation and English for all repository artifacts. This is the
Next.js frontend; the separate fieldops-api backend must remain unchanged unless
explicitly requested. Public browsing, authentication and customer requests are implemented.
The user has now authorized admin review/dispatch and technician execution/customer
work tracking. Invoice details, checkout/payment inspection, customer feedback,
admin reporting, catalog management, confirmed user access changes and read-only
audit browsing are implemented. Technician skills and verified Contact channels are implemented. The
gateway browser-return transport now has a narrowly authorized backend exception
for payment callback/configuration changes and real sandbox verification. Do not
expand that exception to other backend features without a request. The user later
authorized all remaining delivery stages, including the current-skills read gap,
verified contact channels, Google configuration, QA, Vercel hosting and submission
artifacts. Keep backend changes limited to skills/payment delivery; preserve existing
data and use dedicated disposable verification/evaluation accounts.

Read docs/route-plan.md's official Assignment 7 links and implemented backend contract
before changing domain behavior. Exactly three roles: CUSTOMER, TECHNICIAN, ADMIN.
Use Node 24 LTS, strict TypeScript, App Router and the requested shadcn preset.
Keep the npm lockfile and meaningful, buildable commits. Do not push or deploy
without a request. Preserve theme tokens and supported toast/dialog patterns.
Use preset-matched shadcn components for visible interactive controls and reusable
UI surfaces by default. Use styled Select rather than browser-native dropdowns.
Compose supported primitives for custom layouts; retain semantic HTML for document
structure, labels, headings, forms and nonvisual form fields.

Routes compose feature modules. Colocate feature schemas, types, hooks and UI;
shared code and infrastructure must not depend on features or routes. Use Server
Components by default and small Client Component boundaries for interactivity.
Validate external values with Zod; do not use any, unsafe assertions, ignored
errors, browser alert/confirm or unnecessary abstractions. Keep secrets server-only.
Backend authorization and provider-verified payments remain authoritative. Never
retry mutations or rotate refresh tokens automatically without a designed policy.

Add concise English comments for mini-features, business constraints and non-obvious
decisions. Explain intent without repeating syntax or adding large comment blocks.

Run npm run check and npm run build at meaningful checkpoints. Add tests for
security/money boundaries and actual behavior; do not manufacture feature claims
from mocked boundary tests. Document verification limits and unresolved risks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
