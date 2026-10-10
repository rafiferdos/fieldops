"use client"
import Image from "next/image"
import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/shared/lib/utils"

// Failed delivery keeps its reserved geometry and an honest fallback instead of a broken image.
export function ContentImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string | null
  alt: string
  className?: string
  sizes: string
}) {
  const [failedSource, setFailedSource] = useState<string>()
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted/40",
        className
      )}
    >
      {src && src !== failedSource ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageOff aria-hidden="true" className="size-5" />
          Image unavailable
        </div>
      )}
    </div>
  )
}
