import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { CreateApplicationDialog } from "@/features/create-application"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateApplicationDialog />
    </QueryClientProvider>
  )
}

describe("CreateApplicationDialog", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("valida los campos antes de enviar la postulación", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole("button", { name: /Agregar Postulación/ })
    )
    await user.click(
      screen.getByRole("button", { name: "Guardar postulación" })
    )

    expect(
      await screen.findByText("Indica el puesto de la postulación.")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Indica la empresa de la postulación.")
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("envía POST /applications con el contrato del backend", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: 1,
        user_id: 7,
        job_title: "Analista de datos",
        company: "Empresa ABC",
        status: "pending",
        created_at: "2026-10-18T10:00:00Z",
      })
    )

    renderDialog()

    await user.click(
      screen.getByRole("button", { name: /Agregar Postulación/ })
    )
    await user.type(screen.getByLabelText("Puesto"), "Analista de datos")
    await user.type(screen.getByLabelText("Empresa"), "Empresa ABC")
    await user.click(
      screen.getByRole("button", { name: "Guardar postulación" })
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/applications"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            job_title: "Analista de datos",
            company: "Empresa ABC",
          }),
        })
      )
    })
  })
})
