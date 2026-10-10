import { z } from "zod"

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const imagePurposeSchema = z.enum(["AVATAR", "SERVICE"])
export type ImagePurpose = z.infer<typeof imagePurposeSchema>

// Image optimization accepts only FieldOps assets, never arbitrary remote origins.
export const imageUrlSchema = z
  .url()
  .max(2048)
  .refine((value) => {
    if (!URL.canParse(value)) return false
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/[a-zA-Z0-9_-]+\/image\/upload\/v\d+\/fieldops\//.test(url.pathname)
    )
  }, "Choose an image uploaded through FieldOps.")

export const uploadedImageSchema = z.object({
  id: z.uuid(),
  url: imageUrlSchema,
})

export function imageFileError(file: File) {
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    return "Choose an image up to 3 MB."
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "Choose a JPEG, PNG or WebP image."
  return null
}
