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
} from "@/shared/ui"

function formatVariance(value: number): string {
  return `${Math.round(value * 100)}%`
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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

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
