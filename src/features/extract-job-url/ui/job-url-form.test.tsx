import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { JobUrlForm } from "./job-url-form"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>
const JOB_URL = "https://www.nexa.example.com/ofertas/frontend"

function mockJsonResponse(
  payload: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {}
): Response {
  return {
    ok,
    status,
    json: async () => payload,
  } as unknown as Response
}

describe("JobUrlForm", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("entrega al padre una vacante con el título y la empresa de la web", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        title: "Senior Frontend Engineer",
        company: "Nexa Labs",
        description: "Desarrollador Frontend\nBuscamos React y TypeScript.",
      })
    )
    const onExtracted = jest.fn()
    const user = userEvent.setup()

    render(<JobUrlForm onExtracted={onExtracted} />)
    await user.type(screen.getByLabelText("Enlace de la oferta"), JOB_URL)
    await user.click(screen.getByRole("button", { name: "Analizar enlace" }))

    await waitFor(() => {
      expect(onExtracted).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Senior Frontend Engineer",
          company: "Nexa Labs",
          description: "Desarrollador Frontend\nBuscamos React y TypeScript.",
          source: "url",
          url: JOB_URL,
        })
      )
    })
  })

  it("muestra el error devuelto por el backend", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse(
        { detail: "No se pudo obtener la descripción desde la URL." },
        { ok: false, status: 502 }
      )
    )
    const onExtracted = jest.fn()
    const user = userEvent.setup()

    render(<JobUrlForm onExtracted={onExtracted} />)
    await user.type(screen.getByLabelText("Enlace de la oferta"), JOB_URL)
    await user.click(screen.getByRole("button", { name: "Analizar enlace" }))

    expect(
      await screen.findByText("No se pudo obtener la descripción desde la URL.")
    ).toBeInTheDocument()
    expect(onExtracted).not.toHaveBeenCalled()
  })

  it("valida el protocolo antes de llamar al backend", async () => {
    const onExtracted = jest.fn()
    const user = userEvent.setup()

    render(<JobUrlForm onExtracted={onExtracted} />)
    await user.type(screen.getByLabelText("Enlace de la oferta"), "ftp://example.com/job")
    await user.click(screen.getByRole("button", { name: "Analizar enlace" }))

    expect(
      await screen.findByText("Solo se permiten URLs http o https.")
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
