const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<typeof fetch>

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, jest } from "@jest/globals"

import { API_URL } from "@/shared/api"
import { mockPush } from "../../../../jest.setup"
import { UploadPanel } from "./upload-panel"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function renderUploadPanel() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(<UploadPanel />, { wrapper })
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

function createUploadPayload() {
  return {
    id: CV_ID,
    filename: "cv.pdf",
    content_type: "application/pdf",
    size_bytes: 9,
    sha256: "abc123",
    status: "UPLOADED",
    action_required: "WAIT_FOR_PARSING",
  }
}

function createOptimizationPayload() {
  return {
    optimized_content: "Contenido optimizado",
    optimized_body: "Resumen Profesional\n\nContenido optimizado",
    personal_info: { full_name: "Ada Lovelace" },
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

describe("UploadPanel", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    mockPush.mockClear()
    window.sessionStorage.clear()
  })

  it("exige CV y descripción antes de continuar", async () => {
    const user = userEvent.setup()

    renderUploadPanel()

    fireEvent.click(screen.getByText("Personalizar CV"))

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo completar el análisis")
      ).toBeInTheDocument()
      expect(screen.getByText("Necesitamos tu CV para generar el diagnóstico ATS.")).toBeInTheDocument()
    })

    await user.upload(
      screen.getByLabelText("Seleccionar archivo de CV"),
      [new File(["contenido"], "cv.pdf", { type: "application/pdf" })]
    )

    await waitFor(() => {
      expect(screen.queryByText("Necesitamos tu CV para generar el diagnóstico ATS.")).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Personalizar CV"))

    await waitFor(() => {
      expect(screen.getByText("Añade una descripción válida de la vacante para continuar.")).toBeInTheDocument()
    })
  })

  it("sube el CV, espera el parseo y navega al análisis", async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse(createUploadPayload(), { status: 202 }))
      .mockResolvedValueOnce(
        mockJsonResponse({
          ...createUploadPayload(),
          status: "PARSED",
          action_required: null,
        })
      )
      .mockResolvedValueOnce(mockJsonResponse(createOptimizationPayload()))

    renderUploadPanel()

    await user.upload(
      screen.getByLabelText("Seleccionar archivo de CV"),
      [new File(["contenido"], "cv.pdf", { type: "application/pdf" })]
    )

    await user.click(screen.getByText("Texto"))
    await user.type(
      screen.getByLabelText("Descripción de la vacante"),
      "Buscamos una persona con experiencia en React, TypeScript y testing automatizado."
    )

    await user.click(screen.getByText("Personalizar CV"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/cvs`)
    expect(fetchMock.mock.calls[1][0]).toBe(`${API_URL}/cvs/${CV_ID}`)
    expect(fetchMock.mock.calls[2][0]).toBe(
      `${API_URL}/cvs/${CV_ID}/optimize`
    )

    const uploadRequest = fetchMock.mock.calls[0][1] as RequestInit
    const uploadBody = uploadRequest.body as FormData

    expect(uploadBody).toBeInstanceOf(FormData)
    expect((uploadBody.get("cv_file") as File).name).toBe("cv.pdf")

    const optimizeRequest = fetchMock.mock.calls[2][1] as RequestInit
    expect(JSON.parse(String(optimizeRequest.body))).toEqual({
      job_description:
        "Buscamos una persona con experiencia en React, TypeScript y testing automatizado.",
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/analysis")
    })
  })

  it("muestra un error cuando el backend pide re-subir el CV", async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse(createUploadPayload(), { status: 202 }))
      .mockResolvedValueOnce(
        mockJsonResponse({
          ...createUploadPayload(),
          status: "ERROR",
          action_required: "REUPLOAD_CV",
          error_message: "El PDF no contiene texto.",
        })
      )

    renderUploadPanel()

    await user.upload(
      screen.getByLabelText("Seleccionar archivo de CV"),
      [new File(["contenido"], "cv.pdf", { type: "application/pdf" })]
    )

    await user.click(screen.getByText("Texto"))
    await user.type(
      screen.getByLabelText("Descripción de la vacante"),
      "Buscamos una persona con experiencia en React."
    )

    await user.click(screen.getByText("Personalizar CV"))

    await waitFor(() => {
      expect(screen.getByText("El PDF no contiene texto.")).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
