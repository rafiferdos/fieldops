import { expect, it } from "vitest"
import { imageFileError, imageUrlSchema, MAX_IMAGE_BYTES } from "./image-policy"

it("accepts only bounded raster image selections", () => {
  expect(
    imageFileError(new File(["image"], "photo.png", { type: "image/png" }))
  ).toBeNull()
  expect(
    imageFileError(new File(["<svg/>"], "photo.svg", { type: "image/svg+xml" }))
  ).toContain("JPEG")
  expect(
    imageFileError(
      new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", {
        type: "image/png",
      })
    )
  ).toContain("3 MB")
})
it.each([
  "not-a-url",
  "http://res.cloudinary.com/demo/image/upload/v1/fieldops/avatar/photo.webp",
  "https://evil.example/photo.webp",
  "https://res.cloudinary.com/demo/raw/upload/v1/fieldops/avatar/photo.svg",
  "https://res.cloudinary.com/demo/image/upload/v1/fieldops/avatar/photo.webp?redirect=x",
  "https://res.cloudinary.com/demo/image/upload/v1/fieldops/avatar/photo.webp#x",
])("rejects untrusted image delivery sources", (value) => {
  expect(imageUrlSchema.safeParse(value).success).toBe(false)
})
it("accepts a versioned image inside the FieldOps namespace", () => {
  expect(
    imageUrlSchema.safeParse(
      "https://res.cloudinary.com/demo/image/upload/v1/fieldops/avatar/photo.webp"
    ).success
  ).toBe(true)
})
