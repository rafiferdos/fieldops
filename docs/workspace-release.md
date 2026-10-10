# Workspace release

Verified October 9, 2026.

This records the initial workspace release. The subsequent
[dashboard motion release](dashboard-motion.md#published-release-and-hosted-acceptance)
adds workspace smooth scrolling and chart/activity choreography, with its own exact
revision, deployment and passing hosted acceptance.

## Published revisions

| Artifact              | Verified revision and evidence                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Frontend application  | `261a61cf9042f1cd4ab74f95e083d0d7eb1e8fc6`; [passing CI](https://github.com/rafiferdos/fieldops/actions/runs/37940337086)     |
| Backend documentation | `1faf01a7ce50ddc4a0a7058deb13c28179408409`; [passing CI](https://github.com/rafiferdos/fieldops-api/actions/runs/37940326850) |
| Production deployment | Vercel `dpl_59s93qdzcWVyDAYTucdqsMj4n2N5`, READY, exact frontend revision, Node 24, Singapore functions                       |
| Canonical application | [fieldops-rafiferdos.vercel.app](https://fieldops-rafiferdos.vercel.app)                                                      |
| API                   | [fieldops-api-xu3s.onrender.com/api/v1](https://fieldops-api-xu3s.onrender.com/api/v1)                                        |

Subsequent documentation-only commits do not change the deployed application code.
This work changes no backend application source, schema, migrations or configuration.
Both product READMEs and their reciprocal repository/API links are published. The backend
API guide retains the detailed contract; CI checks 46 request examples against 42 implemented
routes, authorization/status metadata and actual validation pipes.

## Delivered behavior

- Separate customer, technician and administrator dashboards with actual accessible records.
- Account/role-scoped TanStack Query hydration and explicit refresh; validated, cancellable
  Axios reads through an authenticated same-origin boundary.
- Zustand stores only the sidebar preference. Tokens and backend records remain outside it.
- A responsive shadcn workspace, actionable queues, account dropdown and confirmed sign-out.
- Consistent GSAP surface reveals, wide-screen public smoothing and native touch/reduced motion.
- Theme-token frost, centered official Google UI, clear internal links and retained hero geometry.
- New-route heading visibility, browser history and keyboard/skip navigation.

## Hosted acceptance

The production application passed **14/14 Chromium scenarios in 3.5 minutes**, with retries,
authenticated screenshots, traces and video disabled. Selected scenarios used dedicated
demo accounts and performed reads, session operations and navigation; they created no
new service requests, visits, invoices or payments.

- Public pages pass automated WCAG A/AA scans in both themes.
- All three authenticated workspaces pass the same scans in both themes, including profile
  controls after hydration. No accessibility rules are excluded.
- Normal-motion marketing text retains contrast before sections enter view.
- Hero glyph geometry and spaces remain stable throughout entry and route return.
- Reduced motion, frost/contrast fallback, narrow FAQ disclosures and keyboard selects pass.
- Fixed navigation, reachable footer, End/skip navigation and Back/Forward restoration pass.
- Every role's displayed totals match the actual validated dashboard response. Refresh,
  queue drill-down, new-route scroll, public account navigation and confirmed sign-out pass.
- The canceled sign-out restores account-menu focus; confirmed sign-out denies subsequent
  protected profile access. Private dashboard responses carry `private, no-store`.

## Scope and performance

All 185 frontend checks, including six real-Redis coordination checks, and the production
build pass locally and in the release CI. The Redis checks stub backend refresh HTTP;
they verify store coordination rather than a live token-expiry journey.

[Local workspace verification](workspace-upgrade.md#local-verification-checkpoint) records
the broader disposable-record baseline and focused corrections. The new release did not
repeat provider settlement or interactive Google consent: the unchanged payment/Google
behavior retains its separate [earlier hosted evidence](hosted-release.md).

The local production-build Lighthouse samples are mobile 87/100/100/100 and desktop
99/100/100/100, with CLS 0 in both. These are local lab results, not new hosted performance
measurements. Actual Safari/mobile hardware, field Core Web Vitals, live funds and distributed
failover are not certified by these checks.

The README dashboard image is an actual dedicated-demo capture using the live API. Its
counts are a point-in-time record, not seeded marketing numbers. At this initial workspace
checkpoint, account avatars used initials. The subsequent [photo release](media-images.md)
adds actual owned profile and catalog images, retaining initials for missing photos. The older recorded walkthrough predates
this workspace design and should be refreshed before presenting the current interface.
