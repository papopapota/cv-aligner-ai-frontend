import {
  applicationStatusLabels,
  applicationStatuses,
  type Application,
  type ApplicationStatus,
} from "./types"

export interface ApplicationStatusStat {
  status: ApplicationStatus
  label: string
  count: number
  percentage: number
}

export interface ApplicationsStatusStats {
  total: number
  byStatus: ApplicationStatusStat[]
}

function roundPercentage(value: number): number {
  return Math.round(value * 10) / 10
}

export function getApplicationsStatusStats(
  applications: Application[]
): ApplicationsStatusStats {
  const total = applications.length
  const counts = new Map<ApplicationStatus, number>(
    applicationStatuses.map((status) => [status, 0])
  )

  for (const application of applications) {
    counts.set(application.status, (counts.get(application.status) ?? 0) + 1)
  }

  const byStatus = applicationStatuses.map((status) => {
    const count = counts.get(status) ?? 0
    const percentage = total === 0 ? 0 : roundPercentage((count / total) * 100)

    return {
      status,
      label: applicationStatusLabels[status],
      count,
      percentage,
    }
  })

  return { total, byStatus }
}
