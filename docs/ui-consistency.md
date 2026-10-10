# Control and navigation consistency

Reviewed 10 October 2026. This pass refines existing workflows; the API's role,
ownership, scheduling, version and payment contracts remain authoritative.

## Control audit

Eight browser-native date/time fields appeared across five feature components:

| Location                  | Fields                        | Replacement                           |
| ------------------------- | ----------------------------- | ------------------------------------- |
| Operations overview       | Inclusive from / exclusive to | shadcn Calendar + Popover             |
| Audit filters             | Inclusive from / exclusive to | shadcn Calendar + Popover             |
| Request wizard            | Preferred visit               | Calendar + styled hour/minute Selects |
| Pending request editor    | Preferred visit               | Calendar + styled hour/minute Selects |
| Assignment / rescheduling | Visit start / end             | Calendar + styled hour/minute Selects |

The shared typed picker supports RHF Controllers and server-rendered GET filters.
Hidden fields preserve bookmarkable ISO dates. Calendar days use `Asia/Dhaka` and
TZDate; browser timezone cannot change a civil day. Time remains minute-precise,
24-hour Dhaka time. Selecting a day never silently supplies a visit time. Existing
Zod rules reject incomplete, past, reversed or over-eight-hour visit windows.
Changing either visit boundary invalidates previously checked availability.

Month, year, hour and minute selectors use the existing shadcn Select composition.
No native select is introduced through the Calendar's optional dropdown captions.
DayPicker's forwarded button ref restores keyboard focus movement. The compact
36px calendar grid fits a 320px viewport; surrounding controls keep 44px targets.

Source inspection found no native visible select, alert or confirm. Native hidden
inputs and semantic forms/headings remain appropriate. The explicitly requested
original HoldButton and generated shadcn primitives retain their own native elements.

## Original navigation motion

BranchedMenu keeps real unboxed links and its original 36px rows, 40px indentation,
14px trunk, 10px rounded branches, 400ms draw, 300ms fold, line fade and gliding
section marker. Stable group identity preserves SVG transitions and collapsed
state across routes. Active state comes from the URL. A second custom active rail
and icon transform are removed. Accessibility and reduced-motion behavior remain.

RubberSegment's track is transparent over the navbar's single frosted surface.
Its elastic thumb retains the upstream opaque mask, using `primary` and
`primary-foreground`. Real links and the clipped, aria-hidden label copies fill
identical equal-width slots with matching typography. Making the thumb translucent
exposed the lower text; allowing short links to shrink offset the copied labels.
The focus outline stays outside the opaque thumb, as in the source component.
Hover, keyboard focus and nested catalog routes keep the correct active slot;
hydration and pointer leave cannot erase keyboard focus feedback.

The smooth viewport uses supported `overflow: clip` where available. Unlike
`hidden`, it cannot accumulate a second internal scroll offset when controls receive
focus. GSAP still owns the window scroller. Cleanup restores the original overflow;
portals remain outside the transformed content. Browser tests use actual window
wheel input before targeting offscreen controls.

## Service process composition

The existing three-card ScrollStack remains. A compact stage guide, explicit role
badges and recorded outcomes clarify the request-to-resolution handoff. Emerald,
indigo and amber use existing theme tokens. Small screens show a compact horizontal
guide and ordinary stacked document content; no extra scroll runway is added.
The process is explanatory content, never fabricated live progress or statistics.

## Verification

- Formatting, strict types and lint pass. Unit tests pass 186 cases; six Redis
  integration cases require the isolated Redis service supplied by CI.
- The production webpack build passes. Local default Turbopack compilation is
  blocked by the environment's CSS-worker port restriction; the unchanged default
  build command must pass in CI before release.
- Thirteen public browser checks pass, covering responsive layout, both-theme
  accessibility, elastic navigation, mobile focus, stacking and reduced motion.
  Three explicitly opt-in captures/authenticated checks are skipped in that run.
- Focused browser checks pass for original branch drawing and marker movement,
  calendar keyboard/touch behavior, report/audit date queries, wizard review/back
  persistence, clearing and validation, and smooth-scroll focus alignment.
- Disposable backend regression checks pass for customer registration, request
  create/edit/cancel, foreign-record privacy, stale review, qualified assignment,
  schedule collisions and rescheduling. Existing customer work is not modified.
- The navbar correction is checked at 768px, 900px and 1440px in both themes.
  Actual text bounds align within half a pixel, the thumb is fully opaque, and
  foreground contrast exceeds 4.5:1. Elastic keyboard navigation and mobile
  navigation remain covered by browser checks.

## References

- [shadcn Base UI Calendar](https://ui.shadcn.com/docs/components/base/calendar)
- [shadcn Base UI Date Picker](https://ui.shadcn.com/docs/components/base/date-picker)
- [DayPicker timezone support](https://daypicker.dev/docs/time-zone/)
- [MDN overflow behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow)
- [GSAP ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/)
- React Bits source revision and license: [third-party notices](../THIRD_PARTY_NOTICES.md).
