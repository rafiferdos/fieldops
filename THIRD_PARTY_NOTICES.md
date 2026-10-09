# Third-party notices

## React Bits

FieldOps adapts the pointer-positioned radial light from **SpotlightCard** and the
diagonal background-position sweep from **GlareHover**. The implementation retains
FieldOps' shadcn Card primitives and theme tokens. It narrows the interaction to
local pointer events, batches paints, and disables movement for reduced motion.
It does not redistribute React Bits as a component library.

**ScrollFloat** informs a word-based scroll reveal with full text opacity and no
clipping masks. The earlier Waves-inspired Canvas 2D closing backdrop has been
replaced by the requested Strands WebGL effect.

- Author: David Haz
- Source revision: `d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`
- [SpotlightCard source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/SpotlightCard)
- [GlareHover source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/GlareHover)
- [ScrollFloat source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/TextAnimations/ScrollFloat)
- [Waves source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Backgrounds/Waves)
- [Upstream license](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/LICENSE.md)

### Requested interactive components

The application also includes source-reviewed **TechText, CrystalizedBall,
BranchedMenu, HoldButton, PeekRating, RubberSegment, StrokeText, Strands,
BorderGlow, StaggeredMenu, GradualBlur and ScrollStack** at the same revision.

Visuals retain the upstream geometry, wave fill, shaders, glow masks and stagger
patterns where applicable. Colors match FieldOps. Integration fixes preserve native
hero geometry, use real Next.js links, compose shadcn modal/collapsible primitives,
validate gesture completion and dispose animations and GPU resources. RubberSegment
and ScrollStack share the existing GSAP runtime rather than adding Motion/Lenis.
Lucide supplies existing icons instead of installing another icon library.

- [TechText source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/TextAnimations/TechText)
- [CrystalizedBall source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/CrystalizedBall)
- [BranchedMenu source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Micro/BranchedMenu)
- [HoldButton source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Micro/HoldButton)
- [PeekRating source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Micro/PeekRating)
- [RubberSegment source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Micro/RubberSegment)
- [StrokeText source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/TextAnimations/StrokeText)
- [Strands source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/Strands)
- [BorderGlow source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/BorderGlow)
- [StaggeredMenu source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/StaggeredMenu)
- [GradualBlur source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/GradualBlur)
- [ScrollStack source](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/ScrollStack)

CodeSlots was reviewed for applicability but is not distributed: FieldOps has no
email-code verification endpoint or form. The gateway's hosted OTP screen belongs
to the payment provider.

The upstream license is reproduced below.

### MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

#### Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

#### No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
