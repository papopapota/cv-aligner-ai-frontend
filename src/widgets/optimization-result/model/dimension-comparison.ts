import type { DimensionScores } from "@/features/optimize-cv"

export type DimensionKey = keyof DimensionScores

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  experience: "Experiencia",
  languages: "Idiomas",
  technical_skills: "Habilidades técnicas",
}

export interface DimensionComparison {
  key: DimensionKey
  label: string
  original: number
  optimized: number
  delta: number
}

const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as DimensionKey[]

export function buildDimensionComparisons(
  original: DimensionScores,
  optimized: DimensionScores
): DimensionComparison[] {
  return DIMENSION_KEYS.map((key) => ({
    key,
    label: DIMENSION_LABELS[key],
    original: original[key],
    optimized: optimized[key],
    delta: optimized[key] - original[key],
  }))
}
