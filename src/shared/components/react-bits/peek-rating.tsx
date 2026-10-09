"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { Star } from "lucide-react"
import { Button } from "@/shared/ui/button"
import styles from "./peek-rating.module.css"

interface PeekRatingProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  disabled?: boolean
  ariaLabel?: string
  invalid?: boolean
  describedBy?: string
  focusRef?: (node: HTMLButtonElement | null) => void
}
const labels = ["Very poor", "Poor", "Fair", "Good", "Excellent"] as const

// React Bits' lift/preview interaction keeps the backend's fixed 1–5 rating policy.
export function PeekRating({
  value,
  onChange,
  onBlur,
  disabled = false,
  ariaLabel = "Rating",
  invalid = false,
  describedBy,
  focusRef,
}: PeekRatingProps) {
  const [preview, setPreview] = useState<number>()
  const row = useRef<HTMLDivElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const gesture = useRef<number | undefined>(undefined)
  useEffect(() => {
    const reset = () => {
      gesture.current = undefined
      setPreview(undefined)
    }
    const visibility = () => {
      if (document.hidden) reset()
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    window.addEventListener("blur", reset)
    document.addEventListener("visibilitychange", visibility)
    motion.addEventListener("change", reset)
    return () => {
      window.removeEventListener("blur", reset)
      document.removeEventListener("visibilitychange", visibility)
      motion.removeEventListener("change", reset)
    }
  }, [])
  const at = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = row.current?.getBoundingClientRect()
    if (
      !bounds ||
      event.clientY < bounds.top - 12 ||
      event.clientY > bounds.bottom + 12
    )
      return undefined
    return Math.max(
      1,
      Math.min(
        5,
        Math.floor(((event.clientX - bounds.left) / bounds.width) * 5) + 1
      )
    )
  }
  const commit = (next: number) => {
    if (disabled) return
    setPreview(undefined)
    onChange(next)
    const glyph = buttons.current[next - 1]?.querySelector("svg")
    if (
      glyph &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      glyph.getAnimations().forEach((animation) => animation.cancel())
      glyph.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.3)", offset: 0.35 },
          { transform: "scale(1)" },
        ],
        { duration: 300, easing: "cubic-bezier(.23,1,.32,1)" }
      )
    }
  }
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      className={styles.rating}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.()
      }}
    >
      <div
        ref={row}
        className={styles.row}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0 || !event.isPrimary) return
          gesture.current = event.pointerId
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            gesture.current = undefined
            return
          }
          setPreview(at(event))
        }}
        onPointerMove={(event) => {
          if (
            !disabled &&
            (event.pointerType === "mouse" ||
              gesture.current === event.pointerId)
          )
            setPreview(at(event))
        }}
        onPointerUp={(event) => {
          if (gesture.current !== event.pointerId) return
          gesture.current = undefined
          const next = at(event)
          if (next) commit(next)
        }}
        onPointerCancel={() => {
          gesture.current = undefined
          setPreview(undefined)
        }}
        onLostPointerCapture={() => {
          gesture.current = undefined
          setPreview(undefined)
        }}
        onPointerLeave={() => {
          if (gesture.current === undefined) setPreview(undefined)
        }}
      >
        <span
          aria-hidden="true"
          className={styles.tip}
          data-show={!disabled && preview !== undefined}
          style={{
            transform: `translate(calc(${((preview ?? 1) - 0.5) * 44}px - 50%), 0)`,
          }}
        >
          {preview ? labels[preview - 1] : ""}
        </span>
        {labels.map((label, index) => {
          const rating = index + 1
          return (
            <Button
              key={label}
              ref={(node) => {
                buttons.current[index] = node
                if (value === rating) focusRef?.(node)
              }}
              type="button"
              variant="ghost"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${rating} of 5, ${label}`}
              tabIndex={value === rating ? 0 : -1}
              disabled={disabled}
              className={styles.star}
              onClick={(event) => {
                if (event.detail === 0) commit(rating)
              }}
              onKeyDown={(event) => {
                let next: number | undefined
                if (event.key === "ArrowRight" || event.key === "ArrowUp")
                  next = Math.min(5, value + 1)
                if (event.key === "ArrowLeft" || event.key === "ArrowDown")
                  next = Math.max(1, value - 1)
                if (event.key === "Home") next = 1
                if (event.key === "End") next = 5
                if (next) {
                  event.preventDefault()
                  commit(next)
                  buttons.current[next - 1]?.focus()
                }
              }}
            >
              <span
                className={styles.glyph}
                data-lit={rating <= (!disabled ? (preview ?? value) : value)}
                data-lift={
                  !disabled && preview !== undefined && rating <= preview
                }
                data-magnify={!disabled && rating === preview}
              >
                <Star aria-hidden="true" />
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
