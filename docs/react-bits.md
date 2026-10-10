# React Bits integration

FieldOps uses the requested effects to make its existing service journey and
workspace navigation more expressive. Operational records and payment rules stay
with the real API. Effects introduce no fabricated statistics or new verification
flow.

## Placement

| Component       | Use                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------- |
| TechText        | The green “handled.” hero word, with its original glyph outline/selection interaction        |
| CrystalizedBall | A decorative illustration beside the three-role explanation                                  |
| BranchedMenu    | Unboxed dashboard navigation links, grouped into operations and account/help                 |
| HoldButton      | The original wave-fill confirmation inside a shadcn sign-out Dialog; cancel is the top cross |
| PeekRating      | Customer feedback for completed, paid, eligible visits                                       |
| RubberSegment   | The public desktop navigation's elastic selection track                                      |
| StrokeText      | The preference-to-confirmation heading on the How it works page                              |
| Strands         | The homepage's closing call to action                                                        |
| BorderGlow      | The three-role explanation's original cone glow/mesh border                                  |
| StaggeredMenu   | Mobile public navigation with layered entry and staggered labels                             |
| GradualBlur     | The bottom viewport edge of public pages; excluded from workspaces                           |
| ScrollStack     | The three request-to-resolution cards, sharing the site's GSAP scroll source                 |
| CodeSlots       | Not added: the current backend has no email-code verification flow                           |

Official JS/CSS and TS/CSS registry sources were inspected at revision
`d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`. The strict TypeScript equivalents avoid
adding unchecked JavaScript to this application. Source links and the full upstream
license are recorded in [third-party notices](../THIRD_PARTY_NOTICES.md).

## Appearance and integration

The requested source appearance is retained with theme colors. HoldButton keeps
its original wave crest, press response, label transition and glow. BranchedMenu
uses the original unboxed text treatment and rounded SVG branches; leaf navigation
renders real anchors, with URL-derived active state. No button-styled leaf links
or invented local selection state are required.

Necessary application integration is deliberately limited:

- shadcn Dialog and Sheet own focus trapping, Escape, scroll locking and return focus.
- Continuous pointer/keyboard holds complete once; release, capture loss, blur or
  backgrounding cancels confirmation. A click alone cannot sign out. The visual
  hidden hint has an explicit accessible button label. React's Effect Event keeps
  the latest completion callback without restarting a hold on parent renders.
- Feedback remains a controlled, keyboard-operable 1–5 rating. Disabled and uncertain
  submission states cannot replay the immutable feedback write.
- Real hero text reserves identical word spacing before, during and after animation.
  The original glyph renderer uses the inherited font and native character positions;
  unsupported Canvas and reduced-motion/contrast modes keep ordinary readable text.
- OGL `1.0.11` is the sole added runtime dependency. The original CrystalizedBall and
  Strands shaders are retained; shaders and particle/color helpers live separately
  from React lifecycle code.
- Scenes load on viewport entry, release resources when offscreen/backgrounded or
  motion is reduced, cap pixel ratio at 1.5 and use a 3,000-particle crystal preset.
  WebGL failure/context loss keeps a static decorative fallback. No business content
  depends on GPU output.
- ScrollStack projects measured, untransformed anchors. Its bounded transforms use
  one GSAP ScrollTrigger and restore original inline styles on preference changes.
  Narrow/touch/reduced-motion layouts retain ordinary document reading order. The
  application adds no second smoothing engine or long empty scroll runway.
- GradualBlur cannot intercept input and yields to keyboard focus, the full footer,
  reduced motion/transparency and increased contrast.

## Verification scope

Strict checks and the default production build cover the complete integration.
Chromium scenarios exercise hero geometry and rendered pixels, modal navigation,
real role workspaces, interrupted/completed holds, stack cleanup, actual WebGL
creation/disposal, both-theme automated accessibility and touch/no-script reading.
The real disposable SSLCommerz sandbox regression checks the new controlled rating
before recording one immutable review. Run it against the canonical frontend origin
that matches the backend callback configuration; localhost sessions do not transfer
to the provider's production-domain return.

Automated WCAG checks are not a full manual accessibility audit. Safari, actual
mobile GPU hardware and measured frame-rate/field performance require separate
verification; bounded work is an implementation budget, not a benchmark claim.

## Local checkpoint

On 10 October 2026, formatting, strict types, lint, the default production build
and 179 local unit tests passed; six Redis integration checks were skipped locally
and remain enabled in CI. All 27 selected local Chromium scenarios passed in
3.6 minutes. After the narrow-screen numbering correction, all seven focused
component scenarios passed in 18.6 seconds, including text/number separation and
actual WebGL context loss. These counts exclude the provider settlement regression.

The initial localhost provider run timed out with its disposable payment still
PENDING. Inspection confirmed no settlement; it is not recorded as a payment pass.
Hosted settlement/rating acceptance is a separate release gate.

## Hosted release checkpoint

All requested applicable effects are deployed. CodeSlots remains conditional on a
real email-code API; the current contract provides no such flow. The source keeps
the original HoldButton appearance and unboxed BranchedMenu navigation anchors.

The first hosted run on `2dc125b` passed 26 of 28 scenarios in 7.6 minutes. One
failure involved the automated pointer target moving while GSAP settled after a
native scroll; the driver now uses native wheel input and waits for the transformed
surface. Its complete real sandbox/rating scenario subsequently passed in 41.3
seconds, including cancellation, replacement, verified settlement, arrow/pointer
rating, automated accessibility and immutable feedback recovery. No callback was
forged or live funds used. The other failure involved the Customer's continuous
hold after cancel/reopen; it was not recorded as a pass.

A separate real-browser component comparison reproduced a callback-rerender bug:
the old source reset the held button to idle with zero completions; the correction
completed exactly once using the latest callback. A focused actual Customer demo
navigation/cancel/reopen probe also passed without business-record changes.

The final runtime revision is `cd2068c34bb8ceb807d618f95085fa060123481e`.
[CI 38024046107](https://github.com/rafiferdos/fieldops/actions/runs/38024046107)
passes all 185 tests, formatting, strict types, lint and the default production
build. Vercel production deployment `dpl_FfFqAN3R8dQV55sC1FUxpjKJJued` is READY.
Local strict checks pass with 179 tests and six Redis skips; the supported webpack
build also passes. This resumed execution environment blocks the Turbopack worker's
local port, so its local default-build failure is not represented as a pass.

On the final canonical hosted revision, all six focused real-role scenarios pass
in 3.2 minutes with retries disabled: three role/cookie/protection checks and three
live-count/navigation/cancel/reopen/continuous-hold checks. The Customer's previous
failure now passes. The initial 28-scenario run and later focused results retain
separate provenance; this is not a claim of one all-passing full 28-scenario run.
The final hosted public composition capture also passes (1/1, 8.4 seconds), saving
actual hero, crystal, Strands and mobile-menu images outside Git in `../delivery/`.
