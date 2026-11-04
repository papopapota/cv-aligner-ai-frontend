import { createApplicationSchema } from "@/features/create-application"

describe("createApplicationSchema", () => {
  it("normaliza los espacios del puesto y la empresa", () => {
    expect(
      createApplicationSchema.parse({
        jobTitle: "  Analista de datos ",
        company: " Empresa ABC  ",
      })
    ).toEqual({
      jobTitle: "Analista de datos",
      company: "Empresa ABC",
    })
  })

  it("rechaza campos vacíos o compuestos solo por espacios", () => {
    const result = createApplicationSchema.safeParse({
      jobTitle: "   ",
      company: "",
    })

    expect(result.success).toBe(false)
  })

  it("rechaza valores demasiado largos", () => {
    const result = createApplicationSchema.safeParse({
      jobTitle: "a".repeat(121),
      company: "Empresa ABC",
    })

    expect(result.success).toBe(false)
  })
})
