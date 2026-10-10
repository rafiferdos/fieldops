"use client"
import { useEffect, useId, useState } from "react"
import Image from "next/image"
import { ImagePlus } from "lucide-react"
import { uploadImage } from "@/infrastructure/media/browser"
import { imageFileError, type ImagePurpose } from "@/shared/lib/image-policy"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Progress } from "@/shared/ui/progress"
import { FormMessage } from "./form-message"
import { cn } from "@/shared/lib/utils"

export function ImageUpload({
  value,
  onChange,
  onBusy,
  purpose,
  label,
}: {
  value: string | null
  onChange: (value: string | null) => void
  onBusy: (busy: boolean) => void
  purpose: ImagePurpose
  label: string
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string>()
  const [preview, setPreview] = useState<string | null>(null)
  const [failedSource, setFailedSource] = useState<string>()
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview]
  )
  async function upload(file: File) {
    const error = imageFileError(file)
    if (error) {
      setMessage(error)
      return
    }
    setMessage(undefined)
    setPreview(URL.createObjectURL(file))
    setBusy(true)
    onBusy(true)
    setProgress(0)
    try {
      onChange(await uploadImage(file, purpose, setProgress))
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Image upload is unavailable."
      )
    } finally {
      setPreview(null)
      setBusy(false)
      onBusy(false)
    }
  }
  const source = preview ?? value
  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "relative overflow-hidden border bg-muted/40",
          purpose === "AVATAR" ? "size-28 rounded-full" : "h-40 rounded-xl"
        )}
      >
        {source && source !== failedSource ? (
          <Image
            src={source}
            alt={`${label} preview`}
            fill
            sizes={
              purpose === "AVATAR" ? "112px" : "(max-width: 640px) 90vw, 480px"
            }
            className="object-cover"
            unoptimized={!!preview}
            onError={() => setFailedSource(source)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImagePlus aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        aria-describedby={`${id}-help ${id}-error`}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          event.currentTarget.value = ""
          if (file) void upload(file)
        }}
      />
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        JPEG, PNG or WebP, up to 3 MB. Save the form to apply your image.
      </p>
      {busy && (
        <div role="status" className="space-y-2 text-sm text-muted-foreground">
          <Progress value={progress} aria-label="Image upload progress" />
          <p>
            {progress >= 95
              ? "Processing your image…"
              : `Uploading… ${progress}%`}
          </p>
        </div>
      )}
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => {
            onChange(null)
            setMessage(undefined)
          }}
        >
          Remove image
        </Button>
      )}
      <FormMessage id={`${id}-error`} message={message} />
    </div>
  )
}
