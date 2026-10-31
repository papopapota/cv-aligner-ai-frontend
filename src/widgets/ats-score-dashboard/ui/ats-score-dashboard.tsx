import { CheckCircle2, Sparkles } from "lucide-react"

import {
  getCompatibilityLabel,
  type AtsReport,
} from "@/entities/ats-report"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@/shared/ui"

const CIRCLE_RADIUS = 76
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export function AtsScoreDashboard({ report }: { report: AtsReport }) {
  const score = Math.round(report.score)
  const dash = (score / 100) * CIRCLE_CIRCUMFERENCE

  return (
    <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
      <Card className="min-h-[360px]">
        <CardHeader>
          <CardTitle>Compatibilidad ATS</CardTitle>
          <CardDescription>
            Resultado calculado a partir de tu CV y la oferta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="relative size-[164px]">
            <svg
              viewBox="0 0 164 164"
              aria-hidden="true"
              className="size-full -rotate-90"
            >
              <circle
                cx="82"
                cy="82"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="var(--line)"
                strokeOpacity="0.35"
                strokeWidth="12"
              />
              <circle
                cx="82"
                cy="82"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="12"
                strokeDasharray={`${dash} ${CIRCLE_CIRCUMFERENCE}`}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28.432px] leading-[1.4] text-ink">
                {score} / 100
              </span>
              <span className="text-xs text-muted-foreground">
                Puntaje ATS
              </span>
            </div>
          </div>

          <Badge variant="secondary">
            <CheckCircle2 aria-hidden="true" />
            {getCompatibilityLabel(score)}
          </Badge>
        </CardContent>
      </Card>

      <Card className="min-h-[360px]">
        <CardHeader>
          <CardTitle>Métricas de compatibilidad</CardTitle>
          <CardDescription>
            Desglose de los factores que más influyen en tu resultado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center gap-6">
          {report.metrics.map((metric) => (
            <div key={metric.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-base text-ink">{metric.label}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(metric.value)}%
                </span>
              </div>
              <Progress value={metric.value} aria-label={metric.label} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-5 text-primary" />
            Recomendaciones
          </CardTitle>
          <CardDescription>{report.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col divide-y divide-line border border-line">
            {report.recommendations.map((recommendation, index) => (
              <li
                key={recommendation}
                className="flex items-start gap-4 p-4 text-base text-ink"
              >
                <span className="flex size-8 shrink-0 items-center justify-center border border-line text-sm text-primary">
                  {index + 1}
                </span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
