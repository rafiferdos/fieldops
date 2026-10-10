import "server-only"
import { MAX_IMAGE_BYTES } from "@/shared/lib/image-policy"

// Bound the actual stream, even when Content-Length is missing or deliberately incorrect.
export async function readImageMultipart(request: Request) {
  if (
    !request.body ||
    !request.headers.get("content-type")?.startsWith("multipart/form-data;")
  )
    throw new Error("A multipart image is required")
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.length
      if (length > MAX_IMAGE_BYTES + 65536) {
        await reader.cancel()
        throw new Error("Upload exceeds the image limit")
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return new Response(bytes, {
    headers: { "Content-Type": request.headers.get("content-type") ?? "" },
  }).formData()
}
