import { z } from "zod"

export const jobUrlSchema = z.object({
  url: z.string().trim().url("Ingresa una URL válida."),
})

export type JobUrlFormData = z.infer<typeof jobUrlSchema>
