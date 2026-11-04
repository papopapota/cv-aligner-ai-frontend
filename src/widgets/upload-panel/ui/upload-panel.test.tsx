const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<typeof fetch>

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, jest } from "@jest/globals"

import { mockPush } from "../../../../jest.setup"
import { UploadPanel } from "./upload-panel"

function renderUploadPanel() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(<UploadPanel />, { wrapper })
}

function mockJsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: jest.fn(async () => payload),
  } as unknown as Response
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

  it("envía el CV y la vacante al backend y navega al análisis", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        optimized_content: "Contenido optimizado",
        original_variance_score: 0.8,
        optimized_variance_score: 0.2,
        writer_attempts: 2,
        is_within_threshold: true,
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
      "Buscamos una persona con experiencia en React, TypeScript y testing automatizado."
    )

    await user.click(screen.getByText("Personalizar CV"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/cv/optimize",
        expect.objectContaining({ method: "POST" })
      )
    })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    const body = request.body as FormData

    expect(body).toBeInstanceOf(FormData)
    expect((body.get("cv_file") as File).name).toBe("cv.pdf")
    expect((body.get("job_description_file") as File).name).toBe(
      "job-description.txt"
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/analysis")
    })
  })
})
