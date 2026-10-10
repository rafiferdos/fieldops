"use client"
import axios from "axios"
import { z } from "zod"
import {
  uploadedImageSchema,
  type ImagePurpose,
} from "@/shared/lib/image-policy"

export async function uploadImage(
  file: File,
  purpose: ImagePurpose,
  onProgress: (percent: number) => void
) {
  const body = new FormData()
  body.set("file", file)
  body.set("purpose", purpose)
  try {
    const response = await axios.post<unknown>("/api/media/images", body, {
      timeout: 35_000,
      onUploadProgress(event) {
        // Sending all bytes is not provider confirmation; reserve 100% for the verified response.
        if (event.total)
          onProgress(
            Math.min(95, Math.round((event.loaded / event.total) * 95))
          )
      },
    })
    const result = z
      .object({ ok: z.literal(true), data: uploadedImageSchema })
      .safeParse(response.data)
    if (!result.success)
      throw new Error("The upload returned an unexpected response.")
    onProgress(100)
    return result.data.data.url
  } catch (error) {
    if (axios.isAxiosError<unknown>(error)) {
      const parsed = z
        .object({ message: z.string().max(500) })
        .safeParse(error.response?.data)
      throw new Error(
        parsed.success
          ? parsed.data.message
          : "The upload could not be confirmed. Your saved image has not changed."
      )
    }
    throw error
  }
}
