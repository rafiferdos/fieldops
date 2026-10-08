import Image from "next/image"
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Wrench,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"

// Editorial photography and labelled process cards never impersonate live job data.
export function ServiceScene() {
  return (
    <figure className="service-scene" data-service-scene="">
      <div className="scene-image" data-scene-image="">
        <Image
          src="/images/editorial/service-still-life.png"
          alt="Precision tools on emerald work cloth, an editorial study of service care"
          fill
          sizes="(max-width: 1280px) 100vw, 1216px"
          fetchPriority="high"
          loading="eager"
          className="object-cover"
        />
      </div>
      <div className="scene-caption">
        <span className="flex items-center gap-2 text-xs font-medium tracking-wide">
          <span className="size-1.5 rounded-full bg-current" />
          Care in the details
        </span>
        <ArrowDownRight aria-hidden="true" className="size-6" />
      </div>
      <div className="scene-content">
        <div className="scene-type" aria-hidden="true">
          Good work.
          <br />
          Clear path.
        </div>
        <div className="scene-card-depth">
          <Card className="scene-workflow" data-scene-card="">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium">The service journey</span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-5">
                {[
                  {
                    icon: CircleDot,
                    title: "Tell us what needs care.",
                    detail: "A clear request",
                    number: "01",
                  },
                  {
                    icon: Wrench,
                    title: "Make room for a plan.",
                    detail: "A coordinated visit",
                    number: "02",
                  },
                  {
                    icon: Check,
                    title: "Keep the whole picture.",
                    detail: "A documented result",
                    number: "03",
                  },
                ].map(({ icon: Icon, title, detail, number }) => (
                  <li key={number} className="flex items-center gap-3">
                    <span className="scene-step-icon">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {number}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      <figcaption className="scene-footnote">
        <span>Thoughtfully coordinated. Clearly documented.</span>
        <Badge
          variant="outline"
          className="border-white/30 bg-black/30 text-white"
        >
          Illustrated workflow
        </Badge>
      </figcaption>
    </figure>
  )
}
