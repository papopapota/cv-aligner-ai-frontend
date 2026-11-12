const fetchMock = globalThis.fetch as unknown as jest.MockedFunction<typeof fetch>

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, jest } from "@jest/globals"

import { saveOptimizationResult } from "@/features/optimize-cv"
import { CvDiffViewer } from "./cv-diff-viewer"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function renderViewer() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(<CvDiffViewer />, { wrapper })
}

function createOptimizationResult() {
  return {
    cv_id: CV_ID,
    optimized_content: "Contenido optimizado",
    optimized_body:
      "## Resumen Profesional\nTexto optimizado\n\n## Experiencia\n- Logro optimizado",
    personal_info: { full_name: "Ada Lovelace", email: "ada@example.com" },
    original_variance_score: 0.8,
    optimized_variance_score: 0.2,
    writer_attempts: 2,
    is_within_threshold: true,
    original_ic: 47.4,
    optimized_ic: 52.5,
    original_per_dimension: { experience: 0.48 },
    optimized_per_dimension: { experience: 0.52 },
    gap_report: "",
  }
}

function createContentPayload() {
  return {
    id: CV_ID,
    status: "PARSED",
    raw_text: "Texto original",
    characters_extracted: 13,
    structured_cv: {
      personal_info: { full_name: "Ada Lovelace" },
      technical_data: {
        summary: "Texto original",
        experience: "- Logro original",
      },
    },
  }
}

function mockJsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: jest.fn(async () => payload),
  } as unknown as Response
}

describe("CvDiffViewer", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("muestra un estado vacío sin resultado", () => {
    renderViewer()

    expect(screen.getByText("Aún no hay un CV optimizado")).toBeInTheDocument()
  })

  it("compara el CV original con el optimizado y guarda los cambios", async () => {
    const user = userEvent.setup()
    saveOptimizationResult(createOptimizationResult())
    fetchMock.mockResolvedValue(mockJsonResponse(createContentPayload()))

    renderViewer()

    expect(
      screen.getByLabelText("Editar Resumen Profesional")
    ).toHaveValue("Texto optimizado")

    await waitFor(() => {
      expect(screen.getByText("Texto original")).toBeInTheDocument()
    })

    const textarea = screen.getByLabelText("Editar Resumen Profesional")
    await user.clear(textarea)
    await user.type(textarea, "Texto mejorado")

    expect(screen.getAllByText("Modificado").length).toBeGreaterThan(0)
    expect(
      screen.getByText(/2 modificadas/)
    ).toBeInTheDocument()

    const stored = JSON.parse(
      window.sessionStorage.getItem("cv-editor-draft") ?? "{}"
    ) as { edits?: Record<string, string> }

    expect(Object.values(stored.edits ?? {})).toContain("Texto mejorado")
  })

  it("revierte los cambios de una sección", async () => {
    const user = userEvent.setup()
    saveOptimizationResult(createOptimizationResult())
    fetchMock.mockResolvedValue(mockJsonResponse(createContentPayload()))

    renderViewer()

    const textarea = screen.getByLabelText("Editar Resumen Profesional")
    await user.clear(textarea)
    await user.type(textarea, "Texto mejorado")

    const revertButtons = screen.getAllByRole("button", {
      name: /revertir cambios/i,
    })
    await user.click(revertButtons[0])

    expect(
      screen.getByLabelText("Editar Resumen Profesional")
    ).toHaveValue("Texto optimizado")
  })
})
