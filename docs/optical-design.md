# FieldOps — care in motion

## Direction and scope

Make the public experience feel crafted: oversized Outfit type, inline tool marks,
quiet Geist body copy, emerald material photography and a floating optical navigation
island. Keep the selected shadcn preset and the operational screens' readable density.
This is a visual refinement of existing routes; backend behavior and later product
slices remain unchanged.

## Research decisions

- Apple's [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
  describes lensing, adaptive contrast and a separate navigation layer. Apply the
  optical material to navigation, never to entire forms or dense reading surfaces.
- The original [kube optical study](https://kube.io/blog/liquid-glass-css-svg/)
  demonstrates refraction through SVG displacement and explains the Chromium-only
  SVG backdrop path. The [Meapri community implementation](https://github.com/Meapri/liquid-glass-web)
  confirms the same limitation. These are research references, not dependencies or
  claims of Apple's exact native rendering. Implement a small independent rounded
  lens map; do not copy their source or install an experimental glass package.
- [GSAP React](https://gsap.com/resources/React/),
  [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/),
  [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and
  [matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>) provide scoped cleanup,
  accessible text splitting and responsive motion. npm stable metadata on 2026-10-09:
  GSAP 3.15.0 and official React hook 2.1.2 (React >=17).
- Remove Motion rather than shipping overlapping animation engines. Shared entry
  effects use the browser's Web Animations API; GSAP is confined to marketing scenes.
- Follow the bundled Next.js image/font and Server/Client guides. Keep self-hosted
  variable fonts and optimize local images with explicit sizes and reserved geometry.

## Choreography

1. Hero: staggered word/icon arrival, a single tool rotation and a quiet rule reveal.
   The server heading remains complete without scripts; split text preserves its name.
2. Service scene: scroll-linked image zoom, shallow 3D rotation and separated card
   depth on wide screens. Mobile gets a shorter, simpler composition. No scroll
   interception, snapping, forced pinning or indefinite animation.
3. Navbar: compact floating island, one translucent material without an opaque inner
   panel, a real refracted perimeter and animated link arrows. Resize the displacement map only on geometry
   changes; no animation-frame loop for optics.
4. FAQ: image-backed shadcn Cards, official Base UI Collapsible semantics, a rotating
   plus control and an answer surface inside the same card. All five contract answers
   remain available; no claim that a redirect proves payment.
5. Forms/workspaces: retain direct, predictable interaction. Reuse shared type/spacing
   and restrained native entry feedback; do not move focused controls on scroll.

## Guardrails and acceptance

- Reduced motion removes SplitText/scroll choreography and restores original styles,
  including when the preference changes while the page is open.
- Enhanced backdrop refraction is conservatively limited to Chromium.
  Other browsers receive a readable translucent navigation fallback. Chromium mobile
  engine detection is supported; physical mobile optical rendering remains unverified. Reduced
  transparency, increased contrast and forced colors remove the optical filter.
  A fallback is not described as Liquid Glass.
- Only small bounded navigation lenses use SVG backdrop displacement. Do not use
  full-screen WebGL, DOM-to-canvas capture, pointer trackers or continuously rebuilt
  maps. Use transform/opacity for scroll motion and let GSAP sleep when idle.
- Check keyboard, focus, no-JavaScript output, narrow layouts, both themes, real
  catalog/account flows and actual changed-pixel refraction against a controlled
  background. Measure production Chromium scroll behavior with 4x CPU slowdown;
  document the measured scope and remaining browser/device limits honestly.
- Commit completed, verified slices. Do not pad commit history, push or deploy.

## Editorial asset provenance

Four original illustrations were generated with the built-in imagegen tool. They
are editorial imagery, not photos of actual customers, employees or completed jobs.
The project copies live in `public/images/editorial/`; prompts are recorded in
`docs/editorial-assets.md`. No API image fields or catalog claims were invented.

## Control consistency

Use the preset-matched shadcn Select composition in catalog/queue filters, the request
wizard, review decisions and technician assignment. Base UI owns popup, selection,
keyboard and focus behavior; React Hook Form Controllers preserve validation and
field focus. A wrapper isolates the library's hidden input from field-spacing rules.
Empty selection and an explicit “All statuses” option have distinct meanings.

Authentication, filters, account metadata and operational detail/actions use shadcn
Cards. Shared Empty/Pagination and NavigationMenu/Sheet compositions keep the same
visual language. Navigation uses shadcn `buttonVariants` on native links, preserving
link semantics instead of turning destinations into action buttons. Semantic HTML
still defines document structure, headings, labels, forms and description lists.

## Implementation boundaries

The rounded lens map is bounded to 960 × 160 pixels. It is regenerated only when
navigation dimensions change, using a ResizeObserver and one scheduled frame.
The SVG filter softens the backdrop by 1.25 pixels and displaces its RG channels;
foreground controls remain unfiltered. A single 64% theme tint retains contrast.
The Chromium browser check compares screenshots with displacement enabled/disabled
while retaining identical blur/tint, proving a spatial change beyond frosted glass.

SplitText gives descenders mask padding, then removes temporary wrappers after
entry. GSAP matchMedia/useGSAP reverts text/styles and ScrollTriggers on preference
changes or route teardown. The homepage catches known API catalog errors locally;
its server-rendered navigation, headline and service journey remain available.
