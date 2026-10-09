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
below for the exact CI-verified revision.

## Published release and hosted acceptance

Verified October 9, 2026.

| Artifact        | Verified evidence                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend source | `fede1418ebac27c581b6cc9b2bba3b7a0622d958`                                                                                                                |
| CI              | [Passing release checks](https://github.com/rafiferdos/fieldops/actions/runs/37952043872): 185 tests, strict type/lint/format checks and production build |
| Deployment      | Vercel `dpl_5ReJDbNxGnxoHM7E65nJU4eQWbL5`, READY, exact source revision, Node 24, Singapore functions                                                     |
| Application     | [fieldops-rafiferdos.vercel.app](https://fieldops-rafiferdos.vercel.app)                                                                                  |

The canonical production application passed **14/14 Chromium scenarios in 3.5 minutes**,
with retries disabled. The same run checks public presentation, normal-motion contrast,
both-theme WCAG A/AA accessibility and all three real role workspaces.

- Wheel input updates the native scroll position and the smoothed surface settles to it.
- Fixed-header geometry, expanded/collapsed sidebar spacing and lower-page controls remain usable.
- Reduced-motion changes and narrow layouts remove smooth transforms; the mobile shadcn Sheet works.
- New queue routes show their headings; administrator Back/Forward restores the prior route position.
- Portalled sign-out dialogs stay outside the transformed content and lock native scrolling.
- Actual API totals, refresh, account navigation, canceled/confirmed sign-out and session denial pass.
- No client JavaScript errors are captured in any role scenario.

Only an optional dedicated-demo aggregate screenshot is captured; traces and video remain
disabled. These scenarios use reads and session operations, creating no product records.
The backend repository remains unchanged. Documentation-only follow-ups do not alter the
deployed application source. The hardware and performance limits described above still apply.
