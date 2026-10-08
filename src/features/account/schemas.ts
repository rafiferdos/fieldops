import { z } from "zod"
export const updateProfileSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
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
