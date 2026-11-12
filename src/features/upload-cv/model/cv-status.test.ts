import { describe, expect, it, jest } from "@jest/globals"

import type { CvStatusResponse } from "@/entities/cv"
import {
  isCvFailed,
  isCvPending,
  isCvReady,
  waitForCvReady,
} from "./cv-status"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function createStatus(
  overrides: Partial<CvStatusResponse> = {}
): CvStatusResponse {
  return {
    id: CV_ID,
    filename: "cv.pdf",
    content_type: "application/pdf",
    size_bytes: 12,
    sha256: "abc123",
    status: "UPLOADED",
    action_required: "WAIT_FOR_PARSING",
    ...overrides,
  }
}

describe("cv-status", () => {
  it("reconoce los estados listos", () => {
    expect(isCvReady(createStatus({ status: "PARSED" }))).toBe(true)
    expect(isCvReady(createStatus({ status: "processing" }))).toBe(false)
  })

  it("reconoce errores y solicitudes de re-subida", () => {
    expect(isCvFailed(createStatus({ status: "ERROR" }))).toBe(true)
    expect(
      isCvFailed(
        createStatus({ status: "PARSED", action_required: "REUPLOAD_CV" })
      )
    ).toBe(true)
    expect(isCvFailed(createStatus({ status: "PARSED" }))).toBe(false)
  })

  it("identifica estados pendientes", () => {
    expect(isCvPending(createStatus())).toBe(true)
    expect(isCvPending(createStatus({ status: "PARSED" }))).toBe(false)
  })

  it("espera hasta que el CV está listo", async () => {
    const fetchStatus = jest
      .fn<(cvId: string) => Promise<CvStatusResponse>>()
      .mockResolvedValueOnce(createStatus())
      .mockResolvedValueOnce(createStatus({ status: "PARSED", action_required: null }))
    const sleep = jest
      .fn<(ms: number) => Promise<void>>()
      .mockResolvedValue(undefined)

    const result = await waitForCvReady(CV_ID, {
      fetchStatus,
      sleep,
      intervalMs: 10,
    })

    expect(result.status).toBe("PARSED")
    expect(fetchStatus).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledWith(10)
  })

  it("lanza el mensaje de error del backend", async () => {
    const fetchStatus = jest
      .fn<(cvId: string) => Promise<CvStatusResponse>>()
      .mockResolvedValue(
        createStatus({
          status: "ERROR",
          action_required: null,
          error_message: "No se pudo extraer texto.",
        })
      )

    await expect(
      waitForCvReady(CV_ID, { fetchStatus, sleep: async () => undefined })
    ).rejects.toThrow("No se pudo extraer texto.")
  })

  it("falla cuando se supera el timeout", async () => {
    const fetchStatus = jest
      .fn<(cvId: string) => Promise<CvStatusResponse>>()
      .mockResolvedValue(createStatus())

    await expect(
      waitForCvReady(CV_ID, {
        fetchStatus,
        sleep: async () => undefined,
        timeoutMs: 0,
      })
    ).rejects.toThrow("El procesamiento del CV está tardando más de lo esperado.")
  })
})
