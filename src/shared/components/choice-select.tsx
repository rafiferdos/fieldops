"use client"

import type { Ref } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { cn } from "@/shared/lib/utils"

interface ChoiceOption {
  value: string
  label: string
}

type ChoiceSelectProps = {
  id: string
  name?: string
  options: readonly ChoiceOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string | undefined
  onBlur?: () => void
  ref?: Ref<HTMLButtonElement>
  className?: string
} & (
  | {
      value: string
      onValueChange: (value: string) => void
      defaultValue?: never
    }
  | {
      defaultValue: string
      value?: never
      onValueChange?: (value: string) => void
    }
)

// One shadcn composition keeps GET filters and controlled form fields visually identical.
export function ChoiceSelect({
  id,
  name,
  options,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onBlur,
  ref,
  className,
  value,
  defaultValue,
  onValueChange,
}: ChoiceSelectProps) {
  const selection = value ?? defaultValue
  const selected =
    selection === "" && !options.some((item) => item.value === "")
      ? null
      : selection
  return (
    // Isolate Base UI's hidden input from the surrounding field's spacing rules.
    <div className="min-w-0">
      <Select<string>
        name={name}
        items={[...options]}
        disabled={disabled}
        {...(value === undefined
          ? { defaultValue: selected }
          : { value: selected })}
        onValueChange={(next) => {
          if (next !== null) onValueChange?.(next)
        }}
      >
        <SelectTrigger
          id={id}
          ref={ref}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn("w-full min-w-0", className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="min-h-10 [&>span:first-child]:min-w-0 [&>span:first-child]:shrink [&>span:first-child]:whitespace-normal"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
