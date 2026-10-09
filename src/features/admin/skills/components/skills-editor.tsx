"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { inspectSkills } from "../actions"
import type { TechnicianSkills, SkillOption } from "../schemas"
import { SkillsForm } from "./skills-form"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { FormMessage } from "@/shared/components/form-message"
import { toast } from "@/shared/ui/toast"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"

type Editor = {
  skills: TechnicianSkills
  options: SkillOption[]
  pages: number
}

export function SkillsEditor({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState<Editor | null>(null),
    [message, setMessage] = useState<string>(),
    [loading, startTransition] = useTransition()
  function inspect() {
    setEditor(null)
    setMessage(undefined)
    startTransition(async () => {
      try {
        const result = await inspectSkills(id)
        if (result.ok)
          setEditor({
            skills: result.data.skills,
            options: result.data.catalog.items.map(({ id, name }) => ({
              id,
              name,
              active: true,
            })),
            pages: result.data.catalog.pagination.totalPages,
          })
        else {
          setMessage(result.message)
          toast.add({ type: "error", title: result.message })
        }
      } catch {
        setMessage(
          "Current skills could not be read. Inspect again before editing."
        )
      }
    })
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (busy || loading) return
        setOpen(next)
        // Every opening is a fresh read; unknown skills are never presented as an empty selection.
        if (next) inspect()
      }}
    >
      <SheetTrigger render={<Button variant="outline" />}>
        Manage skills
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Technician skills</SheetTitle>
          <SheetDescription>
            {name} · Choose services this technician is qualified to perform.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          {loading && (
            <div
              role="status"
              aria-label="Reading current skills"
              className="space-y-3"
            >
              <Skeleton className="h-8" />
              <Skeleton className="h-24" />
            </div>
          )}
          <FormMessage message={message} />
          {!loading && !editor && (
            <Button variant="outline" onClick={inspect}>
              Inspect current skills
            </Button>
          )}
          {editor && (
            <SkillsForm
              snapshot={editor.skills}
              initialOptions={editor.options}
              pages={editor.pages}
              onBusy={setBusy}
              onInspect={inspect}
              onSaved={() => {
                setOpen(false)
                router.refresh()
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
