import { z } from "zod"

export const jobDescriptionSchema = z.object({
  title: z.string().trim().nullable().optional(),
  company: z.string().trim().nullable().optional(),
  description: z
    .string()
    .trim()
    .min(1, "La URL no contiene una descripción de oferta."),
})

export type JobDescriptionResponse = z.infer<typeof jobDescriptionSchema>
