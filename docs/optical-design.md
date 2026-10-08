# FieldOps — typography and frosted navigation

## Current direction — October 9, 2026

Preserve the selected shadcn preset, Outfit/Geist typography and existing editorial
composition. The current user request changes only hero entry and navbar material.
Backend behavior, service-scene scroll depth, FAQ and operational flows are unchanged.

## Hero entry

The fixed headline is authored as four server-rendered inline words with real spaces.
The tool occupies its own flex item; both words in the second line share a text
container. This reserves one consistent layout before, during and after animation.

GSAP animates only word transforms and opacity. Words remain unclipped so negative
letter-spacing, descenders and rotated trailing glyphs can paint outside their inline
boxes. No completion callback splits, unwraps or replaces text. Scoped useGSAP and
matchMedia cleanup restore styles when routes or motion preferences change. The
heading remains readable and has the same accessible name without JavaScript.

The previous SplitText masks clipped trailing glyphs and grouped the tool with “More”.
Removing those wrappers at completion changed flex spacing. The runtime SplitText
import is removed; this fixed sentence does not need dynamic text splitting.

## Navbar material

One shadcn Card provides the material behind NavigationMenu, Button styles and the
mobile Sheet trigger. CSS uses a 76% background-token tint, 20px backdrop blur,
1.4 saturation and a subtle border. Foreground controls remain sharp. There is no
nested solid panel, SVG displacement, canvas map, browser sniffing or resize observer.
The previous optical renderer and its unused math/tests are removed.

An opaque themed surface is the baseline. Supported engines progressively apply
CSS frost, including the WebKit-prefixed backdrop property. Reduced transparency,
increased contrast and forced colors restore the opaque surface without JavaScript.
This is frosted glass, with no claim of Apple's exact proprietary material.

## Verification rules

- Sample actual GSAP entry frames at 320/768/1440px. Word layout geometry must remain
  identical, ancestors must not clip glyphs, and final transform/opacity must reset.
- Check route return, live reduced-motion changes and no-JavaScript readability.
- Verify CSS frost in both themes, no-JavaScript frost, contrast preference changes,
  mobile navigation, keyboard focus and 44px icon targets.
- Run strict checks and the production build. Reuse read-only public/browser workflows;
  these presentation changes require no external data writes.
- Document actual browser/performance results and remaining device limits in
  [design verification](design-refinement.md). Commit verified checkpoints; do not push.

## Retained component and asset decisions

Preset-matched shadcn Select, Card, Collapsible, NavigationMenu, Empty, Pagination,
Sheet, AlertDialog and Toast remain the default compositions. Native links retain
shadcn button styles and their link semantics. Semantic HTML provides document
structure, headings, labels, forms and description lists.

Four original editorial images remain in `public/images/editorial/`. They illustrate
care and planning, not actual staff or completed jobs. The built-in generation mode
and exact prompts remain recorded in [editorial assets](editorial-assets.md).

## References

- [GSAP React scope and cleanup](https://gsap.com/resources/React/)
- [GSAP matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>)
- [CSS backdrop filters](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [Playwright controlled animation time](https://playwright.dev/docs/clock)
