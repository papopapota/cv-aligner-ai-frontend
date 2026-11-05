import { z } from "zod"

export const createApplicationSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(1, "Indica el puesto de la postulación.")
    .max(120, "El puesto no puede superar los 120 caracteres."),
  company: z
    .string()
    .trim()
    .min(1, "Indica la empresa de la postulación.")
    .max(120, "La empresa no puede superar los 120 caracteres."),
})

export type CreateApplicationForm = z.infer<typeof createApplicationSchema>
