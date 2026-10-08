import { z } from "zod"

export const apiErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.string()),
})

export function apiSuccessSchema<T>(data: z.ZodType<T>) {
  return z.object({ success: z.literal(true), message: z.string(), data })
}
