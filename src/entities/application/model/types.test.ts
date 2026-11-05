import {
  applicationListSchema,
  isApplicationStatus,
  toApplication,
  type ApplicationApi,
} from "@/entities/application"

const row: ApplicationApi = {
  id: 1,
  user_id: 7,
  job_title: "Desarrollador Frontend",
  company: "Tech Corp",
  status: "under-review",
  created_at: "2026-01-15T10:30:00Z",
}

describe("toApplication", () => {
  it("mapea el payload snake_case del backend al modelo del frontend", () => {
    expect(toApplication(row)).toEqual({
      id: 1,
      userId: 7,
      jobTitle: "Desarrollador Frontend",
      company: "Tech Corp",
      status: "under-review",
      createdAt: "2026-01-15T10:30:00Z",
    })
  })

  it("normaliza estados desconocidos a pending", () => {
    expect(toApplication({ ...row, status: "invented" }).status).toBe("pending")
  })
})

describe("applicationListSchema", () => {
  it("acepta la respuesta real del endpoint", () => {
    expect(applicationListSchema.safeParse([row]).success).toBe(true)
  })

  it("rechaza payloads incompatibles", () => {
    expect(applicationListSchema.safeParse({ id: 1 }).success).toBe(false)
  })
})

describe("isApplicationStatus", () => {
  it("reconoce los estados soportados por el backend", () => {
    expect(isApplicationStatus("pending")).toBe(true)
    expect(isApplicationStatus("under-review")).toBe(true)
    expect(isApplicationStatus("invented")).toBe(false)
  })
})
