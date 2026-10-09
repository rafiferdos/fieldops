# Workspace upgrade

## Functional scope

1. Account-aware public navigation, accessible account menu and confirmed sign-out.
2. Separate role dashboards and request/visit queues, with a responsive shadcn sidebar.
3. Real, ownership-scoped metrics, actionable queues and explicit empty/error states.
4. TanStack Query for hydrated dashboard reads and manual refresh; Axios for validated,
   cancellable same-origin reads; Zustand for the sidebar preference only.
5. Preserve existing scheduling, version conflicts, completion, invoices, provider-verified
   checkout, feedback, catalog, account access, skills and audit workflows.

## Data rules

- Demo buttons authenticate dedicated backend accounts. They do not select mock datasets.
- Customers see their records; technicians see assigned work; administrators see the
  global permitted dataset, including retained evaluation records.
- Role and account identity come from the verified server session, never query parameters.
- Customer/technician counts use filtered pagination totals, not a sampled page length.
- Admin period metrics retain the backend's creation-cohort/paid-time definitions.
- Zero is a valid empty result. A failed request is an error, never a fabricated zero.
- There is no daily trend, satisfaction score or growth comparison without API evidence.
- Private responses are no-store. Caches are workspace-owned and keys include user and role.
- Mutations and refresh-token rotation keep their existing explicit reliability policy.

## Design and verification

Complete functionality before visual refinement. Use one typography hierarchy and preset
tokens, frosted workflow surfaces, clear internal navigation and centered official Google UI.
Use GSAP for early scroll reveals and desktop scroll smoothing, preserve native touch,
keyboard navigation, dialogs and reduced-motion behavior. Validate all three role flows,
ownership, refresh failure, keyboard interactions, responsive layouts and motion geometry.

## Technology evidence (2026-10-09)

The reviewed Full Stack Engineer resume already lists TypeScript, React, Next.js, Redux,
REST APIs, Docker and CI/CD. TanStack Query, Zustand, Axios, automated browser accessibility
testing and session-safe cache ownership are not listed; this does not imply missing skills.
The additions will be defensible through implemented and tested behavior.

Recent [Q3 Technologies React Developer](https://www.foundrole.com/job/react-developer-in-aurora-il-8p1mbhq)
(September 14) names Zustand, TypeScript, testing and accessibility; an
[NTT DATA React Developer](https://www.foundrole.com/job/react-developer-in-san-leandro-ca-polknnu)
(October 2) names automated testing, TypeScript and accessibility. This small sample is
not a market-wide demand estimate, and it does not establish demand for Axios or TanStack Query.
Those two additions address the requested live dashboard transport/cache requirements.

Stable npm versions verified: TanStack Query 5.104.1, Axios 1.20.0, Zustand 5.0.15.
References: [TanStack SSR](https://tanstack.com/query/latest/docs/framework/react/guides/ssr),
[Zustand Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs),
[Axios cancellation](https://axios.rest/pages/advanced/cancellation),
[GSAP ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/),
[shadcn Sidebar](https://ui.shadcn.com/docs/components/base/sidebar).
