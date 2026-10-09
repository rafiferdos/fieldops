"use client"

import { useEffect, type ReactNode } from "react"
import { RefreshCw, Plus, ClipboardList } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { toast } from "@/shared/ui/toast"
import { ButtonLink } from "@/shared/components/button-link"
import { PageHeading } from "@/shared/components/page-heading"
import { StatCard } from "@/shared/components/stat-card"
import { Reveal } from "@/shared/components/reveal"
import { EmptyState } from "@/shared/components/empty-state"
import { FormMessage } from "@/shared/components/form-message"
import { formatDate } from "@/shared/lib/format"
import { ApiError } from "@/infrastructure/api/error"
import type { Profile } from "@/features/auth/schemas"
import { dashboardMetrics } from "../metrics"
import { useDashboard } from "../hooks/use-dashboard"
import type { DashboardFilters } from "../schemas"
import { StatusChart } from "./status-chart"
import { RecentRecords } from "./recent-records"

export function DashboardView({
  profile,
  filters,
  children,
  initialFailure,
}: {
  profile: Profile
  filters: DashboardFilters
  children?: ReactNode
  initialFailure?: string | undefined
}) {
  const { data, error, isFetching, refetch } = useDashboard(
    profile.id,
    profile.role,
    filters
  )
  useEffect(() => {
    if (error) toast.add({ type: "error", title: error.message })
  }, [error])
  const accessEnded =
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  if (accessEnded)
    return (
      <EmptyState title="Your session needs attention">
        <p>{error.message}</p>
        <ButtonLink href="/login">Sign in again</ButtonLink>
      </EmptyState>
    )
  if (!data)
    return (
      <EmptyState title="Live data is unavailable">
        <FormMessage message={error?.message ?? initialFailure} />
        <Button
          onClick={() => {
            void refetch()
          }}
          disabled={isFetching}
        >
          Try again
        </Button>
      </EmptyState>
    )
  const title =
    profile.role === "ADMIN"
      ? "Operations overview"
      : profile.role === "TECHNICIAN"
        ? "Your field dashboard"
        : "Your service dashboard"
  return (
    <>
      <PageHeading
        eyebrow={`Welcome back, ${profile.name}`}
        title={title}
        description={
          profile.role === "ADMIN"
            ? "Service demand, dispatch progress and verified revenue. All from your live operations."
            : profile.role === "TECHNICIAN"
              ? "A clear view of your assigned visits, current work and completion history."
              : "Your requests, confirmed visits and service history, together in one place."
        }
        action={
          profile.role === "CUSTOMER" ? (
            <ButtonLink href="/customer/requests/new">
              <Plus aria-hidden="true" />
              New request
            </ButtonLink>
          ) : profile.role === "ADMIN" ? (
            <ButtonLink href="/admin/requests?status=PENDING">
              <ClipboardList aria-hidden="true" />
              Review requests
            </ButtonLink>
          ) : undefined
        }
      />
      {children}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" role="status">
          {isFetching
            ? "Refreshing live records…"
            : `Updated ${formatDate(data.capturedAt)}`}
        </p>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {error ? "Last successful update" : "Live records"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch()
            }}
            disabled={isFetching}
          >
            <RefreshCw
              aria-hidden="true"
              className={isFetching ? "motion-safe:animate-spin" : undefined}
            />
            Refresh dashboard
          </Button>
        </div>
      </div>
      {error && (
        <div className="mb-6">
          <FormMessage message="Refresh failed. The last successful values remain below; try Refresh dashboard again." />
        </div>
      )}
      {data.role === "ADMIN" && (
        <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
          Period: {formatDate(data.overview.period.from)} up to{" "}
          {formatDate(data.overview.period.to)} (exclusive). Period
          requests/work use creation time; revenue uses paid time. Queue and
          technician counts are current.
        </p>
      )}
      <Reveal stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics(data).map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </Reveal>
      <Reveal stagger className="my-6 grid gap-6 xl:grid-cols-2">
        {data.role !== "TECHNICIAN" && (
          <StatusChart
            title="Request distribution"
            emptyTitle={
              data.role === "ADMIN"
                ? "No requests in this period"
                : "No requests yet"
            }
            description={
              data.role === "ADMIN"
                ? "Requests created in the selected period."
                : "All requests submitted by your account."
            }
            counts={
              data.role === "ADMIN"
                ? data.overview.requests.byStatus
                : data.requests.byStatus
            }
          />
        )}
        <StatusChart
          title="Visit distribution"
          description={
            data.role === "TECHNICIAN"
              ? "All visits assigned to your account."
              : "Current work statuses across all accessible visits."
          }
          counts={data.work.byStatus}
        />
      </Reveal>
      <RecentRecords data={data} />
    </>
  )
}
