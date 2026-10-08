import { z } from "zod"

export const roleSchema = z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"])
export type Role = z.infer<typeof roleSchema>
export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: roleSchema,
  createdAt: z.iso.datetime(),
})
export const profileSchema = userSchema.extend({ phone: z.string().nullable() })
export type Profile = z.infer<typeof profileSchema>
const email = z.string().trim().toLowerCase().pipe(z.email().max(254))
export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1).max(128),
})
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(15).max(128),
})
export const credentialsSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1).max(8192),
  refreshToken: z.string().min(1).max(8192),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive().max(900),
  refreshExpiresAt: z.iso.datetime(),
})
export type Credentials = z.infer<typeof credentialsSchema>
