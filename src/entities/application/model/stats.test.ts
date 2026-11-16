import type { Application } from "./types"
import { getApplicationsStatusStats } from "./stats"

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    userId: 7,
    jobTitle: "Puesto",
    company: "Empresa",
    status: "pending",
    createdAt: "2026-10-18T10:00:00Z",
    ...overrides,
  }
}

describe("getApplicationsStatusStats", () => {
  it("devuelve ceros y todos los estados cuando no hay postulaciones", () => {
    const stats = getApplicationsStatusStats([])

    expect(stats.total).toBe(0)
    expect(stats.byStatus).toHaveLength(4)
    expect(stats.byStatus.map((item) => item.status)).toEqual([
      "pending",
      "under-review",
      "accepted",
      "rejected",
    ])
    expect(stats.byStatus.every((item) => item.count === 0)).toBe(true)
    expect(stats.byStatus.every((item) => item.percentage === 0)).toBe(true)
  })

  it("calcula totales, conteos y porcentajes por estado", () => {
    const stats = getApplicationsStatusStats([
      application({ id: 1, status: "pending" }),
      application({ id: 2, status: "pending" }),
      application({ id: 3, status: "pending" }),
      application({ id: 4, status: "under-review" }),
      application({ id: 5, status: "accepted" }),
      application({ id: 6, status: "rejected" }),
    ])

    expect(stats.total).toBe(6)
    expect(stats.byStatus).toEqual([
      { status: "pending", label: "Enviada", count: 3, percentage: 50 },
      { status: "under-review", label: "En revisión", count: 1, percentage: 16.7 },
      { status: "accepted", label: "Aceptada", count: 1, percentage: 16.7 },
      { status: "rejected", label: "Rechazada", count: 1, percentage: 16.7 },
    ])
  })

  it("incluye estados con conteo cero", () => {
    const stats = getApplicationsStatusStats([
      application({ id: 1, status: "accepted" }),
      application({ id: 2, status: "accepted" }),
      application({ id: 3, status: "accepted" }),
      application({ id: 4, status: "accepted" }),
      application({ id: 5, status: "accepted" }),
      application({ id: 6, status: "accepted" }),
    ])

    expect(stats.byStatus.find((item) => item.status === "accepted")).toEqual({
      status: "accepted",
      label: "Aceptada",
      count: 6,
      percentage: 100,
    })
    expect(stats.byStatus.find((item) => item.status === "pending")).toEqual({
      status: "pending",
      label: "Enviada",
      count: 0,
      percentage: 0,
    })
  })
})
