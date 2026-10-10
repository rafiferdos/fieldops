import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
} from "lucide-react"
import { Reveal } from "@/shared/components/reveal"
import {
  ScrollStack,
  ScrollStackItem,
} from "@/shared/components/react-bits/scroll-stack"
import { Badge } from "@/shared/ui/badge"
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { ScrollWords } from "./scroll-words"
import { SpotlightCard } from "./spotlight-card"
import styles from "./process-section.module.css"

const stages = [
  {
    number: "01",
    phase: "Request",
    summary: "One clear request",
    title: "Start with what you need.",
    text: "Choose a service, describe the issue and share your preferred time. The guided request keeps the important details together.",
    role: "Customer",
    outcome: "Issue, address and preferred time",
    icon: ClipboardList,
    accent: "var(--brand-ink)",
  },
  {
    number: "02",
    phase: "Coordinate",
    summary: "A coordinated visit",
    title: "Leave room for a real plan.",
    text: "An administrator reviews your request and assigns a qualified, available technician. Your work order shows the confirmed schedule.",
    role: "Administrator",
    outcome: "A technician and a confirmed visit window",
    icon: CalendarCheck2,
    accent: "var(--info-foreground)",
  },
  {
    number: "03",
    phase: "Resolve",
    summary: "A documented result",
    title: "See the work through.",
    text: "Follow the visit as it progresses. When work is completed, the technician's report and your invoice stay with the work order.",
    role: "Technician",
    outcome: "Completion report and invoice",
    icon: FileCheck2,
    accent: "var(--warning-foreground)",
  },
] as const

// This is a process guide; no decorative stage is presented as a live job status.
export function ProcessSection() {
  return (
    <section
      aria-labelledby="process-title"
      className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
      data-process-section=""
    >
      <Reveal className="lg:sticky lg:top-32">
        <p className="eyebrow">From request to resolution</p>
        <h2
          id="process-title"
          className="mt-4 font-heading text-4xl leading-[1.08] font-medium tracking-[-0.04em] sm:text-5xl"
        >
          <ScrollWords>A little structure.</ScrollWords>
          <br />
          <ScrollWords>A lot less guesswork.</ScrollWords>
        </h2>
        <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
          Every visit has a next step. From the first detail to the final
          report, the whole story stays connected.
        </p>
        <ol
          aria-label="Service process"
          className={`${styles.journey} mt-9 sm:space-y-5`}
        >
          {stages.map(({ number, summary, phase, accent }) => (
            <li
              key={number}
              className="relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4"
              style={{ "--process-accent": accent }}
            >
              <Badge variant="outline" className={styles.number}>
                {number}
              </Badge>
              <div>
                <p className="hidden font-medium tracking-tight sm:block">
                  {summary}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{phase}</p>
              </div>
            </li>
          ))}
        </ol>
        <Separator className="mt-9 mb-6 max-w-md" />
        <Link href="/about" className="text-link">
          Get to know the process
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Reveal>
      <ScrollStack>
        {stages.map(
          ({
            number,
            phase,
            title,
            text,
            role,
            outcome,
            icon: Icon,
            accent,
          }) => (
            <ScrollStackItem key={number}>
              <SpotlightCard
                className={`${styles.card} process-card gap-0 overflow-hidden border shadow-none`}
                style={{ "--process-accent": accent }}
                data-process-step={number}
              >
                <CardHeader className="gap-6 pb-6 sm:px-8 sm:pt-8">
                  <div className="flex items-center justify-between gap-4">
                    <Badge variant="outline" className={styles.phase}>
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-current"
                      />
                      {phase}
                    </Badge>
                    <span
                      aria-label={`Step ${number}`}
                      className="font-mono text-xs tracking-wider text-muted-foreground"
                    >
                      {number} / 03
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <Badge
                      variant="outline"
                      className={`${styles.icon} [&_svg]:size-5!`}
                    >
                      <Icon aria-hidden="true" />
                    </Badge>
                    <CardTitle className="max-w-sm text-2xl leading-snug tracking-tight sm:text-3xl">
                      {title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="max-w-lg pb-8 leading-relaxed text-muted-foreground sm:px-8">
                  {text}
                </CardContent>
                <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 pt-5 sm:px-8">
                  <div>
                    <p className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      What stays with the job
                    </p>
                    <p className="text-xs font-medium sm:text-sm">{outcome}</p>
                  </div>
                  <Badge variant="secondary">{role}</Badge>
                </CardFooter>
              </SpotlightCard>
            </ScrollStackItem>
          )
        )}
      </ScrollStack>
    </section>
  )
}
