import { z } from "zod"

// Administrative filters reject invalid pagination instead of silently broadening a query.
export const adminPaginationShape = {
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}
