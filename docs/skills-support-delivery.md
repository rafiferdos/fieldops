# Skills, support and delivery checkpoint

Reviewed October 9, 2026. The owner authorized the remaining delivery stages and a
limited backend extension for current technician skills. Existing customer data,
backend models and migrations remain unchanged.

## Safe qualification editing

The ADMIN-only `GET /api/v1/technicians/:id/skills` returns the complete saved set
and service identities, including retired services. A consistent database snapshot
prevents an internally mixed response. Missing/deleted accounts and non-technicians
are rejected. Credentials and user private profile fields are absent.

`PUT /api/v1/technicians/:id/skills` retains complete replacement semantics. The
optional `expectedServiceIds` supplies the previously inspected set. The backend
compares both complete sets under the existing technician transaction lock and
returns 409 before mutation/audit on a mismatch. Existing callers without the
precondition remain compatible. Active-work qualification rules still apply.

The frontend reads on every Sheet opening, validates the response, loads real
catalog pages and preserves selected items outside the first page. Unknown data is
never rendered as an empty saved set. A removed/retired service retains its identity
for review. A clear-all operation requires explicit confirmation. Save sends the
entire selection plus its inspected precondition. Conflicting or uncertain outcomes
block replay until explicit current-state inspection; no mutation is retried.

Verification includes backend snapshot, role, stale-set, equality and active-work
rules, plus actual disposable-account browser writes. A stale editor cannot replace
a newer set. Losing only the committed response causes one write and explicit
recovery. The fixture restores only its own disposable account.

## Verified support

Contact publishes the owner-approved `rafiferdos@gmail.com` and `+8801921479294`
with semantic `mailto:`/`tel:` links styled through shadcn buttons. It links to the
supported account and FAQ journeys. No address, opening hours, support URL or
contact-write API was invented. The page works without JavaScript and fits 320,
768 and 1440 pixel viewports.

## Metadata and accessible presentation

Public routes share canonical, description, Open Graph and Twitter metadata. A
service detail uses its validated actual name/description and request-scoped cached
read. The sitemap includes useful public pages; robots excludes private routes.
These hints do not replace authentication. The icon matches the existing brand.

APP_ORIGIN must be identical at build and runtime: static metadata is compiled for
that origin. A changed origin requires a rebuild. Serving one build with different
origins across test processes caused a real metadata regression and is not a
supported release configuration.

Automated axe checks cover WCAG A/AA-tagged rules across public pages and all three
role workspaces in both themes, with no disabled rules or ignored violations.
Normal-motion marketing is audited separately from reduced motion. Translation
and perspective may animate, while process/entry body-text opacity stays readable
before the section enters view. Token lightness and Select placeholder contrast
were corrected using the actual tinted surfaces. Automated checks are not a complete
human accessibility certification.

Responsive FAQ sizes reflect the rendered layout. Additional 480 and 1440 pixel
image candidates avoid unnecessary full-size downloads without reducing quality.
Lighthouse reports are repeatable lab measurements, not field Core Web Vitals or
real-device guarantees.

## Release gates

- Install with Node 24 and `npm ci`; run checks with real dedicated Redis and build.
- Confirm matching APP_ORIGIN and public API version before generating artifacts.
- Keep session encryption, Redis credentials and evaluation passwords server-only.
  Never send backend database, JWT or gateway secrets to the frontend host.
- Use a dedicated TLS Redis session store shared by frontend instances, separate
  from backend public-catalog caching. Review expiry, eviction and free-plan limits.
- `vercel.json` disables automatic Git deployments. Release manually only after the
  exact source revision passes GitHub CI. `sin1` colocates frontend functions with
  the existing Singapore backend/database region.
- Deploy the frontend, then the CI-verified backend browser-return/skills revision.
  Inspect readiness and actual routes; do not reset or reseed production storage.
- Verify three role demo logins, HTTPS cookie policy, wrong-role/foreign-record
  boundaries, real Google login and owned HTTPS sandbox success/cancel/IPN.
- Retain real proof and limits in the delivery report. Do not mark a configured
  project/domain as a successfully deployed site.

References: [Google authorized origins](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid),
[Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration),
[axe Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright),
[Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli).
