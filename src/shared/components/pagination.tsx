import Link from "next/link"
import type { Route } from "next"
import { queryString } from "@/shared/lib/list-query"

export function Pagination({
  pathname,
  query,
  page,
  totalPages,
  total,
}: {
  pathname: "/services" | "/customer"
  query: Record<string, string | number | undefined>
  page: number
  totalPages: number
  total: number
}) {
  function href(next: number): Route {
    return `${pathname}?${queryString({ ...query, page: next })}`
  }
  return (
    <nav
      aria-label="Results pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-sm"
    >
      <p className="text-muted-foreground">
        {total} results · Page {page} of {Math.max(1, totalPages)}
      </p>
      <div className="flex gap-5">
        {page > 1 && (
          <Link className="underline underline-offset-4" href={href(page - 1)}>
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link className="underline underline-offset-4" href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
