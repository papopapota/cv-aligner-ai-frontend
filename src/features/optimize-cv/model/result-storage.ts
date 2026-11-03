import {
  cvOptimizationResultSchema,
  type CvOptimizationResult,
} from "./optimization-result"

export const OPTIMIZATION_RESULT_STORAGE_KEY = "cv-optimization-result"

export function parseOptimizationResult(
  raw: string | null
): CvOptimizationResult | null {
  if (!raw) {
    return null
  }

  try {
    const payload: unknown = JSON.parse(raw)
    const parsed = cvOptimizationResultSchema.safeParse(payload)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function getOptimizationResultSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return window.sessionStorage.getItem(OPTIMIZATION_RESULT_STORAGE_KEY)
}

export function subscribeToOptimizationResult(
  onStoreChange: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === OPTIMIZATION_RESULT_STORAGE_KEY) {
      onStoreChange()
    }
  }

  window.addEventListener("storage", handleStorage)

  return () => window.removeEventListener("storage", handleStorage)
}

export function saveOptimizationResult(result: CvOptimizationResult): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    OPTIMIZATION_RESULT_STORAGE_KEY,
    JSON.stringify(result)
  )
}

export function readOptimizationResult(): CvOptimizationResult | null {
  return parseOptimizationResult(getOptimizationResultSnapshot())
}

export function clearOptimizationResult(): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(OPTIMIZATION_RESULT_STORAGE_KEY)
}
