import type { DimensionScores } from "@/features/optimize-cv"

export type DimensionKey = string

export const DIMENSION_LABELS: Record<string, string> = {
  certifications: "Certificaciones",
  education: "Formación",
  experience: "Experiencia",
  languages: "Idiomas",
  technical_skills: "Habilidades técnicas",
}

const DIMENSION_ORDER = Object.keys(DIMENSION_LABELS)

export interface DimensionComparison {
  key: DimensionKey
  label: string
  original: number
  optimized: number
  delta: number
}

function getDimensionLabel(key: DimensionKey): string {
  return DIMENSION_LABELS[key] ?? key.replaceAll("_", " ")
}

function getComparableKeys(
  original: DimensionScores,
  optimized: DimensionScores
): DimensionKey[] {
  const commonKeys = Object.keys(optimized).filter((key) => key in original)
  const knownKeys = DIMENSION_ORDER.filter((key) => commonKeys.includes(key))
  const unknownKeys = commonKeys.filter((key) => !DIMENSION_ORDER.includes(key))

  return [...knownKeys, ...unknownKeys]
}

export function buildDimensionComparisons(
  original: DimensionScores,
  optimized: DimensionScores
): DimensionComparison[] {
  return getComparableKeys(original, optimized).map((key) => ({
    key,
    label: getDimensionLabel(key),
    original: original[key],
    optimized: optimized[key],
    delta: optimized[key] - original[key],
  }))
}
