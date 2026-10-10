"use client"

import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import "./hold-button.css"

interface HoldButtonProps {
  children: ReactNode
  ariaLabel: string
  onHold: () => void
  disabled?: boolean
  holdTime?: number
  className?: string
}

// Adapted from React Bits HoldButton: one continuous gesture owns completion.
export function HoldButton({
  children,
  ariaLabel,
  onHold,
  disabled = false,
  holdTime = 2000,
  className,
}: HoldButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const hint = useId()
  // A new parent callback must not restart an already established continuous hold.
  const complete = useEffectEvent(onHold)
  useEffect(() => {
    const button = ref.current
    if (!button || disabled) return
    let frame = 0
    let start = 0
    let input: "pointer" | "key" | undefined
    let pointer: number | undefined
    let completed = false
    let progress = 0
    const release = () => {
      const from = progress
      const began = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - began) / 200)
        progress = from * Math.pow(1 - t, 3)
        button.style.setProperty("--hb-p", String(progress))
        if (t < 1) frame = requestAnimationFrame(step)
        else frame = 0
      }
      frame = requestAnimationFrame(step)
    }
    const cancel = () => {
      cancelAnimationFrame(frame)
      frame = 0
      input = undefined
      pointer = undefined
      button.dataset.phase = "idle"
      release()
    }
    const tick = (now: number) => {
      if (!input || document.hidden || !document.hasFocus()) return cancel()
      progress = Math.min(1, (now - start) / holdTime)
      button.style.setProperty("--hb-p", String(progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else {
        // Mark completion before calling out: release/repeated input cannot replay sign-out.
        completed = true
        input = undefined
        button.dataset.phase = "done"
        complete()
      }
    }
    const begin = (kind: "pointer" | "key") => {
      if (input || completed) return false
      cancelAnimationFrame(frame)
      progress = 0
      input = kind
      button.dataset.input = kind
      start = performance.now()
      button.dataset.phase = "holding"
      frame = requestAnimationFrame(tick)
      return true
    }
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary || !begin("pointer")) return
      pointer = event.pointerId
      try {
        button.setPointerCapture(event.pointerId)
      } catch {
        // Without capture a continuous press cannot be established safely.
        cancel()
      }
    }
    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return
      const bounds = button.getBoundingClientRect()
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        cancel()
    }
    const up = (event: PointerEvent) => {
      if (pointer === event.pointerId) cancel()
    }
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== " " && event.key !== "Enter") return
      event.preventDefault()
      if (!event.repeat) begin("key")
    }
    const keyUp = (event: KeyboardEvent) => {
      if (input === "key" && (event.key === " " || event.key === "Enter")) {
        event.preventDefault()
        cancel()
      }
    }
    const visibility = () => {
      if (document.hidden) cancel()
    }
    const click = (event: MouseEvent) => event.preventDefault()
    button.dataset.phase = "idle"
    button.style.setProperty("--hb-p", "0")
    const measure = () => {
      button.style.setProperty("--hb-w", `${button.offsetWidth}px`)
      button.style.setProperty("--hb-h", `${button.offsetHeight}px`)
    }
    const size = new ResizeObserver(measure)
    size.observe(button)
    measure()
    button.addEventListener("pointerdown", down)
    button.addEventListener("pointermove", move)
    button.addEventListener("pointerup", up)
    button.addEventListener("pointercancel", up)
    button.addEventListener("lostpointercapture", up)
    button.addEventListener("keydown", keyDown)
    button.addEventListener("keyup", keyUp)
    button.addEventListener("blur", cancel)
    button.addEventListener("click", click)
    window.addEventListener("blur", cancel)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(frame)
      size.disconnect()
      button.removeEventListener("pointerdown", down)
      button.removeEventListener("pointermove", move)
      button.removeEventListener("pointerup", up)
      button.removeEventListener("pointercancel", up)
      button.removeEventListener("lostpointercapture", up)
      button.removeEventListener("keydown", keyDown)
      button.removeEventListener("keyup", keyUp)
      button.removeEventListener("blur", cancel)
      button.removeEventListener("click", click)
      window.removeEventListener("blur", cancel)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [disabled, holdTime])
  const labels = (
    <>
      <span className="hold-button__idle">{children}</span>
      <span className="hold-button__done" aria-hidden="true">
        Signing out…
      </span>
    </>
  )
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={hint}
      data-direction="right"
      data-glow="true"
      className={cn("hold-button hold-button--md", className)}
      style={{
        "--hb-bg": "var(--secondary)",
        "--hb-fill": "var(--primary)",
        "--hb-text": "var(--secondary-foreground)",
        "--hb-fill-text": "var(--primary-foreground)",
        "--hb-hold": `${holdTime}ms`,
        "--hb-cycles": holdTime / 1100,
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span className="hold-button__pulse" aria-hidden="true" />
      <span className="hold-button__label">{labels}</span>
      <span className="hold-button__clip" aria-hidden="true">
        <span className="hold-button__fill">
          <span className="hold-button__label hold-button__label--fill">
            {labels}
          </span>
        </span>
        <span className="hold-button__crest">
          <span className="hold-button__label hold-button__label--fill">
            {labels}
          </span>
        </span>
      </span>
      <span id={hint} className="hold-button__sr">
        Press and hold with your pointer, Space or Enter for {holdTime / 1000}{" "}
        seconds to confirm. Releasing cancels.
      </span>
    </button>
  )
}
