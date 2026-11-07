const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<
  typeof fetch
>

import { beforeEach, describe, expect, jest, it } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { optimizeCv } from "./optimize-cv"

function createInput() {
  return {
    cvFile: new File(["cv"], "cv.pdf", { type: "application/pdf" }),
    jobDescriptionFile: new File(["vacante"], "job-description.txt", {
      type: "text/plain",
    }),
  }
}

function mockJsonResponse(
  payload: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {}
): Response {
  return {
    ok,
    status,
    json: jest.fn(async () => payload),
  } as unknown as Response
}

describe("optimizeCv", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("envía cv_file y job_description_file como multipart", async () => {
    const input = createInput()
    const responsePayload = {
      optimized_content: "Contenido optimizado",
      original_variance_score: 0.8,
      optimized_variance_score: 0.2,
      writer_attempts: 2,
      is_within_threshold: true,
      original_ic: 47.4,
      optimized_ic: 52.5,
      original_per_dimension: {
        certifications: 0.586,
        education: 0.545,
        experience: 0.431,
        languages: 0.51,
        technical_skills: 0.624,
      },
      optimized_per_dimension: {
        certifications: 0.693,
        education: 0.548,
        experience: 0.452,
        languages: 0.51,
        technical_skills: 0.711,
      },
      gap_report: "Falta experiencia específica en Node.js.",
    }
    fetchMock.mockResolvedValue(mockJsonResponse(responsePayload))

    const result = await optimizeCv(input)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/cv/optimize`,
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    )

    const request = fetchMock.mock.calls[0][1] as RequestInit
    const body = request.body as FormData

    expect(body.get("cv_file")).toBe(input.cvFile)
    expect(body.get("job_description_file")).toBe(input.jobDescriptionFile)
    expect(result).toEqual(responsePayload)
  })

  it("propaga el mensaje de error del backend", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { detail: "Formato no soportado." },
        { ok: false, status: 400 }
      )
    )

    await expect(optimizeCv(createInput())).rejects.toThrow(
      "Formato no soportado."
    )
  })

  it("rechaza una respuesta con formato inesperado", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({ optimized_content: "" })
    )

    await expect(optimizeCv(createInput())).rejects.toThrow(
      "La respuesta del servidor no tiene el formato esperado."
    )
  })
})
