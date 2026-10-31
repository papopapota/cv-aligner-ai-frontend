import { z } from "zod"

export const jobTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(40, "Incluye al menos 40 caracteres de la descripción."),
})

export type JobTextFormData = z.infer<typeof jobTextSchema>
