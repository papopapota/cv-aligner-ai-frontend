"use client"

import { useMutation } from "@tanstack/react-query"

import { postJson } from "@/shared/api"
import {
  cvOptimizationResultSchema,
  type CvOptimizationResult,
} from "../model"

export interface OptimizeCvInput {
  cvId: string
  jobDescription: string
}

export async function optimizeCv({
  cvId,
  jobDescription,
}: OptimizeCvInput): Promise<CvOptimizationResult> {
  const result = await postJson({
    url: `/cvs/${cvId}/optimize`,
    body: { job_description: jobDescription },
    schema: cvOptimizationResultSchema,
  })

  return { ...result, cv_id: result.cv_id ?? cvId }
}

export function useOptimizeCv() {
  return useMutation<CvOptimizationResult, Error, OptimizeCvInput>({
    mutationFn: optimizeCv,
  })
}
