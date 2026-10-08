import { z } from "zod"
const safeComment = (value: string) =>
  Array.from(value).every((character) => {
    const code = character.charCodeAt(0)
    return (
      code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)
    )
  })
export const feedbackSchema = z.object({
  id: z.uuid(),
  workOrderId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.iso.datetime(),
})
export const feedbackInputSchema = z.strictObject({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine(safeComment, "Remove unsupported control characters.")
    .optional(),
})
export const feedbackFormSchema = z.strictObject({
  rating: z.enum(["1", "2", "3", "4", "5"]),
  comment: z
    .string()
    .trim()
    .max(1000)
    .refine(safeComment, "Remove unsupported control characters."),
})

// Payment review is independent of PAID; a known hold blocks a new review.
export function feedbackEligible(
  work: {
    status: string
    invoice: { status: string } | null
    feedback: unknown
  },
  requiresReview = false
) {
  return (
    work.status === "COMPLETED" &&
    work.invoice?.status === "PAID" &&
    !work.feedback &&
    !requiresReview
  )
}
