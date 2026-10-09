# Home materials and motion

The homepage keeps its server-rendered content and real service catalog. Its photo
overlays use a dark frosted surface, while scroll typography and pointer light
make the existing service story more expressive. No operational data is fabricated.

## Material and composition

The editorial workflow uses the preset-matched shadcn Card. FAQ cards keep shadcn
Collapsible and Button, including expanded state, keyboard interaction and retained
focus. Their inset summary panels and opened answers use the same photo palette.

An opaque surface is the baseline. Supported engines add 24px backdrop blur,
restrained saturation and a 72% dark tint; expanded answers use 88% tint for longer
reading. Text stays fully opaque. Increased contrast, reduced transparency and
forced colors restore solid surfaces; forced colors use system text/background
values. This is frosted glass, without a claim of proprietary liquid refraction.

## React Bits adaptations

The following open-source effects were reviewed at a pinned upstream revision:

| Effect        | FieldOps use and adaptation                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------ |
| SpotlightCard | Local cursor-following radial light behind shadcn process cards; no moving hit targets.          |
| GlareHover    | A subtle diagonal light sweep over photo panels, with keyboard focus support for FAQ controls.   |
| ScrollFloat   | Whole-word depth reveals on section headings, retaining spaces, full opacity and unclipped text. |
| Strands       | The original WebGL closing backdrop with complementary theme accents and a static fallback.      |

The subsequent [React Bits integration](react-bits.md) adds the requested hero,
navigation, rating, confirmation and GPU effects. It replaces the earlier Waves-inspired
Canvas 2D backdrop; the unused renderer was removed.

Source links, adaptation details and the upstream MIT + Commons Clause notice are
in [third-party notices](../THIRD_PARTY_NOTICES.md). The project distributes these
adaptations as part of its application, not as a component library.

Official sources inform implementation. Community examples informed visual selection;
community reports about scroll locking and navigation-cache behavior motivated route
return and early-reveal checks. They are anecdotal reports, not a performance benchmark.

- [Official component catalog](https://reactbits.dev/get-started/index)
- [Community exploration](https://aestheta.ai/react-bits/)
- [Community scroll usability feedback](https://www.reddit.com/r/webdesign/comments/1pow8je/)
- [Community route-return report](https://www.reddit.com/r/nextjs/comments/1sygrc6/)

## Animation budget and fallbacks

- Spotlight updates CSS variables once per animation frame only during local pointer
  movement. Leaving the card, preference changes and unmount cancel pending work.
- Glare uses CSS; informational cards retain their ordinary cursor and hit target.
- Word transforms resolve between the lower 98% and 82% of the viewport. There are
  no word clipping masks or completion-time rewrites. ScrollStack separately uses
  bounded card transforms; its reading-order fallback is documented in the integration guide.
- Strands and CrystalizedBall retain their original WebGL shaders. The graphics
  lifecycle, particle budget and device-pixel ratio cap are documented in the integration guide.
- IntersectionObserver and document visibility pause ambient drawing outside view or
  while hidden. ResizeObserver maintains actual geometry; all resources are disposed.
- Reduced motion and unsupported GPU contexts retain CSS decoration. Touch layouts
  retain native scrolling; ordinary content stays usable without graphics or scripts.
- Existing GSAP handles scroll and typography, without a second scroll controller.
  OGL is the sole new graphics runtime; dialogs and workspace motion keep their ownership.
- Switching between native and smooth mode preserves the reader's position. A guarded
  restoration after GSAP's full media refresh ignores its temporary scroll-range collapse
  and yields to route/hash navigation or unmount.

## Historical material release verification

The following evidence predates the requested component integration. Current
verification and release evidence belongs in [React Bits integration](react-bits.md).

The first material checkpoint passed strict checks, the default production build,
179 local unit tests (six Redis checks skipped locally), and 14 public Chromium
scenarios. Those scenarios include both-theme automated WCAG A/AA checks, all FAQ
answers at 320px, keyboard disclosures, touch/no-script browsing, stable card geometry,
hero glyph geometry, preference cleanup and public navigation/history.

The complete local checkpoint passed formatting, strict TypeScript, lint, 179 unit
tests (six Redis checks skipped locally), the default production build and all 20
selected Chromium scenarios. The extended heading/backdrop checks sample rendered
canvas pixels for movement, reduced-motion/narrow/offscreen pauses and route-return
recovery. They also verify that motion-mode changes retain the reading position.
Customer, technician and administrator checks cover real counts, drill-down,
refresh, confirmed sign-out, accessible controls and landmarks. These scenarios use
authorized evaluation accounts and session operations; they do not create or edit
operational records.

Actual mobile hardware, Safari and lab/field performance scores require separate
measurement; bounded drawing is an implementation budget, not a measured FPS claim.

## Historical published source and acceptance

- Application: [FieldOps](https://fieldops-rafiferdos.vercel.app/)
- Deployed source: `ac019ac9e191de4660f94ef009e6543a195e9d2c`
- [Successful source CI](https://github.com/rafiferdos/fieldops/actions/runs/37973816720):
  clean lockfile install, formatting, strict types, lint, all 185 unit tests including
  Redis session integration, and the default production build.
- Vercel deployment: `dpl_GZjDf8QNw5gB6yaBKEGgNHYL83Za`, READY with the canonical
  production alias, Node 24 and the Singapore (`sin1`) region.
- Hosted acceptance: all **20/20 selected Chromium scenarios passed in 3.8 minutes**
  against the canonical live origin. The same suite passed locally in 3.4 minutes.
  It covers both-theme accessibility, three real role workspaces, navigation/history,
  confirmed logout, text geometry, keyboard disclosures, touch/no-script fallback,
  local lighting cleanup, rendered wave output and preference transitions.
- The [README preview](../README.md#design-accessibility-and-performance) is an actual
  public screenshot captured from this live revision with reduced motion enabled.
  It contains no private account identity or operational records.
- The backend remains unchanged at `1faf01a7ce50ddc4a0a7058deb13c28179408409`.
