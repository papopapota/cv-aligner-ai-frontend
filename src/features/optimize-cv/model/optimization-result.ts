import { z } from "zod"

import { personalInfoSchema, technicalDataSchema } from "@/entities/cv"

export const dimensionScoresSchema = z.record(
  z.string().min(1),
  z.number().min(0).max(1)
)

export const cvOptimizationResultSchema = z.object({
  cv_id: z.string().uuid().optional(),
  optimized_content: z.string().min(1),
  optimized_body: z.string().optional(),
  optimized_sections: technicalDataSchema.optional(),
  personal_info: personalInfoSchema.nullable().optional(),
  original_variance_score: z.number().min(0).max(1),
  optimized_variance_score: z.number().min(0).max(1),
  writer_attempts: z.number().int().nonnegative(),
  is_within_threshold: z.boolean(),
  original_ic: z.number().nonnegative().nullable(),
  optimized_ic: z.number().nonnegative().nullable(),
  original_per_dimension: dimensionScoresSchema,
  optimized_per_dimension: dimensionScoresSchema,
  gap_report: z.string(),
})

export type DimensionScores = z.infer<typeof dimensionScoresSchema>
export type CvOptimizationResult = z.infer<typeof cvOptimizationResultSchema>
