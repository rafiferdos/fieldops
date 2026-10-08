# FieldOps Frontend

Programming Hero B7A7 frontend for Field Service Management (student ID ending in 7).
This checkpoint contains initialization, essential configuration and the first
route/role/API planning handoff. The home route reports setup status; no authentication,
dashboards, business workflows, payment UI or backend mutations are implemented.
The backend remains a separate repository and workspace.

## First implementation checkpoint

- [Route, role and API plan](docs/route-plan.md): 26 core route templates, 2 conditional
  payment-return templates, all 38 domain APIs and 2 health endpoints, access rules,
  URL queries, feature ownership and implementation order.
- [Screen flows and design handoff](docs/screen-flows.md): layouts, request wizard,
  dispatch, technician progress, payment recovery, administrative workflows and
  acceptance gates, using the exact theme preset.
- Transport now supports the backend's `PUT` skill replacement. Empty/full skill-set
  boundary tests pass; no skill editor or backend mutation was added.

These are planned screens, not completed product pages. Two integration gaps remain
explicit: the backend has no current-skill read API, and its provider callbacks return
JSON rather than redirecting to frontend success/cancel pages. Resolve the relevant
design before implementing those flows; do not silently overwrite unknown skills or
claim verified browser payment returns. The next slice is public/workspace layout
and real service browsing, followed by secure authentication.

## Run locally

Use Node **24.21.0 LTS** and npm **11.19.0**. `.nvmrc`, package engines and
`.npmrc` prevent installs with an incompatible runtime. With the existing mise installation:

```bash
cd /home/rafiferdos/dev/programming_hero/assignments/assignment7/fieldops
mise exec node@24.21.0 -- npm ci
cp .env.example .env.local
mise exec node@24.21.0 -- npm run dev
```

Open http://localhost:3000. Use the backend's actual local port in `.env.local`;
the example assumes port 3001 so it does not conflict with Next.js. The hosted API
is `https://fieldops-api-xu3s.onrender.com/api/v1`. No API server is needed to view
the initialization page or run the isolated boundary tests.

With Node 24 active, verification and production preview are:

```bash
npm run check
npm run build
npm run start
```

`check` runs formatting, typed ESLint, route type generation, TypeScript and Vitest.
`format` and `lint:fix` apply local corrections. CI repeats the locked install,
checks and build using immutable official action revisions; it performs no deployment.
A hosted CI run has not been executed because this repository has not been pushed.

## Stack and theme

Stable versions were checked against official documentation and the npm registry
on October 8, 2026. Direct dependencies are pinned and `package-lock.json` is committed.

- Next.js 16.4.0 App Router; React/React DOM 19.3.0.
- TypeScript 6.0.3 with strict mode and unchecked-index/optional-property checks.
  The registry's latest TypeScript is 7.0.2, but typescript-eslint 8.71.1 supports
  TypeScript below 6.1. ESLint 9.39.5 stays within Next's React/accessibility/import
  plugin peer ranges; the registry's latest ESLint 10.12.0 is outside those ranges.
- Tailwind CSS 4.3.3, shadcn 4.21.4, Base UI, Lucide and next-themes.
- Zod 4.6.5 for external boundaries; native server-side fetch instead of another HTTP library.
- Prettier and typed ESLint; Vitest 5.0.3 for the boundary tests.

Initialization used the exact requested command, with `fieldops` as the project name:

```bash
npx shadcn@latest init --preset b2w3Yl9Ygc --template next --pointer
```

The preset resolves to Base UI Rhea, zinc base, emerald theme, Outfit headings,
Geist body text, Geist Mono and pointer cursors. Light/dark theme tokens are
preserved in `src/app/globals.css`. `components.json` directs future generated
components into the shared UI folder. Use the installed, pinned CLI:

```bash
npx shadcn add alert-dialog
```

Button and the supported Base UI toast renderer are installed; the root layout
mounts `Toaster`. Use `toast.add({ type: "error", title: "..." })` from
`@/shared/ui/toast` in Client Components. Add `alert-dialog` when a real
confirmation flow is implemented. Native `alert`/`confirm` are disallowed by lint.
Server Components remain the default. Theme/toast providers and error recovery
are small Client Component boundaries. The template's single-key theme hotkey
was removed to avoid interfering with keyboard navigation.

## Source layout

```text
src/
  app/                         # Routes, metadata and framework boundaries
    layout.tsx                 # Server layout with theme and toast providers
    page.tsx                   # Initialization status only
    error.tsx                  # Segment recovery, without raw error disclosure
    global-error.tsx           # Root-layout recovery
    not-found.tsx              # Accessible 404 navigation
    globals.css                # Exact preset tokens
  features/                    # Add real domain modules on implementation
    README.md                  # Feature colocation and dependency rules
  shared/
    ui/                        # shadcn primitives
    providers/                 # Cross-cutting client providers
    lib/                       # Small reusable helpers
  infrastructure/
    api/                       # Server-only fetch, envelopes and typed errors
    env/                       # Server-only configuration and boundary schema
```

Keep feature schemas, types, hooks and components near their workflow. Routes
compose features; shared code and infrastructure must not import routes/features.
Introduce deeper folders only as their contents justify them. Prefer composition
and explicit business rules over generic CRUD layers. Use theme tokens and
shadcn primitives; add layout utilities only for actual layout needs.

## Environment and API boundary

`API_BASE_URL` stays server-only. The environment schema accepts `/api/v1` URLs,
requires HTTPS outside localhost, and rejects credentials, query strings and
fragments. Configuration is checked when the API helper is called; the static
setup page does not require API configuration. Invalid configuration errors
never echo environment values. `.env.local` is ignored; `.env.example` is safe to commit.
Never place gateway credentials, session tokens or demo passwords in `NEXT_PUBLIC_*`.

`apiRequest(path, dataSchema, options)` in `src/infrastructure/api/server.ts`:

- Validates `{ success: true, message, data }` with the supplied feature Zod schema.
- Parses `{ success: false, message, errors: string[] }` into `ApiError`, preserving
  HTTP status. Invalid/non-JSON upstream responses become safe generic errors.
- Constrains paths to the configured origin and version prefix, sends Bearer and
  Idempotency-Key only as headers, refuses redirects and uses `cache: "no-store"`.
- Uses a 30-second timeout and optional cancellation. No automatic retries,
  refresh attempts, caching or payment interpretation are performed.
- Supports GET, POST, PUT, PATCH and DELETE; GET/DELETE cannot carry a body through
  the typed options. Feature schemas still validate mutation input before transport.

Parse outbound inputs through the feature's Zod schema before calling the helper.
Future Client Components should call explicit same-origin Server Actions or Route
Handlers with validated inputs, rather than importing this server-only helper.
Those handlers will require session/ownership checks and CSRF/origin defenses;
none are exposed at this checkpoint. Do not create an unrestricted proxy.

## Backend integration rules for the next stage

The [implemented backend contract](https://app.notion.com/p/3f34ab5df14481afa4acc3e9a092b940)
is authoritative for endpoint details:

- Exactly CUSTOMER, TECHNICIAN and ADMIN. Public registration cannot choose roles.
  Backend current-session, account, role and resource ownership checks remain authoritative.
- Backend authentication returns JSON Bearer tokens, not cookies. Design the frontend
  session layer with HttpOnly/Secure cookies and origin/CSRF protection; do not store
  access/refresh tokens in localStorage. Serialize refreshes: concurrent reuse can revoke
  the backend session. Session implementation and route protection are deferred.
- Missing auth is 401, wrong role 403, private ownership mismatch 404, invalid input 400,
  stale version/state conflict 409, rate limiting 429, gateway failure 502 and unavailability 503.
- Re-read on version conflicts. Request review state is distinct from work-order progress.
  Use the latest numeric version; do not force stale updates or infer availability reservations.
- Money uses BDT minor units. Revenue aggregates are exact decimal strings.
  Invoices are immutable; price and paid state come from the backend.
- Checkout uses a stable Idempotency-Key and unchanged billing for one intent.
  Network failures may leave an unresolved attempt: recover the same attempt/key,
  never silently initiate another charge. Callback acknowledgements or browser
  redirects are not payment success; read verified payment and invoice state.
- Existing provider callbacks return JSON acknowledgements. Frontend success/cancel
  redirect integration needs an explicit design in the payment stage; no redirect
  support is claimed or backend change made here.
- Keep filters/search/sort/pagination in the URL. Add route-specific skeletons when
  implementing data-fetching pages; no fabricated loaders or data are included now.

## Requirements and scope

Reviewed all three official files:
[README](https://github.com/Apollo-Level2-Web-Dev/B7A7),
[project requirements](https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/project-requirements.md),
[timeline](https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/timeline-breakdown.md).
The page-count heading says 15, but the explicit rule requires **at least 18 fully
functional pages**. Later delivery also requires real APIs, three one-click role
logins, RHF or TanStack Form with Zod, real SSLCommerz/Stripe test payments,
20 meaningful frontend commits, deployment, demo credentials and a 5–10 minute video.
These remain future delivery requirements, not completed initialization features.

## Testing and dependency limits

Initialization verification included fresh `npm ci`, formatting, typed lint,
TypeScript, 30 boundary tests and a production build. Production HTTP/browser smoke checks covered the
initialization page, 404, keyboard return-home navigation and response headers.
No browser console warnings/errors appeared during those checks.

At the route-planning checkpoint, formatting, typed lint, TypeScript and all **32
boundary tests** pass. The default Turbopack build was blocked by this execution
environment's local-port restriction, including an elevated attempt. The supported
`npm run build -- --webpack` production build passes; the default build command
remains unchanged. Browser checks were not repeated because no rendered UI changed.
The endpoint matrix was compared with the backend collection for all 40 unique
method/path pairs; the 28 planned route templates were checked for uniqueness.

The focused Vitest suite covers environment validation, response contracts,
version-prefix/origin confinement, status preservation, token headers and no retry
on uncertain payment writes. Tests stub fetch and the `server-only` marker in the
isolated test runtime; they do not contact the hosted API or prove business flows.
No production mock data or mock routes are shipped.

Add React Testing Library when interactive forms exist. Add Playwright for browser
session/role protection, URL state, responsive/keyboard behavior and real sandbox
payment return paths. Async Server Components need browser integration coverage.
Do not claim backend security or payment settlement is verified by these unit tests.

The initial audit reports **9 high-severity development/build-tool findings** through
`braces` (GHSA-vfj7-8cjw-p6xm), pulled by shadcn and Next's lint tooling. The npm
registry has no patched compatible braces release at this checkpoint. Production
runtime dependencies report **0 vulnerabilities** with `npm audit --omit=dev`.
Do not apply `npm audit fix --force`: its proposed downgrade breaks this stack.
ESLint 9 also reports end of support; its Next.js plugin peer ranges currently
exclude ESLint 10. Keep this compatibility limitation visible rather than forcing
incompatible peers. Recheck upstream releases before deployment; this is not a
zero-risk dependency claim.

## Technology additions and résumé evidence

The [previously reviewed résumé assessment](https://app.notion.com/p/3f14ab5df14481b9bdccd1349fd83a18)
records React/Next.js, TypeScript, Docker and CI/CD as already listed skills.
This checkpoint uses that assessment; the original résumé files were not available
in the frontend workspace. TanStack Query, React Hook Form/Zod and automated testing
were not listed in that assessment; omission does not imply lack of ability.

A currently accessible [Hyperlink role](https://www.thehyperlink.io/jobs/full-stack-engineer-mid-senior-typescript)
asks for typed validation, TanStack Query, RHF/Zod, Vitest and Playwright. This is
one hiring signal, not a market ranking or a verified posting date. Prefer evidence
of secure sessions, tested API boundaries, accessibility and reliable payments
over dependency count. TanStack Query, RHF, state stores, charts and browser-test
packages are deferred until a real feature needs them; no résumé achievement is
claimed before that work is implemented and verified.

Official setup references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation),
[environment variables](https://nextjs.org/docs/app/guides/environment-variables),
[ESLint](https://nextjs.org/docs/app/api-reference/config/eslint),
[Vitest](https://nextjs.org/docs/app/guides/testing/vitest),
[shadcn CLI](https://ui.shadcn.com/docs/cli),
[Base UI toast](https://ui.shadcn.com/docs/components/base/toast),
[Node.js releases](https://nodejs.org/en/about/previous-releases).
