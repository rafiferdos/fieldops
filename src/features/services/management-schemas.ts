import { z } from "zod"

// Parse decimal BDT as integer paisa without rounding a floating-point product.
export function priceToMinor(value: string) {
  if (!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ""] = value.split(".")
  if (whole === undefined) return null
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"))
  return minor <= 1000000000n ? Number(minor) : null
}
export function priceFromMinor(minor: number) {
  return `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, "0")}`
}
const fields = {
  name: z.string().trim().min(2, "Use at least 2 characters.").max(100),
  description: z
    .string()
    .trim()
    .min(10, "Describe the service in at least 10 characters.")
    .max(2000),
}
export const serviceInputSchema = z.strictObject({
  ...fields,
  basePriceMinor: z.number().int().min(0).max(1000000000),
})
export const serviceUpdateSchema = serviceInputSchema
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "Provide at least one changed field."
  )
export const serviceFormSchema = z.strictObject({
  ...fields,
  price: z
    .string()
    .trim()
    .refine(
      (value) => priceToMinor(value) !== null,
      "Enter BDT 0–10,000,000 with up to two decimal places."
    ),
})
