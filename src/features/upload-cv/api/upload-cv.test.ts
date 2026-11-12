const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<
  typeof fetch
>

import { beforeEach, describe, expect, jest, it } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { uploadCv } from "./upload-cv"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function createPayload() {
  return {
    id: CV_ID,
    filename: "cv.pdf",
    content_type: "application/pdf",
    size_bytes: 12,
    sha256: "abc123",
    status: "UPLOADED",
    action_required: "WAIT_FOR_PARSING",
  }
}

function mockJsonResponse(
  payload: unknown,
  { ok = true, status = 202 }: { ok?: boolean; status?: number } = {}
): Response {
  return {
    ok,
    status,
    json: jest.fn(async () => payload),
  } as unknown as Response
}

describe("uploadCv", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("sube el archivo como multipart al endpoint de CVs", async () => {
    const file = new File(["contenido"], "cv.pdf", {
      type: "application/pdf",
    })
    fetchMock.mockResolvedValue(mockJsonResponse(createPayload()))

    const result = await uploadCv(file)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/cvs`,
      expect.objectContaining({ method: "POST" })
    )

    const request = fetchMock.mock.calls[0][1] as RequestInit
    const body = request.body as FormData

    expect(body).toBeInstanceOf(FormData)
    expect(body.get("cv_file")).toBe(file)
    expect(result.id).toBe(CV_ID)
    expect(result.action_required).toBe("WAIT_FOR_PARSING")
  })

  it("propaga el mensaje de error del backend", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { detail: "El archivo no es válido." },
        { ok: false, status: 400 }
      )
    )

    await expect(
      uploadCv(new File(["x"], "cv.pdf", { type: "application/pdf" }))
    ).rejects.toThrow("El archivo no es válido.")
  })

  it("rechaza una respuesta con formato inesperado", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ id: "no-es-uuid" }))

    await expect(
      uploadCv(new File(["x"], "cv.pdf", { type: "application/pdf" }))
    ).rejects.toThrow(
      "La respuesta del servidor no tiene el formato esperado."
    )
  })
})
