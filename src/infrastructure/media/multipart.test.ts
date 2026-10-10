import { expect, it, vi } from "vitest"
import { readImageMultipart } from "./multipart"
import { MAX_IMAGE_BYTES } from "@/shared/lib/image-policy"
vi.mock("server-only", () => ({}))

it("reads a bounded real multipart image body", async () => {
  const body = new FormData()
  body.set("purpose", "AVATAR")
  body.set("file", new File(["image"], "photo.png", { type: "image/png" }))
  const form = await readImageMultipart(
    new Request("http://localhost:3001/api/media/images", {
      method: "POST",
      body,
    })
  )
  expect(form.get("purpose")).toBe("AVATAR")
  expect(form.get("file")).toBeInstanceOf(File)
})
it("rejects excessive bytes despite an inaccurate content-length", async () => {
  const request = new Request("http://localhost:3001/api/media/images", {
    method: "POST",
    body: new Uint8Array(MAX_IMAGE_BYTES + 65537),
    headers: {
      "Content-Type": "multipart/form-data; boundary=test",
      "Content-Length": "1",
    },
  })
  await expect(readImageMultipart(request)).rejects.toThrow("Upload exceeds")
})
