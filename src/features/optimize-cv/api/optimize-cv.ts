"use client"

import { useMutation } from "@tanstack/react-query"

import { postFormData } from "@/shared/api"
import {
  cvOptimizationResultSchema,
  type CvOptimizationResult,
} from "../model"

export interface OptimizeCvInput {
  cvFile: File
  jobDescriptionFile: File
}

export async function optimizeCv({
  cvFile,
  jobDescriptionFile,
}: OptimizeCvInput): Promise<CvOptimizationResult> {
  const formData = new FormData()
  formData.append("cv_file", cvFile)
  formData.append("job_description_file", jobDescriptionFile)

  return postFormData({
    url: "/cv/optimize",
    formData,
    schema: cvOptimizationResultSchema,
  })
}

export function useOptimizeCv() {
  return useMutation<CvOptimizationResult, Error, OptimizeCvInput>({
    mutationFn: optimizeCv,
  })
}
