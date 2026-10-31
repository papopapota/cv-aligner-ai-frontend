import { z } from "zod"

export const jobSourceSchema = z.enum(["url", "text", "file"])

export const jobVacancySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  source: jobSourceSchema,
  url: z.string().url().optional(),
  location: z.string().optional(),
})

export type JobSource = z.infer<typeof jobSourceSchema>
export type JobVacancy = z.infer<typeof jobVacancySchema>
