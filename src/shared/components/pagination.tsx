import type { Route } from "next"
import { queryString } from "@/shared/lib/list-query"
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination"

export function Pagination({
  pathname,
  query,
  page,
  totalPages,
  total,
}: {
  pathname:
    | "/services"
    | "/admin/services"
    | "/admin/users"
    | "/customer"
    | "/admin/requests"
    | "/admin/work-orders"
    | "/customer/work-orders"
    | "/technician"
  query: Record<string, string | number | undefined>
  page: number
  totalPages: number
  total: number
}) {
  function href(next: number): Route {
    return `${pathname}?${queryString({ ...query, page: next })}`
  }
  return (
    <PaginationRoot
      aria-label="Results pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-sm"
    >
      <p className="text-muted-foreground">
        {total} results · Page {page} of {Math.max(1, totalPages)}
      </p>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={href(page - 1)} />
          </PaginationItem>
        )}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={href(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  )
}
