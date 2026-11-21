import { z } from "zod"

export const jobUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Ingresa una URL válida.")
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "Solo se permiten URLs http o https.",
    }),
})

export type JobUrlFormData = z.infer<typeof jobUrlSchema>
