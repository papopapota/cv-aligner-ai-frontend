import { z } from "zod"

export const atsMetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number().min(0).max(100),
})

export const atsReportSchema = z.object({
  score: z.number().min(0).max(100),
  metrics: z.array(atsMetricSchema).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
})

export type AtsMetric = z.infer<typeof atsMetricSchema>
export type AtsReport = z.infer<typeof atsReportSchema>

export function getCompatibilityLabel(score: number): string {
  if (score >= 85) {
    return "Alta compatibilidad"
  }

  if (score >= 60) {
    return "Compatibilidad media"
  }

  return "Baja compatibilidad"
}
