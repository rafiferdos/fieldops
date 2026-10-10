import Link from "next/link"
import type { CSSProperties } from "react"
import {
  ArrowUpRight,
  CalendarCheck2,
  Check,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FileText,
  Wrench,
} from "lucide-react"

import { Reveal } from "@/shared/components/reveal"
import {
  ScrollStack,
  ScrollStackItem,
} from "@/shared/components/react-bits/scroll-stack"
import { ScrollWords } from "./scroll-words"
import { SpotlightCard } from "./spotlight-card"
import styles from "./process-section.module.css"

const stages = [
  {
    number: "01",
    kind: "request",
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
    kind: "coordinate",
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
    kind: "resolve",
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

type StageKind = (typeof stages)[number]["kind"]

const weekdays = ["MON", "TUE", "WED", "THU", "FRI"] as const

function StagePreview({ kind }: { kind: StageKind }) {
  const chapter =
    kind === "request" ? "01" : kind === "coordinate" ? "02" : "03"

  return (
    <div className={styles.preview} aria-hidden="true">
      <div className={styles.previewTop}>
        <span className={styles.previewLabel}>
          <span className={styles.previewDot} />A closer look
        </span>
        <span className={styles.previewCaption}>ILLUSTRATIVE / {chapter}</span>
      </div>

      <div className={styles.previewCanvas}>
        {kind === "request" && (
          <div className={`${styles.mockSheet} ${styles.formPreview}`}>
            <div className={styles.formHeader}>
              <span className={styles.formIcon}>
                <Wrench size={17} strokeWidth={1.8} />
              </span>

              <div className={styles.formHeaderText}>
                <strong>Service request</strong>
                <span>Everything in one place</span>
              </div>

              <ChevronRight
                size={17}
                className={styles.mockArrow}
                strokeWidth={1.7}
              />
            </div>

            <div className={styles.formFields}>
              <div className={styles.mockField}>
                <span className={styles.fieldLabel}>WHAT NEEDS ATTENTION</span>

                <div className={styles.fieldLines}>
                  <span />
                  <span className={styles.shortLine} />
                </div>
              </div>

              <div className={styles.mockField}>
                <span className={styles.fieldLabel}>PREFERRED VISIT</span>

                <div className={styles.timePill}>
                  <CalendarCheck2 size={13} strokeWidth={1.7} />
                  Choose a time
                </div>
              </div>
            </div>
          </div>
        )}

        {kind === "coordinate" && (
          <div className={`${styles.mockSheet} ${styles.calendarPreview}`}>
            <div className={styles.calendarHeader}>
              <div className={styles.calendarTitle}>
                <CalendarCheck2 size={17} strokeWidth={1.8} />
                <strong>Visit planning</strong>
              </div>

              <span className={styles.calendarBadge}>SCHEDULE</span>
            </div>

            <div className={styles.days}>
              {weekdays.map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className={`${styles.day} ${
                    index === 3 ? styles.dayActive : ""
                  }`}
                >
                  <span className={styles.dayName}>{day}</span>
                  <span className={styles.dayMark}>
                    {index === 3 ? (
                      <Check size={14} strokeWidth={2.2} />
                    ) : (
                      <span className={styles.dayLine} />
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.matchRow}>
              <span className={styles.matchIcon}>
                <Check size={13} strokeWidth={2.2} />
              </span>

              <div className={styles.matchText}>
                <strong>Qualified technician</strong>
                <span>Availability considered</span>
              </div>

              <span className={styles.matchDetail}>MATCH</span>
            </div>
          </div>
        )}

        {kind === "resolve" && (
          <div className={`${styles.mockSheet} ${styles.reportPreview}`}>
            <div className={styles.reportHeader}>
              <span className={styles.reportIcon}>
                <FileCheck2 size={18} strokeWidth={1.7} />
              </span>

              <div className={styles.reportHeaderText}>
                <strong>Service record</strong>
                <span>The details stay together</span>
              </div>

              <span className={styles.reportNumber}>03</span>
            </div>

            <div className={styles.reportRows}>
              <div className={styles.reportRow}>
                <span>Visit notes</span>
                <span className={styles.reportRowLine} />
              </div>
              <div className={styles.reportRow}>
                <span>Work summary</span>
                <span className={styles.reportRowLine} />
              </div>
            </div>

            <div className={styles.reportFooter}>
              <div className={styles.reportChip}>
                <FileCheck2 size={14} strokeWidth={1.8} />
                Report
              </div>

              <div className={styles.reportChip}>
                <FileText size={14} strokeWidth={1.8} />
                Invoice
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.previewBottom}>
        <span>ONE CONNECTED JOURNEY</span>
        <span className={styles.previewBottomRule} />
        <span>{chapter} / 03</span>
      </div>
    </div>
  )
}

// Describes the actual service workflow.
// The small interface drawings are illustrative, not live job records.
export function ProcessSection() {
  return (
    <section
      aria-labelledby="process-title"
      data-process-section=""
      className={styles.section}
    >
      <Reveal className={styles.story}>
        <div className={styles.overline}>
          <span className={styles.overlineMark} />
          <span>From request to resolution</span>
          <span className={styles.overlineIndex}>/ 01—03</span>
        </div>

        <h2 id="process-title" className={styles.heading}>
          <ScrollWords>A little structure.</ScrollWords>
          <br />
          <span className={styles.headingAccent}>
            <ScrollWords>A lot less guesswork.</ScrollWords>
          </span>
        </h2>

        <p className={styles.description}>
          Every visit has a next step. From the first detail to the final
          report, the whole story stays connected.
        </p>

        <div className={styles.storyDivider} aria-hidden="true">
          <span />
        </div>

        <p className={styles.journeyLabel}>THREE MOMENTS THAT MATTER</p>

        <ol aria-label="Service process" className={styles.journey}>
          {stages.map((stage) => (
            <li
              key={stage.number}
              className={styles.milestone}
              style={
                {
                  "--process-accent": stage.accent,
                } satisfies CSSProperties
              }
            >
              <span className={styles.milestoneNumber}>{stage.number}</span>

              <div className={styles.milestoneText}>
                <strong className={styles.milestoneTitle}>
                  {stage.summary}
                </strong>
                <span className={styles.milestoneSubtitle}>{stage.phase}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.storyFooter}>
          <span className={styles.storyFooterLabel}>
            Clear from the beginning.
            <br />
            Connected to the end.
          </span>

          <Link href="/about" className={styles.storyLink}>
            Explore the process
            <span className={styles.storyLinkIcon}>
              <ArrowUpRight aria-hidden="true" size={18} />
            </span>
          </Link>
        </div>
      </Reveal>

      <div className={styles.deck}>
        <div className={styles.deckHeading} aria-hidden="true">
          <span>THE JOURNEY, UP CLOSE</span>
          <span className={styles.deckRule} />
          <span>03 CHAPTERS</span>
        </div>

        <ScrollStack>
          {stages.map((stage) => {
            const Icon = stage.icon

            return (
              <ScrollStackItem key={stage.number}>
                <SpotlightCard
                  className={`${styles.card} process-card gap-0 overflow-hidden border p-0 shadow-none ring-0`}
                  data-process-step={stage.number}
                  style={
                    {
                      "--process-accent": stage.accent,
                    } satisfies CSSProperties
                  }
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardTopline}>
                      <span className={styles.stagePill}>
                        <span className={styles.stageDot} />
                        {stage.phase}
                      </span>

                      <span
                        className={styles.cardIndex}
                        aria-label={`Step ${stage.number} of 3`}
                      >
                        {stage.number}
                        <span className={styles.cardIndexTotal}> / 03</span>
                      </span>
                    </div>

                    <div className={styles.titleRow}>
                      <span className={styles.stepIcon}>
                        <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
                      </span>

                      <h3 className={styles.cardTitle}>{stage.title}</h3>
                    </div>

                    <p className={styles.cardDescription}>{stage.text}</p>
                  </div>

                  <StagePreview kind={stage.kind} />

                  <div className={styles.cardFooter}>
                    <div className={styles.outcomeGroup}>
                      <span className={styles.footerLabel}>
                        WHAT STAYS WITH THE JOB
                      </span>

                      <strong className={styles.footerValue}>
                        {stage.outcome}
                      </strong>
                    </div>

                    <span className={styles.roleBadge}>{stage.role}</span>
                  </div>
                </SpotlightCard>
              </ScrollStackItem>
            )
          })}
        </ScrollStack>
      </div>
    </section>
  )
}
