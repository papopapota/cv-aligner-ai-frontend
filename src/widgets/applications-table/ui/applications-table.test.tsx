import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ApplicationsTable } from "@/widgets/applications-table"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApplicationsTable />
    </QueryClientProvider>
  )
}

const applications = [
  {
    id: 1,
    user_id: 7,
    job_title: "Analista de datos",
    company: "Empresa ABC",
    status: "pending",
    created_at: "2026-10-18T10:00:00Z",
  },
  {
    id: 2,
    user_id: 7,
    job_title: "Especialista en BI",
    company: "Empresa XYZ",
    status: "under-review",
    created_at: "2026-10-16T10:00:00Z",
  },
]

describe("ApplicationsTable", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("consume GET /applications y muestra la tabla con el resumen", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(applications))

    renderTable()

    expect(
      await screen.findByText("Control de Postulaciones")
    ).toBeInTheDocument()
    expect(await screen.findByText("Analista de datos")).toBeInTheDocument()
    expect(screen.getByText("Empresa ABC")).toBeInTheDocument()
    expect(screen.getByText("18/10/2026")).toBeInTheDocument()
    expect(screen.getByText("2 postulaciones registradas")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/applications"),
      expect.objectContaining({ method: "GET" })
    )
  })

  it("filtra por puesto o empresa desde el buscador", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(jsonResponse(applications))

    renderTable()

    await screen.findByText("Analista de datos")
    await user.type(
      screen.getByLabelText("Buscar por puesto o empresa"),
      "xyz"
    )

    expect(screen.getByText("Especialista en BI")).toBeInTheDocument()
    expect(screen.queryByText("Analista de datos")).not.toBeInTheDocument()
    expect(screen.getByText("1 postulación registrada")).toBeInTheDocument()
  })

  it("filtra por estado desde el selector", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(jsonResponse(applications))

    renderTable()

    await screen.findByText("Analista de datos")
    await user.selectOptions(
      screen.getByLabelText("Filtrar por estado"),
      "under-review"
    )

    expect(screen.getByText("Especialista en BI")).toBeInTheDocument()
    expect(screen.queryByText("Analista de datos")).not.toBeInTheDocument()
  })

  it("muestra un mensaje de sesión cuando el backend responde 401", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ detail: "Not authenticated" }, 401)
    )

    renderTable()

    expect(
      await screen.findByText("Inicia sesión para ver tus postulaciones.")
    ).toBeInTheDocument()
  })

  it("muestra un estado vacío cuando no hay postulaciones", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]))

    renderTable()

    expect(
      await screen.findByText("Aún no tienes postulaciones registradas.")
    ).toBeInTheDocument()
  })

  it("abre el detalle de una postulación", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(jsonResponse(applications))

    renderTable()

    await screen.findByText("Analista de datos")
    await user.click(screen.getAllByRole("button", { name: "Ver" })[0])

    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByText("Detalle de la postulación registrada.")
    ).toBeInTheDocument()
    expect(within(dialog).getByText("Empresa ABC")).toBeInTheDocument()
    expect(within(dialog).getByText("18/10/2026")).toBeInTheDocument()
  })

  it("elimina una postulación tras confirmar el diálogo", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(jsonResponse(applications))
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204))
    fetchMock.mockResolvedValueOnce(jsonResponse([applications[1]]))

    renderTable()

    await screen.findByText("Analista de datos")
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0])

    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/applications/1"),
        expect.objectContaining({ method: "DELETE" })
      )
    })
  })
})
