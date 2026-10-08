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
