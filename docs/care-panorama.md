# Service care panorama

The home page places React Bits' CircularCarousel between the live service catalog and
the request-to-resolution guide. Five generated editorial scenes connect preparation,
careful work, planning and a maintained home without representing real staff or jobs.

## Source and appearance

Reviewed the [official registry](https://reactbits.dev/r/CircularCarousel-JS-CSS.json)
and [TypeScript source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/CircularCarousel)
at revision `d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`. The registry needs no new
dependencies. The local port separates typed geometry, the animation lifecycle and
the view instead of shipping unchecked JavaScript or the upstream stock photographs.
Attribution is included in `THIRD_PARTY_NOTICES.md`.

The requested panorama/rise preset retains its eight curved strips, projection,
spring, drag threshold, momentum, snap and pointer parallax. Configuration follows
the requested values: 222px cards, 1.333 aspect ratio, 19px gap, 10-degree drift,
zero tilt, curve 1, perspective prop 1800, interval 3, left direction, momentum 0.6,
parallax 0.3, stretch 0.41, depth fade 0.55, inner shade 0.53 and 21px corners.
Captions stay off. The fade uses the page background token in both themes.
The source's inward panorama computes its effective perspective from the ring radius;
the supplied perspective prop continues to follow that original preset rule.

## Integration and accessibility

- The desktop stage is 560px tall; the mobile stage is 360px tall.
- A shadcn Button exposes persistent pause/play without changing the original carousel.
  Hover and keyboard focus also suspend drift. Arrow keys, Home and End browse images.
  Automatic drift never repeatedly announces slide changes to screen readers.
- Reduced motion disables drift, the intro, inertia and pointer parallax; keyboard
  destinations resolve immediately. A live preference change clears an unfinished intro.
- Native vertical wheel/touch scrolling remains available. Only horizontal wheel input
  rotates the panorama. Pointer cancellation releases the drag without adding inertia.
- Each scene is served through Next.js image optimization at 828px. All eight strips,
  fallback and preload share that URL; the source PNGs are retained as editable originals.
- Images preload near the viewport. The original IntersectionObserver and document
  visibility lifecycle stop frames off-screen or in a hidden tab. A corrected snap
  condition lets a paused, aligned ring sleep instead of continuously rescheduling itself.
- Without JavaScript, a real image strip and descriptive alternative text remain visible.
  No backend data or catalog prices are replaced by the editorial gallery.

The public reading surface clips horizontal paint without introducing a nested
scroller. This contains existing BorderGlow halos after desktop-to-mobile resize;
GSAP owns its outer content styles, so the clipping belongs to the inner surface.
Vertical scrolling and the process stack retain their existing behavior.

## Verification

The local production preview passed all three panorama browser scenarios: both
themes, five optimized resources, clean hydration, drag/keyboard controls, stopped
frames after pause and off-screen exit, mobile overflow, native vertical scrolling,
live reduced-motion changes and a visible no-JavaScript image fallback. Scoped
automated WCAG A/AA checks reported no violations.

Four additional public scenarios passed: seven pages in both themes, normal-motion
text contrast, keyboard-aware footer blur and reduced-motion process-stack order.
Strict checks passed with 186 unit tests and six Redis checks skipped locally;
release CI runs those Redis checks. The local webpack production build passed.
Real Safari/mobile hardware and field performance remain unmeasured.

## Asset provenance

Created on 2026-10-10 using the built-in imagegen tool. Final images are saved in
`public/images/panorama/`; all prompts are preserved below. No stock-image fallback,
external image host or additional renderer is required.

## Final prompts

### service-preparation.png

Use case: photorealistic-natural. Asset type: one standalone landscape editorial photograph for FieldOps field-service website's curved panorama carousel, 4:3 composition. Premium architectural magazine photography, authentic tactile textures, natural soft window light, calm forest-green and warm limestone/oak palette, restrained realistic color, subject clearly legible at thumbnail scale. No text, lettering, branding, logos, watermarks or UI. No collage, no multiple panels. A thoughtfully arranged small technician's tool kit on a warm oak workbench: a realistic polished steel adjustable wrench, brass screwdriver, neatly folded dark emerald work cloth and a compact canvas pouch. Close editorial overhead angle, physically coherent professional tools, uncluttered composition, beautiful natural shadows.

### precision-care.png

Use case: photorealistic-natural. Asset type: one standalone landscape editorial photograph for FieldOps field-service website's curved panorama carousel, 4:3 composition. Premium architectural magazine photography, authentic tactile textures, natural soft window light, calm forest-green and warm limestone/oak palette, restrained realistic color, subject clearly legible at thumbnail scale. No text, lettering, branding, logos, watermarks or UI. No collage, no multiple panels. Close-up of a technician's hands and forearms in a dark olive cotton work jacket carefully tightening the hinge of a warm oak cabinet with a correctly held screwdriver. Only hands and forearms visible, no face. Contemporary sunlit home, limestone wall, safe non-electrical maintenance, credible geometry and anatomy.

### water-care.png

Use case: photorealistic-natural. Asset type: one standalone landscape editorial photograph for FieldOps field-service website's curved panorama carousel, 4:3 composition. Premium architectural magazine photography, authentic tactile textures, natural soft window light, calm forest-green and warm limestone/oak palette, restrained realistic color, subject clearly legible at thumbnail scale. No text, lettering, branding, logos, watermarks or UI. No collage, no multiple panels. Close architectural photograph of a clean brushed-metal kitchen faucet and a deep pale stone sink, muted green handmade tile backsplash, neatly folded ivory cloth at the edge. A quiet well-maintained contemporary home, subtle real metal reflections, soft afternoon light. Physically coherent faucet with one spout and an accessible sink.

### visit-planning.png

Use case: photorealistic-natural. Asset type: one standalone landscape editorial photograph for FieldOps field-service website's curved panorama carousel, 4:3 composition. Premium architectural magazine photography, authentic tactile textures, natural soft window light, calm forest-green and warm limestone/oak palette, restrained realistic color, subject clearly legible at thumbnail scale. No text, lettering, branding, logos, watermarks or UI. No collage, no multiple panels. Quiet planning desk beside a large sunlit window: a blank cream notebook, graphite pen, a closed charcoal tablet with no interface visible, a dark emerald ceramic cup and a tidy small tool pouch. A subtle out-of-focus home interior beyond. Three-quarter close camera angle, human scale, natural paper and ceramic textures.

### lasting-care.png

Use case: photorealistic-natural. Asset type: one standalone landscape editorial photograph for FieldOps field-service website's curved panorama carousel, 4:3 composition. Premium architectural magazine photography, authentic tactile textures, natural soft window light, calm forest-green and warm limestone/oak palette, restrained realistic color, subject clearly legible at thumbnail scale. No text, lettering, branding, logos, watermarks or UI. No collage, no multiple panels. A wide architectural detail of a beautifully maintained contemporary home corner: warm oak cabinet with perfectly aligned doors, pale textured limestone counter, soft olive green wall and a simple leafy branch in a ceramic vase. Warm daylight, no people, no clutter. An elegant calm result of careful home maintenance, distinct from a kitchen sink photograph.
