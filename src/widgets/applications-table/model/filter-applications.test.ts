import type { Application } from "@/entities/application"

import {
  filterApplications,
  formatApplicationDate,
} from "@/widgets/applications-table"

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    userId: 7,
    jobTitle: "Analista de datos",
    company: "Empresa ABC",
    status: "pending",
    createdAt: "2026-10-18T10:00:00Z",
    ...overrides,
  }
}

const applications: Application[] = [
  application(),
  application({
    id: 2,
    jobTitle: "Especialista en BI",
    company: "Empresa XYZ",
    status: "under-review",
    createdAt: "2026-10-16T10:00:00Z",
  }),
  application({
    id: 3,
    jobTitle: "Analista de negocio",
    company: "Empresa de ejemplo",
    status: "accepted",
    createdAt: "2026-10-12T10:00:00Z",
  }),
]

describe("filterApplications", () => {
  it("busca por puesto o empresa sin distinguir mayúsculas", () => {
    const byCompany = filterApplications(applications, {
      search: "xyz",
      status: "all",
      dateOrder: "newest",
    })
    const byTitle = filterApplications(applications, {
      search: "NEGOCIO",
      status: "all",
      dateOrder: "newest",
    })

    expect(byCompany.map((item) => item.id)).toEqual([2])
    expect(byTitle.map((item) => item.id)).toEqual([3])
  })

  it("filtra por estado", () => {
    const result = filterApplications(applications, {
      search: "",
      status: "accepted",
      dateOrder: "newest",
    })

    expect(result.map((item) => item.id)).toEqual([3])
  })

  it("ordena por fecha de la más reciente a la más antigua y viceversa", () => {
    const newest = filterApplications(applications, {
      search: "",
      status: "all",
      dateOrder: "newest",
    })
    const oldest = filterApplications(applications, {
      search: "",
      status: "all",
      dateOrder: "oldest",
    })

    expect(newest.map((item) => item.id)).toEqual([1, 2, 3])
    expect(oldest.map((item) => item.id)).toEqual([3, 2, 1])
  })
})

describe("formatApplicationDate", () => {
  it("formatea la fecha como dd/mm/yyyy sin desplazarla por zona horaria", () => {
    expect(formatApplicationDate("2026-10-18T00:00:00")).toBe("18/10/2026")
    expect(formatApplicationDate("2026-10-18T23:59:59Z")).toBe("18/10/2026")
  })

  it("devuelve un guion cuando la fecha no es válida", () => {
    expect(formatApplicationDate("sin-fecha")).toBe("—")
  })
})
