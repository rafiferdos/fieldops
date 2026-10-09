import {
  CalendarCheck2,
  Check,
  ClipboardList,
  MapPin,
  Wrench,
} from "lucide-react"
import { Reveal } from "@/shared/components/reveal"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"

// This illustration explains the workflow; it never impersonates a live customer record.
export function ServiceJourney() {
  return (
    <div className="relative isolate mx-auto w-full max-w-lg py-6 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-primary/8"
      />
      <div
        aria-hidden="true"
        className="absolute inset-6 -z-10 rounded-full border border-primary/10 sm:inset-0"
      />
      <Reveal>
        <Card className="workflow-surface relative mx-2 border border-border/70 bg-(--workflow-surface) shadow-xl shadow-foreground/5 sm:mx-8">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-primary" />
                The service journey
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-brand-ink">
                <Wrench aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="font-heading text-xl font-medium">
                  A visit, with a clear plan.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From the first detail to the final report
                </p>
              </div>
            </div>
            <ol className="journey-steps relative space-y-6">
              {[
                {
                  icon: ClipboardList,
                  title: "Request reviewed",
                  detail: "The details are in the right hands.",
                  label: "01",
                },
                {
                  icon: CalendarCheck2,
                  title: "Visit coordinated",
                  detail: "A qualified technician. A confirmed time.",
                  label: "02",
                },
                {
                  icon: Check,
                  title: "Work documented",
                  detail: "Progress, completion and an invoice.",
                  label: "03",
                },
              ].map(({ icon: Icon, title, detail, label }) => (
                <li key={title} className="relative flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-card text-brand-ink">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                  <span className="pt-1 text-xs text-muted-foreground">
                    {label}
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              Your request. Your visit. One place to follow it.
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
