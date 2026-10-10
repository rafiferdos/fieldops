import { z } from "zod"
import { imageUrlSchema } from "@/shared/lib/image-policy"
export const updateProfileSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  avatarUrl: imageUrlSchema.nullable().optional(),
  phone: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(
        /^\+[1-9]\d{1,14}$/,
        "Use international format, for example +8801712345678."
      ),
  ]),
})
