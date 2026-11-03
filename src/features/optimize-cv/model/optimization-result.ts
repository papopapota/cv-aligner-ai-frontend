import { z } from "zod"

export const cvOptimizationResultSchema = z.object({
  optimized_content: z.string().min(1),
  original_variance_score: z.number().min(0).max(1),
  optimized_variance_score: z.number().min(0).max(1),
  writer_attempts: z.number().int().nonnegative(),
  is_within_threshold: z.boolean(),
})

export type CvOptimizationResult = z.infer<typeof cvOptimizationResultSchema>
