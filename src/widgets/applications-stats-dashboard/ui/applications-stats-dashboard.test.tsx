import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"

import { ApplicationsStatsDashboard } from "@/widgets/applications-stats-dashboard"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function application(id: number, status: string) {
  return {
    id,
    user_id: 7,
    job_title: `Puesto ${id}`,
    company: "Empresa",
    status,
    created_at: "2026-10-18T10:00:00Z",
  }
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApplicationsStatsDashboard />
    </QueryClientProvider>
  )
}

describe("ApplicationsStatsDashboard", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("muestra la vista restringida de Figma con menos de 6 postulaciones", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        application(1, "pending"),
        application(2, "accepted"),
        application(3, "rejected"),
      ])
    )

    const { container } = renderDashboard()

    expect(
      await screen.findByRole("heading", {
        name: "Registra más postulaciones para ver tus estadísticas",
      })
    ).toBeInTheDocument()
    expect(
      container.querySelectorAll(
        '[data-testid="restricted-background-bars"] > div'
      )
    ).toHaveLength(12)
    expect(
      screen.getByText("Requiere al menos 6 registros (Actual: 3/6)")
    ).toBeInTheDocument()
    expect(
      screen.getByText("50% del mínimo requerido")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("progressbar", {
        name: "Progreso hacia el mínimo requerido",
      })
    ).toHaveAttribute("aria-valuenow", "3")
    expect(
      screen.getByRole("link", { name: "Agregar Postulación" })
    ).toHaveAttribute("href", "/applications")
    expect(
      screen.queryByRole("heading", { name: "Postulaciones por estado" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Estadísticas" })
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Total")).not.toBeInTheDocument()
  })

  it("muestra el gráfico y las recomendaciones cuando hay 6 o más postulaciones", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        application(1, "pending"),
        application(2, "pending"),
        application(3, "pending"),
        application(4, "under-review"),
        application(5, "accepted"),
        application(6, "rejected"),
      ])
    )

    renderDashboard()

    expect(
      await screen.findByRole("heading", { name: "Postulaciones por estado" })
    ).toBeInTheDocument()
    expect(screen.getByText("Enviada (3)")).toBeInTheDocument()
    expect(screen.getByText("50% · 3 de 6")).toBeInTheDocument()
    expect(screen.getAllByText("16,7% · 1 de 6")).toHaveLength(3)
    expect(
      screen.getByText("Recomendaciones según tus registros")
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Has registrado 6 postulaciones/)
    ).toBeInTheDocument()
  })

  it("muestra mensaje de sesión cuando el backend responde 401", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ detail: "Not authenticated" }, 401)
    )

    renderDashboard()

    expect(
      await screen.findByText("Inicia sesión para ver tus estadísticas.")
    ).toBeInTheDocument()
  })
})
