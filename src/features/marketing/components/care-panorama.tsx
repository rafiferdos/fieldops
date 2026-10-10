"use client"

import { useMemo, useState } from "react"
import { getImageProps } from "next/image"
import { Pause, Play } from "lucide-react"
import { CircularCarousel } from "@/shared/components/react-bits/circular-carousel"
import { Reveal } from "@/shared/components/reveal"
import { Button } from "@/shared/ui/button"

// Generated editorial scenes illustrate care, never claim to be real staff or completed jobs.
const scenes = [
  {
    src: "/images/panorama/service-preparation.png",
    alt: "Precision tools and an emerald cloth prepared on an oak workbench",
    title: "Thoughtful preparation",
  },
  {
    src: "/images/panorama/precision-care.png",
    alt: "A technician carefully adjusting an oak cabinet hinge",
    title: "Care in the details",
  },
  {
    src: "/images/panorama/water-care.png",
    alt: "A well-maintained metal faucet above a limestone sink and green tiles",
    title: "Everyday reliability",
  },
  {
    src: "/images/panorama/visit-planning.png",
    alt: "A notebook, pen and tool pouch on a sunlit planning desk",
    title: "Room for a plan",
  },
  {
    src: "/images/panorama/lasting-care.png",
    alt: "An aligned oak cabinet and stone counter in a quiet sunlit home",
    title: "A lasting result",
  },
]

export function CarePanorama() {
  const [paused, setPaused] = useState(false)
  // All eight curved strips reuse one optimized URL per scene instead of loading source PNGs.
  const items = useMemo(
    () =>
      scenes.map((scene) => ({
        ...scene,
        src: getImageProps({
          src: scene.src,
          alt: scene.alt,
          width: 400,
          height: 300,
        }).props.src,
      })),
    []
  )
  return (
    <section aria-labelledby="care-panorama-title" data-care-panorama="">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Care, in every detail</p>
          <h2
            id="care-panorama-title"
            className="mt-4 font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
          >
            Good work.
            <br />
            Seen up close.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Plan the visit. Take care of the details.
          <br />
          Keep a clear record of the result.
        </p>
      </Reveal>
      <div className="relative h-90 w-full sm:h-140">
        <CircularCarousel
          items={items}
          preset="panorama"
          intro="rise"
          cardWidth={222}
          aspectRatio={1.333}
          speed={10}
          captions={false}
          gap={19}
          tilt={0}
          curve={1}
          perspective={1800}
          autoplay={paused ? "off" : "drift"}
          interval={3}
          direction="left"
          momentum={0.6}
          snap
          pauseOnHover
          focusOnClick
          draggable
          parallax={0.3}
          stretch={0.41}
          fadeColor="var(--background)"
          depthFade={0.55}
          innerShade={0.53}
          cornerRadius={21}
          label="Service care panorama"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Drag to explore. Use arrow keys when focused.
        </p>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {paused ? "Play panorama" : "Pause panorama"}
        </Button>
      </div>
    </section>
  )
}
