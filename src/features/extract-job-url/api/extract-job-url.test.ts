const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<
  typeof fetch
>

import { beforeEach, describe, expect, jest, it } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { extractJobUrl } from "./extract-job-url"

const JOB_URL = "https://example.com/ofertas/backend"

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

describe("extractJobUrl", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("envía la URL al endpoint y devuelve título, empresa y descripción", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        title: "Backend Engineer",
        company: "Acme Corp",
        description: "Buscamos Python y FastAPI.",
      })
    )

    const content = await extractJobUrl(JOB_URL)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/job-descriptions/extract`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ url: JOB_URL }),
      })
    )
    expect(content).toEqual({
      title: "Backend Engineer",
      company: "Acme Corp",
      description: "Buscamos Python y FastAPI.",
    })
  })

  it("acepta una respuesta sin título ni empresa", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({ description: "Buscamos Python y FastAPI." })
    )

    const content = await extractJobUrl(JOB_URL)

    expect(content.title).toBeUndefined()
    expect(content.company).toBeUndefined()
    expect(content.description).toBe("Buscamos Python y FastAPI.")
  })

  it("propaga el mensaje de error del backend", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { detail: "La URL apunta a una dirección no pública." },
        { ok: false, status: 400 }
      )
    )

    await expect(extractJobUrl(JOB_URL)).rejects.toThrow(
      "La URL apunta a una dirección no pública."
    )
  })

  it("rechaza una respuesta con formato inesperado", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ title: "Sin descripción" }))

    await expect(extractJobUrl(JOB_URL)).rejects.toThrow(
      "La respuesta del servidor no tiene el formato esperado."
    )
  })
})
