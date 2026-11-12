"use client"

import { useCallback, useState } from "react"

import {
  useOptimizeCv,
  type CvOptimizationResult,
} from "@/features/optimize-cv"
import { uploadCv, waitForCvReady } from "@/features/upload-cv"

export type CvOptimizationPhase = "idle" | "uploading" | "parsing" | "optimizing"

export interface RunCvOptimizationInput {
  cvFile: File
  jobDescription: string
}

export interface CvOptimizationFlow {
  run: (input: RunCvOptimizationInput) => Promise<CvOptimizationResult | null>
  phase: CvOptimizationPhase
  isPending: boolean
  error: string | null
  clearError: () => void
}

export function useCvOptimizationFlow(): CvOptimizationFlow {
  const { mutateAsync: optimize } = useOptimizeCv()
  const [phase, setPhase] = useState<CvOptimizationPhase>("idle")
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const run = useCallback(
    async ({
      cvFile,
      jobDescription,
    }: RunCvOptimizationInput): Promise<CvOptimizationResult | null> => {
      setError(null)

      try {
        setPhase("uploading")
        const uploaded = await uploadCv(cvFile)

        setPhase("parsing")
        const ready = await waitForCvReady(uploaded.id)

        setPhase("optimizing")
        return await optimize({
          cvId: ready.id,
          jobDescription,
        })
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo completar el análisis."
        )
        return null
      } finally {
        setPhase("idle")
      }
    },
    [optimize]
  )

  return {
    run,
    phase,
    isPending: phase !== "idle",
    error,
    clearError,
  }
}
