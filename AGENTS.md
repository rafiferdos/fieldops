# Assignment 7 — FieldOps Frontend

Use Bengali in conversation and English for all repository artifacts. This is the
Next.js frontend; the separate fieldops-api backend must remain unchanged unless
explicitly requested. The user has authorized the next three slices: public/workspace
layouts and service browsing, secure authentication, and customer request workflows.
Dispatch, technician execution and payment implementation remain outside this checkpoint.

Read the README's official Assignment 7 links and implemented backend contract
before changing domain behavior. Exactly three roles: CUSTOMER, TECHNICIAN, ADMIN.
Use Node 24 LTS, strict TypeScript, App Router and the requested shadcn preset.
Keep the npm lockfile and meaningful, buildable commits. Do not push or deploy
without a request. Preserve theme tokens and supported toast/dialog patterns.

Routes compose feature modules. Colocate feature schemas, types, hooks and UI;
shared code and infrastructure must not depend on features or routes. Use Server
Components by default and small Client Component boundaries for interactivity.
Validate external values with Zod; do not use any, unsafe assertions, ignored
errors, browser alert/confirm or unnecessary abstractions. Keep secrets server-only.
Backend authorization and provider-verified payments remain authoritative. Never
retry mutations or rotate refresh tokens automatically without a designed policy.

Run npm run check and npm run build at meaningful checkpoints. Add tests for
security/money boundaries and actual behavior; do not manufacture feature claims
from mocked boundary tests. Document verification limits and unresolved risks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
