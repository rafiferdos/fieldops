# Design refinement and verification

## Implemented direction

Preserve preset `b2w3Yl9Ygc`, its emerald/zinc tokens and self-hosted Outfit/Geist
variable fonts. Oversized public typography, original material photography and
restrained workspace density share the same controls, reading surfaces and focus
language. The [hero and navbar design](optical-design.md) records primary research and
implementation decisions; [editorial assets](editorial-assets.md) records the
built-in imagegen mode, local output paths and exact prompts.

The hero pairs word and tool arrival with a scroll-linked image zoom and shallow
3D card rotation on wide screens. GSAP 3.15.0 and @gsap/react 2.1.2 own only this
marketing choreography. The four headline words are fixed server-rendered spans
with real spaces. GSAP changes only transforms/opacity, without clipping masks or
completion-time DOM replacement. Trailing glyphs remain visible; word layout stays
identical throughout entry. The tool has its own flex item. Scoped
useGSAP/matchMedia cleanup restores text, styles and ScrollTriggers when preferences
change or routes unmount. No scroll interception, pinning or perpetual loops exist.
Shared entry effects use one-shot native Web Animations, cancel on reduced motion
and leave server-rendered content visible before scripts run. Motion is removed.

The floating navbar uses shadcn NavigationMenu, Button styles and mobile Sheet.
One CSS frosted shadcn Card provides a 76% theme tint, 20px backdrop blur, 1.4
saturation and a subtle border. There is no separate solid inner panel or optical
runtime. The SVG renderer, browser detection, canvas maps and resize observer are
removed. Unsupported backdrop filters retain an opaque surface. Increased contrast,
reduced transparency and forced colors restore that solid surface entirely in CSS.

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

Formatting, typed lint, generated route types, strict TypeScript, all 77 tests
(73 ordinary plus four real-Redis integration tests) and the supported Webpack
production build pass. The eight tests for the removed optical math are deleted
with that unused implementation; domain/session checks remain intact. CI has not
run remotely because nothing was pushed.

Six presentation/component scenarios cover hero geometry during actual controlled
animation frames and route return; live reduced-motion restoration; CSS frost in
both themes; increased-contrast recovery; narrow FAQ/control geometry; and styled
Select keyboard/form behavior. Existing checks cover no-JavaScript content and CSS
frost, keyboard FAQ, password visibility, theme contrast and 320–1440px layouts.
The earlier domain workflow checkpoint passed 21 scenarios together with retries
disabled. This presentation-only change reruns the 15 affected read-only scenarios
without repeating external writes.

A fresh Firefox smoke run verified headline fit at 320/768/1440px, frost in both
themes and reduced motion. Increased contrast restores the opaque surface on load.
Live Playwright contrast emulation changes matchMedia but leaves CSS media styles
stale until reload in this bundled Firefox; an isolated one-element page reproduces
the behavior. Live operating-system contrast changes therefore remain a manual
Firefox check. Earlier Firefox checks covered FAQ keyboard operation and shadcn
Select. WebKit could not launch because this host lacks its ICU/XML/Flite and related
system libraries; no system packages were changed. Actual Safari, physical mobile
performance, assistive-technology review and deployment HTTPS behavior remain
unverified.

Public desktop/mobile screenshots are local review artifacts, not committed golden
fixtures. The four original PNGs are optimized responsively through Next Image with
reserved geometry. They are illustrative, not evidence of actual staff or jobs.

## Performance and verification scope

A warm local production Chromium run at 1440×1000px with 4× CPU slowdown sampled
120 animation frames while scrolling the homepage. Frame intervals were median
16.7ms and p95 16.8ms; recorded layout shift was 0. The load-through-scroll recording
contained one 63ms long task and no page errors. This is one desktop measurement,
not a universal frame-rate or physical-device claim.

## References

- [CSS backdrop filters](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [GSAP React cleanup](https://gsap.com/resources/React/)
- [shadcn Base UI Select](https://ui.shadcn.com/docs/components/base/select)
- [Animation performance](https://web.dev/articles/animations-guide)
