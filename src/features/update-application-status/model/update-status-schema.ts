import { z } from "zod"

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["pending", "under-review", "accepted", "rejected"]),
})

export type UpdateApplicationStatusForm = z.infer<typeof updateApplicationStatusSchema>