import Link from "next/link"
import { Wrench } from "lucide-react"
import { cn } from "@/shared/lib/utils"

// One recognizable mark anchors public, authentication and workspace navigation.
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2.5 font-heading text-xl font-semibold tracking-tight",
        className
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Wrench
          aria-hidden="true"
          className="size-[18px] group-hover:-rotate-12 motion-safe:transition-transform motion-safe:duration-300"
        />
      </span>
      FieldOps<span className="sr-only"> home</span>
    </Link>
  )
}
