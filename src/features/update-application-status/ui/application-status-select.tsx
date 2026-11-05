"use client"

import { useState } from "react"

import {
  applicationStatusLabels,
  applicationStatuses,
  isApplicationStatus,
  type ApplicationStatus,
} from "@/entities/application"
import { Select } from "@/shared/ui"

import { useUpdateApplicationStatusMutation } from "../api/update-status"

interface ApplicationStatusSelectProps {
  applicationId: number
  status: ApplicationStatus
}

export function ApplicationStatusSelect({
  applicationId,
  status,
}: ApplicationStatusSelectProps) {
  const [optimisticStatus, setOptimisticStatus] =
    useState<ApplicationStatus | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const mutation = useUpdateApplicationStatusMutation()
  const value = optimisticStatus ?? status

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value

    if (!isApplicationStatus(nextStatus) || nextStatus === status) {
      return
    }

    setOptimisticStatus(nextStatus)
    setSubmitError(null)

    try {
      await mutation.mutateAsync({ applicationId, status: nextStatus })
      setOptimisticStatus(null)
    } catch (error) {
      setOptimisticStatus(null)
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo actualizar el estado."
      )
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Select
        aria-label={`Estado de la postulación ${applicationId}`}
        value={value}
        onChange={handleChange}
        disabled={mutation.isPending}
        className="h-11 w-44"
      >
        {applicationStatuses.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {applicationStatusLabels[statusOption]}
          </option>
        ))}
      </Select>
      {submitError ? (
        <p role="alert" className="text-xs text-destructive">
          {submitError}
        </p>
      ) : null}
    </div>
  )
}
