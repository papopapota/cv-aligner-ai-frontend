"use client"

import { useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { CheckCircle2, CircleAlert, FileText, Sparkles } from "lucide-react"

import {
  getOptimizationResultSnapshot,
  parseOptimizationResult,
  subscribeToOptimizationResult,
} from "@/features/optimize-cv"
import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
} from "@/shared/ui"
import { buildDimensionComparisons } from "../model/dimension-comparison"

function formatVariance(value: number): string {
  return `${Math.round(value * 100)}%`
}

function formatIc(value: number): string {
  return value.toFixed(1)
}

function formatDimension(value: number): string {
  return `${Math.round(value * 100)}%`
}

function formatDelta(value: number): string {
  const percentagePoints = Math.round(value * 100)
  return `${percentagePoints > 0 ? "+" : ""}${percentagePoints} pp`
}

export function OptimizationResult() {
  const rawResult = useSyncExternalStore(
    subscribeToOptimizationResult,
    getOptimizationResultSnapshot,
    () => null
  )
  const result = useMemo(
    () => parseOptimizationResult(rawResult),
    [rawResult]
  )

  if (!result) {
    return (
      <EmptyState
        icon={<FileText aria-hidden="true" />}
        title="Aún no hay análisis disponible"
        description="Sube tu CV y la descripción de la vacante para generar una optimización."
        action={
          <Link href="/upload" className={buttonVariants()}>
            Cargar documentos
          </Link>
        }
      />
    )
  }

  const dimensions = buildDimensionComparisons(
    result.original_per_dimension,
    result.optimized_per_dimension
  )
  const hasGapReport = result.gap_report.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Varianza original</CardTitle>
            <CardDescription>
              Desviación detectada en tu CV inicial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[28px] leading-[1.4] text-ink">
              {formatVariance(result.original_variance_score)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Varianza optimizada</CardTitle>
            <CardDescription>
              Desviación detectada tras la optimización.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[28px] leading-[1.4] text-ink">
              {formatVariance(result.optimized_variance_score)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IC original</CardTitle>
            <CardDescription>
              Índice de compatibilidad de tu CV inicial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[28px] leading-[1.4] text-ink">
              {formatIc(result.original_ic)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IC optimizado</CardTitle>
            <CardDescription>
              Índice de compatibilidad tras la optimización.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[28px] leading-[1.4] text-ink">
              {formatIc(result.optimized_ic)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativa por dimensión</CardTitle>
          <CardDescription>
            Evolución del ajuste en las dimensiones disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {dimensions.length > 0 ? (
            dimensions.map((dimension) => (
              <div key={dimension.key} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-base text-ink">{dimension.label}</span>
                  <span className="text-sm text-muted-foreground">
                    Original {formatDimension(dimension.original)} · Optimizado{" "}
                    {formatDimension(dimension.optimized)}
                  </span>
                </div>
                <Progress
                  value={dimension.optimized * 100}
                  aria-label={dimension.label}
                />
                <span className="text-xs text-muted-foreground">
                  {dimension.delta >= 0 ? "Mejora" : "Variación"}{" "}
                  {formatDelta(dimension.delta)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay dimensiones comparables disponibles.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brechas detectadas</CardTitle>
          <CardDescription>
            Diferencias entre tu CV y los requisitos de la vacante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasGapReport ? (
            <div className="border border-line bg-canvas p-4">
              <p className="whitespace-pre-wrap text-sm text-ink">
                {result.gap_report}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se detectaron brechas relevantes.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-5 text-primary" />
            CV optimizado
          </CardTitle>
          <CardDescription>
            Contenido generado a partir de tu CV y la vacante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-auto border border-line bg-canvas p-4">
            <p className="whitespace-pre-wrap text-sm text-ink">
              {result.optimized_content}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant={result.is_within_threshold ? "secondary" : "destructive"}
        >
          {result.is_within_threshold ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <CircleAlert aria-hidden="true" />
          )}
          {result.is_within_threshold
            ? "Dentro del umbral"
            : "Fuera del umbral"}
        </Badge>
        <Badge variant="outline">
          Intentos del redactor: {result.writer_attempts}
        </Badge>
      </div>
    </div>
  )
}
