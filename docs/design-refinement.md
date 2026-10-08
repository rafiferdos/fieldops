# Design refinement

## Scope

Refine every implemented public, authentication and role-based screen without
changing API contracts, authentication, permissions or payment behavior. Preserve
the exact emerald/zinc shadcn preset and the Outfit/Geist type pairing.

## Visual direction

- Use generous editorial typography on public pages, compact hierarchy in workspaces.
- Give surfaces a consistent border, radius, rhythm and restrained elevation.
- Replace decorative placeholder metrics with an explicitly illustrated service journey.
- Keep service prices and all operational records sourced from the existing API.
- Use official preset-matched shadcn components for controls, disclosure and overlays.
- Make workspace navigation clear on desktop and keep the accessible mobile Sheet.
- Separate request decisions, visit progress and invoice settlement visually.

## Motion rules

- Pin stable Motion 14.0.0, verified against the npm registry. Use its mini React
  API for short native Web Animations; do not load layout/drag features.
- Animate opacity and transforms only. Never animate operational status or fabricate
  progress. Avoid perpetual animations, scroll hijacking and cursor effects.
- Render readable server content before JavaScript. Enhance viewport entry once,
  disconnect observers afterwards and cancel effects when the user requests less motion.
- Respect reduced motion in custom CSS and official overlays/skeletons.
- Keep fields mounted through wizard steps; animate their presentation without
  delaying validation, focus, submit or conflict recovery.
- Use CSS for button, link and input feedback. Restrict hover movement to fine pointers.

## Checkpoints and verification

1. Shared design/motion foundation, with readable no-JavaScript output.
2. Public journey, catalog, service detail, about and FAQ.
3. Authentication, workspace navigation, queues, detail panels and wizard.
4. Browser verification, accessibility/performance corrections and documentation.

Run formatting, typed lint, strict TypeScript, unit tests and a production build
at each completed checkpoint. Verify real catalog/navigation behavior, keyboard
and Sheet focus, reduced motion, no-JavaScript visibility, both themes, mobile
widths, and role-based screens. Reuse the existing real-API workflow suite after
interaction changes. Document measurements and limits; do not claim universal
frame rates or untested browser/device performance. Keep commits meaningful,
buildable and scoped; do not pad history to reach an arbitrary count.

## Official references

- [Motion mini and bundle size](https://motion.dev/docs/react-reduce-bundle-size)
- [Motion accessibility](https://motion.dev/docs/react-accessibility)
- [shadcn Base UI Accordion](https://ui.shadcn.com/docs/components/base/accordion)
- [Animation performance](https://web.dev/articles/animations-guide)

## Implemented composition

Public pages now have an editorial hero, a clearly labelled workflow illustration,
service cards with API prices, a sticky process section, role explanations and a
connected footer. A single available service gets a useful next-step panel instead
of two empty catalog columns. FAQ uses the generated Base UI Accordion.

Authentication has a server-rendered editorial panel, a focused form surface,
explicit password visibility and role demo controls. Workspaces use icon navigation,
an accessible mobile Sheet, readable filters, state-labelled cards, detail surfaces,
a connected event timeline and consistent recovery screens. Wizard transitions keep
fields mounted and return keyboard focus to the heading on both forward/back steps.

All preset color values remain intact. `brand-ink` uses the preset's primary token
in light mode and existing chart-2 token in dark mode. This fixes small accent text
that previously measured approximately 2.61:1 against the dark background. Browser
checks require at least 4.5:1 in both themes; state labels do not rely on color alone.

The homepage shell and catalog are separate Server Components. Only the API-backed
catalog uses a local Suspense skeleton. Public route-wide loading boundaries are
removed so they cannot conceal the entire server-rendered shell when JavaScript is
unavailable. Auth/workspace loading boundaries remain. The streamed catalog and
interactive account/operational flows require JavaScript; the fallback says so.

## Performance observation

A local production Chromium run with 4× CPU slowdown sampled 120 animation frames
while scrolling the homepage. It reported median 16.7 ms and p95 17.2 ms frame
intervals, cumulative layout shift 0, and no browser errors. Two startup long tasks
were observed at 50 ms and 131 ms. This is one desktop simulation, not a universal
frame-rate guarantee, a Core Web Vitals field assessment, or an actual slow-phone test.

Entry effects use the mini Motion API and native Web Animations. Hover movement is
limited to fine pointers. There are no infinite background effects, video downloads,
scroll interception, drag/layout animation packages or custom dialog replacements.
Runtime dependency audit reported zero findings after adding Motion; the previously
documented development-tool advisories remain. Firefox/WebKit, physical mobile
hardware, assistive-technology review and deployment measurements remain unverified.

## Verification result — 2026-10-09

All 77 unit/integration checks and the supported Webpack production build pass.
The nine existing real-API workflows pass with the refined interface, including
320/768/1440px role workspace fit, mobile Sheet focus and preserved wizard fields/focus.
Six design scenarios pass on the final public-rendering build: no-JavaScript
homepage/process content, reduced motion and preference changes, keyboard FAQ,
password visibility, six public/auth screens at five viewport widths, and readable
brand-text contrast in both themes. The final 12 affected public/auth/demo scenarios
were rerun successfully after queue-footer and status-color corrections. Demo queues
also require readable status-label contrast in both themes. Negative labels use
foreground text with a red indicator/tint so small text stays readable. No automatic
test retry was enabled.

All three role workspaces, the mobile wizard and a real technician work detail were
also visually inspected. Local screenshots are review artifacts, not committed
fixtures. Backend source and contracts remain unchanged; no push or deployment occurred.
