# Dashboard motion

The protected workspace uses the existing GSAP ScrollSmoother on wide, fine-pointer
screens. Its 0.5-second catch-up keeps scrolling responsive while softening wheel input.
Touch screens, narrow layouts and reduced-motion preferences use native scrolling.
No additional scrolling or animation dependency is installed.

## Composition and ownership

- One workspace scroller survives nested dashboard, queue and account routes. The public
  layout uses the same lifecycle helper with its existing image/card choreography.
- The shadcn sidebar and fixed workspace header stay outside transformed content. The
  smooth surface reserves the sidebar's actual theme-defined expanded/collapsed space.
- shadcn dialogs, menus, tooltips and the mobile Sheet keep their supported portals.
  Smoothing does not reposition their focus; native modal scroll locking remains authoritative.
- Width/height observers batch scroll-range refreshes after streaming, chart measurement
  and sidebar changes. Font readiness has a guarded refresh.
- GSAP contexts own plugin/timeline disposal. Observers and listeners are removed on
  unmount or media-preference changes; native content styles are restored.

## Visual behavior

Metrics and chart cards enter in short groups. Recent-record cards and their semantic
list rows use a bounded stagger near the viewport edge. Full text opacity preserves
reading contrast, and server content is visible without JavaScript.

Chart bars grow from their baseline when they first enter view. Exact counts, financial
values and accessible labels remain unchanged. The chart context follows the actual
count signature; identical data refreshes do not replay the growth animation. Reduced
motion restores final chart geometry immediately.

New workspace routes reset both native and smoothed scroll positions. Browser history
and explicit settings anchors retain their existing behavior. Sidebar links, confirmations
and account menus continue to use supported shadcn composition.

## Verification

The workspace browser scenarios check real API counts and navigation alongside native
scroll position versus the transformed surface, fixed-header geometry, sidebar collapse,
reachable lower controls, dialog scroll locking and JavaScript errors. Administrator
checks additionally cover reduced-motion changes, mobile Sheet behavior and Back/Forward.
Public presentation and both-theme role accessibility scenarios guard the shared helper.

These checks use dedicated backend accounts, reads and session operations. They do not
create product records or certify performance on actual Safari/mobile hardware.

The local production baseline passed 13/14 scenarios. The failing administrator history
check led to explicit per-route restoration; its follow-up also waits for the End scroll
to settle before leaving the dashboard. All three role scenarios have passing follow-up
results. Strict checks and the default production build pass. Hosted acceptance is recorded
after deploying the exact CI-verified revision.
