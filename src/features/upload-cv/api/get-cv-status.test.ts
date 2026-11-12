const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<
  typeof fetch
>

import { beforeEach, describe, expect, jest, it } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { getCvStatus } from "./get-cv-status"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function createPayload() {
  return {
    id: CV_ID,
    filename: "cv.pdf",
    content_type: "application/pdf",
    size_bytes: 12,
    sha256: "abc123",
    status: "PARSED",
    action_required: null,
    error_code: null,
    error_message: null,
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

describe("getCvStatus", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("consulta el estado del CV por id", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse(createPayload()))

    const result = await getCvStatus(CV_ID)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/cvs/${CV_ID}`,
      expect.objectContaining({ method: "GET" })
    )
    expect(result.status).toBe("PARSED")
  })

  it("propaga el mensaje de error del backend", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { detail: "CV no encontrado." },
        { ok: false, status: 404 }
      )
    )

    await expect(getCvStatus(CV_ID)).rejects.toThrow("CV no encontrado.")
  })
})
