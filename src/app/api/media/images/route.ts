import { NextResponse } from "next/server"
import { getViewer } from "@/features/auth/session"
import { getAuthEnv } from "@/infrastructure/env/auth"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { readImageMultipart } from "@/infrastructure/media/multipart"
import {
  imageFileError,
  imagePurposeSchema,
  uploadedImageSchema,
} from "@/shared/lib/image-policy"

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" }
const failure = (message: string, status: number) =>
  NextResponse.json({ ok: false, message }, { status, headers })

export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== getAuthEnv().APP_ORIGIN)
      return failure("Untrusted upload origin.", 403)
    const viewer = await getViewer()
    if (!viewer)
      return failure("Please sign in before uploading an image.", 401)
    let form: FormData
    try {
      form = await readImageMultipart(request)
    } catch {
      return failure("Choose one JPEG, PNG or WebP image up to 3 MB.", 400)
    }
    const file = form.get("file")
    const purpose = imagePurposeSchema.safeParse(form.get("purpose"))
    if (
      !purpose.success ||
      !(file instanceof File) ||
      [...form.keys()].some((key) => key !== "file" && key !== "purpose") ||
      form.getAll("file").length !== 1 ||
      form.getAll("purpose").length !== 1
    )
      return failure("Choose one image and its intended use.", 400)
    const error = imageFileError(file)
    if (error) return failure(error, 400)
    if (purpose.data === "SERVICE" && viewer.profile.role !== "ADMIN")
      return failure("Only administrators can upload service images.", 403)
    const body = new FormData()
    body.set("purpose", purpose.data)
    body.set("file", file, "image")
    const result = await apiRequest("/media/images", uploadedImageSchema, {
      method: "POST",
      accessToken: viewer.accessToken,
      body,
      signal: request.signal,
    })
    return NextResponse.json({ ok: true, data: result.data }, { headers })
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status !== null &&
      [400, 401, 403, 413, 429, 503].includes(error.status)
    )
      return failure(
        error.status === 503
          ? "Image upload is temporarily unavailable."
          : error.message,
        error.status
      )
    return failure(
      "The upload could not be confirmed. Your saved image has not changed.",
      502
    )
  }
}
