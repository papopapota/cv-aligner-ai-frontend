import type { CvStatusResponse } from "@/entities/cv"
import { getCvStatus } from "../api/get-cv-status"

const READY_STATUSES = new Set(["PARSED", "READY", "PROCESSED", "COMPLETED"])
const FAILED_STATUSES = new Set(["ERROR", "FAILED"])
const PENDING_STATUSES = new Set([
  "UPLOADED",
  "PARSING",
  "PROCESSING",
  "PENDING",
])

export function isCvReady(status: CvStatusResponse): boolean {
  return READY_STATUSES.has(status.status.toUpperCase())
}

export function isCvFailed(status: CvStatusResponse): boolean {
  return (
    FAILED_STATUSES.has(status.status.toUpperCase()) ||
    status.action_required === "REUPLOAD_CV"
  )
}

export function isCvPending(status: CvStatusResponse): boolean {
  if (isCvReady(status) || isCvFailed(status)) {
    return false
  }

  return (
    status.action_required === "WAIT_FOR_PARSING" ||
    PENDING_STATUSES.has(status.status.toUpperCase())
  )
}

export interface WaitForCvReadyOptions {
  intervalMs?: number
  timeoutMs?: number
  fetchStatus?: (cvId: string) => Promise<CvStatusResponse>
  sleep?: (ms: number) => Promise<void>
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForCvReady(
  cvId: string,
  {
    intervalMs = 1500,
    timeoutMs = 120_000,
    fetchStatus = getCvStatus,
    sleep = defaultSleep,
  }: WaitForCvReadyOptions = {}
): Promise<CvStatusResponse> {
  const startedAt = Date.now()

  for (;;) {
    const status = await fetchStatus(cvId)

    if (isCvReady(status)) {
      return status
    }

    if (isCvFailed(status)) {
      throw new Error(
        status.error_message ??
          status.error_code ??
          "No se pudo procesar el CV. Vuelve a subirlo e inténtalo de nuevo."
      )
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(
        "El procesamiento del CV está tardando más de lo esperado. Inténtalo de nuevo."
      )
    }

    await sleep(intervalMs)
  }
}
