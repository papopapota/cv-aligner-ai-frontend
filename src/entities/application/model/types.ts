import { z } from "zod"

export const applicationStatuses = [
  "pending",
  "under-review",
  "accepted",
  "rejected",
] as const

export type ApplicationStatus = (typeof applicationStatuses)[number]

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: "Enviada",
  "under-review": "En revisión",
  accepted: "Aceptada",
  rejected: "Rechazada",
}

export interface Application {
  id: number
  userId: number
  jobTitle: string
  company: string
  status: ApplicationStatus
  createdAt: string
}

/**
 * Raw payload returned by `GET /applications` (snake_case, as defined by the
 * FastAPI backend).
 */
export const applicationApiSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  job_title: z.string(),
  company: z.string(),
  status: z.string(),
  created_at: z.string(),
})

export type ApplicationApi = z.infer<typeof applicationApiSchema>

export const applicationListSchema = z.array(applicationApiSchema)

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (applicationStatuses as readonly string[]).includes(value)
}

export function toApplication(row: ApplicationApi): Application {
  return {
    id: row.id,
    userId: row.user_id,
    jobTitle: row.job_title,
    company: row.company,
    status: isApplicationStatus(row.status) ? row.status : "pending",
    createdAt: row.created_at,
  }
}
