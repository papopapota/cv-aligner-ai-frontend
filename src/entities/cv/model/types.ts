import { z } from "zod"

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const cvFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
  uploadedAt: z.string().min(1),
})

export type CvFile = z.infer<typeof cvFileSchema>
