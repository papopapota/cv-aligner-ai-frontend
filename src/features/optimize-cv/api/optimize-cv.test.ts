const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<
  typeof fetch
>

import { beforeEach, describe, expect, jest, it } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { optimizeCv } from "./optimize-cv"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function createInput() {
  return {
    cvId: CV_ID,
    jobDescription: "Buscamos experiencia en React y TypeScript.",
  }
}

function createPayload() {
  return {
    optimized_content: JSON.stringify({ summary: "Contenido optimizado" }),
    optimized_body: "Resumen Profesional\n\nContenido optimizado",
    personal_info: {
      full_name: "Ada Lovelace",
      email: "ada@example.com",
    },
    original_variance_score: 0.8,
    optimized_variance_score: 0.2,
    writer_attempts: 2,
    is_within_threshold: true,
    original_ic: 47.4,
    optimized_ic: 52.5,
    original_per_dimension: {
      experience: 0.487,
      languages: 0.578,
      technical_skills: 0.712,
    },
    optimized_per_dimension: {
      experience: 0.487,
      languages: 0.578,
      technical_skills: 0.742,
    },
    gap_report: "Falta experiencia específica en Node.js.",
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

  it("envía el job_description como JSON al endpoint del CV", async () => {
    const input = createInput()
    fetchMock.mockResolvedValue(mockJsonResponse(createPayload()))

    const result = await optimizeCv(input)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/cvs/${CV_ID}/optimize`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ job_description: input.jobDescription }),
      })
    )

    expect(result.cv_id).toBe(CV_ID)
    expect(result.optimized_body).toBe("Resumen Profesional\n\nContenido optimizado")
  })

  it("conserva el cv_id devuelto por el backend", async () => {
    const backendCvId = "22222222-2222-4222-8222-222222222222"
    fetchMock.mockResolvedValue(
      mockJsonResponse({ ...createPayload(), cv_id: backendCvId })
    )

    const result = await optimizeCv(createInput())

    expect(result.cv_id).toBe(backendCvId)
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
    fetchMock.mockResolvedValue(mockJsonResponse({ optimized_content: "" }))

    await expect(optimizeCv(createInput())).rejects.toThrow(
      "La respuesta del servidor no tiene el formato esperado."
    )
  })
})
