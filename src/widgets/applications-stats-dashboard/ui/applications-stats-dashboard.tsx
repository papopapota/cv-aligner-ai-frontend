"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import {
  getApplicationsStatusStats,
  useApplicationsQuery,
  type ApplicationsStatusStats,
} from "@/entities/application"
import { ApiError } from "@/shared/api/query-client"
import { Card, PageHeader, buttonVariants } from "@/shared/ui"

const MIN_APPLICATIONS_FOR_STATS = 6

function formatPercentage(value: number): string {
  return Number.isInteger(value)
    ? `${value}%`
    : `${value.toFixed(1).replace(".", ",")}%`
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`
}

function buildRecommendations(stats: ApplicationsStatusStats): string[] {
  const pendingCount =
    stats.byStatus.find((item) => item.status === "pending")?.count ?? 0
  const underReviewCount =
    stats.byStatus.find((item) => item.status === "under-review")?.count ?? 0
  const acceptedCount =
    stats.byStatus.find((item) => item.status === "accepted")?.count ?? 0
  const rejectedCount =
    stats.byStatus.find((item) => item.status === "rejected")?.count ?? 0

  const summaryParts = [
    `${pendingCount} ${pluralize(pendingCount, "enviada", "enviadas")}`,
    `${underReviewCount} en revisión`,
    `${acceptedCount} ${pluralize(acceptedCount, "aceptada", "aceptadas")}`,
    `${rejectedCount} ${pluralize(rejectedCount, "rechazada", "rechazadas")}`,
  ]

  const recommendations = [
    `Has registrado ${stats.total} ${pluralize(stats.total, "postulación", "postulaciones")}: ${joinWithAnd(summaryParts)}.`,
  ]

  if (pendingCount > 0) {
    recommendations.push(
      `Haz seguimiento de ${pendingCount} ${pluralize(pendingCount, "postulación enviada", "postulaciones enviadas")} para confirmar que fueron recibidas.`
    )
  }

  if (underReviewCount > 0) {
    recommendations.push(
      `${underReviewCount} ${pluralize(underReviewCount, "postulación está", "postulaciones están")} en revisión; prepara ejemplos para posibles entrevistas.`
    )
  }

  if (acceptedCount > 0) {
    recommendations.push(
      `${acceptedCount} ${pluralize(acceptedCount, "postulación fue aceptada", "postulaciones fueron aceptadas")}; prioriza los siguientes pasos del proceso.`
    )
  }

  if (rejectedCount > 0) {
    recommendations.push(
      `${rejectedCount} ${pluralize(rejectedCount, "postulación fue rechazada", "postulaciones fueron rechazadas")}; revisa el enfoque de tu CV y ajusta tu estrategia.`
    )
  }

  return recommendations.slice(0, 3)
}

function KpiCard({ value, label }: { value: number; label: string }) {
  return (
    <Card className="h-[104px] items-start gap-1 bg-canvas px-4 py-4">
      <p className="text-[37.904px] leading-[1.4] text-ink">{value}</p>
      <p className="text-base text-ink">{label}</p>
    </Card>
  )
}

function StatusDistributionChart({
  stats,
}: {
  stats: ApplicationsStatusStats
}) {
  return (
    <Card className="min-h-[368px] gap-3 bg-canvas p-6">
      <div className="flex h-11 items-center justify-between gap-4 whitespace-nowrap">
        <h2 className="text-[21.328px] leading-[1.4] text-ink">
          Postulaciones por estado
        </h2>
        <p className="text-xs text-ink">Porcentaje sobre el total</p>
      </div>

      <div className="flex flex-col">
        {stats.byStatus.map((item) => (
          <div key={item.status}>
            <div className="flex flex-col gap-2 sm:h-10 sm:flex-row sm:items-center sm:gap-6">
              <p className="shrink-0 text-base text-ink sm:w-[220px]">
                {item.label} ({item.count})
              </p>
              <div className="flex h-10 flex-1 items-center">
                {item.count > 0 ? (
                  <div
                    role="img"
                    aria-label={`${item.label}: ${item.count} de ${stats.total}, ${formatPercentage(item.percentage)}`}
                    className="h-10 border border-primary bg-secondary"
                    style={{ width: `${item.percentage}%` }}
                  />
                ) : null}
              </div>
            </div>
            <div className="flex h-6 items-center sm:pl-[244px]">
              <p className="text-xs text-ink">
                {formatPercentage(item.percentage)} · {item.count} de{" "}
                {stats.total}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink">
        Las barras muestran la cantidad de postulaciones en cada estado; los
        porcentajes son respecto al total.
      </p>
    </Card>
  )
}

function RecommendationsCard({ stats }: { stats: ApplicationsStatusStats }) {
  const recommendations = buildRecommendations(stats)

  return (
    <Card className="gap-2 bg-canvas p-4">
      <h2 className="text-base leading-[1.4] text-ink">
        Recomendaciones según tus registros
      </h2>
      <ul className="flex flex-col gap-2">
        {recommendations.map((recommendation) => (
          <li key={recommendation} className="text-base leading-[1.4] text-ink">
            • {recommendation}
          </li>
        ))}
      </ul>
    </Card>
  )
}

// Alturas tomadas del nodo 33:393 de Figma (px sobre un máximo de 684px).
const BACKGROUND_BAR_HEIGHTS = [
  427.5, 584.25, 684, 513, 336, 511, 413, 609, 476, 672, 546, 385,
]
const BACKGROUND_BAR_MAX_HEIGHT = 684

function RestrictedStatsView({ total }: { total: number }) {
  const progress = Math.min(
    100,
    Math.round((total / MIN_APPLICATIONS_FOR_STATS) * 1000) / 10
  )

  return (
    <div
      role="region"
      aria-label="Vista restringida de estadísticas"
      className="relative flex min-h-[560px] w-full flex-1 items-center justify-center overflow-hidden bg-card sm:min-h-[748px]"
    >
      <div
        data-testid="restricted-background-bars"
        aria-hidden="true"
        className="absolute inset-6 flex items-end gap-1 border-b border-l border-line px-2 pt-4 sm:gap-2 sm:px-6 md:gap-4 lg:gap-8"
      >
        {BACKGROUND_BAR_HEIGHTS.map((height) => (
          <div
            key={height}
            className="flex-1 bg-secondary"
            style={{ height: `${(height / BACKGROUND_BAR_MAX_HEIGHT) * 100}%` }}
          />
        ))}
      </div>

      <div className="relative flex min-h-[280px] w-full max-w-[512px] flex-col items-center justify-center gap-4 border border-dashed border-line bg-canvas p-6 text-center">
        <h2 className="text-[21.328px] leading-[1.4] font-normal text-ink">
          Registra más postulaciones para ver tus estadísticas
        </h2>
        <p className="text-base leading-[1.4] text-ink">
          {`Requiere al menos ${MIN_APPLICATIONS_FOR_STATS} registros (Actual: ${total}/${MIN_APPLICATIONS_FOR_STATS})`}
        </p>

        <div className="flex w-full max-w-[400px] flex-col items-start gap-2">
          <div
            role="progressbar"
            aria-label="Progreso hacia el mínimo requerido"
            aria-valuemin={0}
            aria-valuemax={MIN_APPLICATIONS_FOR_STATS}
            aria-valuenow={Math.min(total, MIN_APPLICATIONS_FOR_STATS)}
            className="flex h-3 w-full items-start overflow-hidden border border-line bg-canvas"
          >
            <div
              className="h-3 shrink-0 bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="w-full text-center text-xs leading-[1.4] text-ink">
            {formatPercentage(progress)} del mínimo requerido
          </p>
        </div>

        <Link
          href="/applications"
          className={buttonVariants({ className: "h-11" })}
        >
          <Plus aria-hidden="true" />
          Agregar Postulación
        </Link>
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={index}
            className="h-[104px] items-start gap-2 bg-canvas px-4 py-4"
          >
            <div className="h-10 w-16 animate-pulse bg-secondary/40" />
            <div className="h-4 w-24 animate-pulse bg-secondary/40" />
          </Card>
        ))}
      </div>
      <Card className="min-h-[368px] gap-3 bg-canvas p-6">
        <div className="h-6 w-64 animate-pulse bg-secondary/40" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-10 w-full animate-pulse bg-secondary/40" />
              <div className="h-4 w-32 animate-pulse bg-secondary/40" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatsPageHeader() {
  return (
    <PageHeader
      className="border-0 pb-0"
      title="Estadísticas"
      description="Visualiza la distribución de tus postulaciones por estado"
      descriptionClassName="text-ink"
    />
  )
}

export function ApplicationsStatsDashboard() {
  const { data, isPending, isError, error } = useApplicationsQuery()
  const stats = getApplicationsStatusStats(data ?? [])

  if (isPending) {
    return (
      <div className="flex w-full flex-col gap-4 bg-card px-4 py-4 sm:px-20">
        <StatsPageHeader />
        <StatsSkeleton />
      </div>
    )
  }

  if (isError) {
    const message =
      error instanceof ApiError && error.status === 401
        ? "Inicia sesión para ver tus estadísticas."
        : error.message

    return (
      <div className="flex w-full flex-col gap-4 bg-card px-4 py-4 sm:px-20">
        <StatsPageHeader />
        <Card className="bg-canvas p-6">
          <p role="alert" className="text-destructive">
            {message}
          </p>
        </Card>
      </div>
    )
  }

  if (stats.total < MIN_APPLICATIONS_FOR_STATS) {
    return (
      <div className="flex w-full flex-col bg-canvas px-4 py-6 sm:px-20">
        <RestrictedStatsView total={stats.total} />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 bg-card px-4 py-4 sm:px-20">
      <StatsPageHeader />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard value={stats.total} label="Total" />
          {stats.byStatus.map((item) => (
            <KpiCard key={item.status} value={item.count} label={item.label} />
          ))}
        </div>

        <StatusDistributionChart stats={stats} />
        <RecommendationsCard stats={stats} />
      </div>
    </div>
  )
}
