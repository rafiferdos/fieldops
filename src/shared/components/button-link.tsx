import Link from "next/link"
import type { ComponentProps } from "react"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/shared/ui/button"

// Navigation uses shadcn button styles without replacing native link semantics.
export function ButtonLink<T extends string>({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link<T>> & VariantProps<typeof buttonVariants>) {
  return (
    <Link className={buttonVariants({ className, variant, size })} {...props} />
  )
}
