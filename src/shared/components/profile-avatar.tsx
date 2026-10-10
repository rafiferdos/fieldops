"use client"
import { useState } from "react"
import Image from "next/image"
import { Avatar } from "@/shared/ui/avatar"

// Missing or failed public photos retain the account's own initials.
export function ProfileAvatar({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) {
  const [failedSource, setFailedSource] = useState<string>()
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  return (
    <Avatar size="lg" className="overflow-hidden bg-primary/15 text-brand-ink">
      {avatarUrl && avatarUrl !== failedSource ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setFailedSource(avatarUrl)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-full items-center justify-center font-medium"
        >
          {initials}
        </span>
      )}
    </Avatar>
  )
}
