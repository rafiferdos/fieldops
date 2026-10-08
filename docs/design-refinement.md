# Design refinement and verification

## Implemented direction

Preserve preset `b2w3Yl9Ygc`, its emerald/zinc tokens and self-hosted Outfit/Geist
variable fonts. Oversized public typography, original material photography and
restrained workspace density share the same controls, reading surfaces and focus
language. The [optical design](optical-design.md) records primary research and
implementation decisions; [editorial assets](editorial-assets.md) records the
built-in imagegen mode, local output paths and exact prompts.

The hero pairs word and tool arrival with a scroll-linked image zoom and shallow
3D card rotation on wide screens. GSAP 3.15.0 and @gsap/react 2.1.2 own only this
marketing choreography. SplitText preserves the heading's accessible name, gives
descenders mask clearance and removes temporary wrappers after entry. Scoped
useGSAP/matchMedia cleanup restores text, styles and ScrollTriggers when preferences
change or routes unmount. No scroll interception, pinning or perpetual loops exist.
Shared entry effects use one-shot native Web Animations, cancel on reduced motion
and leave server-rendered content visible before scripts run. Motion is removed.

The floating navbar uses shadcn NavigationMenu, Button styles and mobile Sheet.
One translucent themed material replaces stacked solid backgrounds. A bounded
independent Snell-law displacement map bends the actual backdrop in Chromium;
foreground controls stay unfiltered. The map updates only on resize, with no
continuous optical animation loop. Other engines get a translucent blur fallback,
which is not described as Liquid Glass or Apple's exact native rendering. Increased
contrast, reduced transparency and forced colors disable the optical filter.

FAQ uses shadcn Card and Collapsible with original editorial images, a rotating
plus control and an answer inside each card. All five backend-contract answers
remain available, including without JavaScript. Payment claims require provider
verification; a redirect is never presented as payment success.

## Component consistency

- Catalog/request/work filters, wizard service, review decision and technician
  selection share the preset-matched shadcn Select composition. The library owns
  popup semantics, keyboard/focus and selection; Controllers retain form validation.
- Cards compose auth, filters, profile, request/work metadata and operational panels.
  Reused DetailPanel retains real description-list semantics inside its Card.
- Empty/Pagination, NavigationMenu/Sheet, AlertDialog and Toast use supported shadcn
  primitives. Navigation uses shadcn button variants on actual links; action controls
  remain buttons. Semantic HTML defines layout, headings, lists, labels and forms.
- Field controls and buttons have 44px minimum touch targets. Long select options
  wrap, and hidden library inputs do not alter the field's vertical alignment.
- Preset colors remain unchanged. `brand-ink` maps to primary in light mode and the
  existing chart-2 token in dark mode. Browser checks require 4.5:1 text contrast in
  both themes; operational status is always written explicitly.

The homepage streams only its API catalog. Known catalog errors are contained
locally so the headline, navigation and journey stay readable. Public route-wide
loading boundaries cannot hide the whole no-JavaScript shell. Auth/workspace
loading and interactive-account requirements remain explicit.

## Verification — October 9, 2026

Formatting, typed lint, generated route types, strict TypeScript, all 85 tests
(81 ordinary plus four real-Redis integration tests) and the supported Webpack
production build pass. The new lens tests validate geometry bounds, memory size,
neutral centers and symmetric refraction. CI has not run remotely because nothing
was pushed.

The Chromium suite adds six optical/component scenarios: accessible hero and route
cleanup; live reduced-motion transform restoration; actual spatial displacement
against an identical blur-only reference; increased-contrast fallback; all five FAQ
answers and close controls fitting at 320px; and styled Select keyboard dismissal,
selection and GET submission. Existing checks cover no-JavaScript content, keyboard
FAQ, password visibility, both-theme contrast and public/auth layouts from 320px to
1440px. All 21 scenarios pass with automatic retries disabled, including the real-API
workflow suite after interaction changes. Only approved disposable records were
created; pre-existing work was not progressed.

A separate Firefox smoke run verified the translucent fallback, both themes, FAQ
keyboard operation, shadcn Select, catalog fit at 320/390/768/1440px, the accessible
headline and reduced motion, without page errors. WebKit could not launch because
this host lacks its ICU/XML/Flite and related system libraries; no system packages
were changed. Actual Safari, physical mobile performance, assistive-technology
review and deployment HTTPS behavior remain unverified.

Public desktop/mobile screenshots are local review artifacts, not committed golden
fixtures. The four original PNGs are optimized responsively through Next Image with
reserved geometry. They are illustrative, not evidence of actual staff or jobs.

## Production performance observation

The final local production Chromium run used a 1440 × 1000 viewport, a warm cache
and 4× CPU slowdown. Across 120 frames while scrolling the homepage, the median
frame interval was 16.7ms, p95 17.4ms and maximum 17.8ms. Observed cumulative layout
shift was 0.014. One 63ms startup long task occurred; none occurred during sampled
scrolling, and no page errors were reported. This is one desktop simulation, not
a universal frame-rate guarantee, a Core Web Vitals field assessment or an actual
slow-phone measurement.

All 21 Chromium scenarios passed together with retries disabled. After the last
class-merging and 44px-target polish, all 15 affected public/design/optical scenarios
passed again without repeating external writes. Firefox's final 320px light/dark
fallback and composed-control geometry smoke checks also passed. Runtime dependency
audit reported zero findings; the README retains the separate development-tool
advisory limitations. Tracked files were checked against local private values
without displaying them. Backend source remained clean; no push/deploy occurred.

## References

- [Apple: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Original SVG refraction study](https://kube.io/blog/liquid-glass-css-svg/)
- [Community implementation and browser limits](https://github.com/Meapri/liquid-glass-web)
- [GSAP React cleanup](https://gsap.com/resources/React/)
- [shadcn Base UI Select](https://ui.shadcn.com/docs/components/base/select)
- [Animation performance](https://web.dev/articles/animations-guide)
