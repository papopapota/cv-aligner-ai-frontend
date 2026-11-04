import type { Application, ApplicationStatus } from "@/entities/application"

export const APPLICATIONS_PAGE_SIZE = 10

export type ApplicationStatusFilter = ApplicationStatus | "all"
export type ApplicationDateOrder = "newest" | "oldest"

export interface ApplicationFilters {
  search: string
  status: ApplicationStatusFilter
  dateOrder: ApplicationDateOrder
}

/**
 * Filters and sorts applications for the tracking table.
 *
 * The date order is applied on the raw ISO timestamps so the list stays
 * stable regardless of the locale used to render the dates.
 */
export function filterApplications(
  applications: Application[],
  { search, status, dateOrder }: ApplicationFilters
): Application[] {
  const normalizedSearch = search.trim().toLowerCase()

  return applications
    .filter((application) => status === "all" || application.status === status)
    .filter((application) => {
      if (normalizedSearch.length === 0) {
        return true
      }

      return (
        application.jobTitle.toLowerCase().includes(normalizedSearch) ||
        application.company.toLowerCase().includes(normalizedSearch)
      )
    })
    .sort((first, second) => {
      const firstTime = Date.parse(first.createdAt)
      const secondTime = Date.parse(second.createdAt)
      const difference = firstTime - secondTime

      return dateOrder === "newest" ? -difference : difference
    })
}

/**
 * Formats an ISO timestamp as `dd/mm/yyyy` without applying a timezone, so a
 * date stored as `2026-10-18T00:00:00` is never shifted to the previous day.
 */
export function formatApplicationDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

  if (!match) {
    return "—"
  }

  return `${match[3]}/${match[2]}/${match[1]}`
}
