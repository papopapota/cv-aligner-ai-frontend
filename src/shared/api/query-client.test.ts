import { ApiError, buildUrl } from "@/shared/api/query-client"

describe("buildUrl", () => {
  it("serializa los parámetros e ignora nulos o indefinidos", () => {
    const url = buildUrl("/applications", {
      user_id: 7,
      status: "pending",
      empty: null,
      missing: undefined,
    })

    expect(url).toContain("/applications?")
    expect(url).toContain("user_id=7")
    expect(url).toContain("status=pending")
    expect(url).not.toContain("empty")
    expect(url).not.toContain("missing")
  })

  it("no agrega query string cuando no hay parámetros", () => {
    expect(buildUrl("/applications")).toMatch(/\/applications$/)
  })
})

describe("ApiError", () => {
  it("conserva el status HTTP para distinguir el 401", () => {
    const error = new ApiError("No autenticado", 401)

    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(401)
    expect(error.name).toBe("ApiError")
  })
})
