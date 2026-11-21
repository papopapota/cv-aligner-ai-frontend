import { jobDescriptionSchema } from "./job-description-schema"

describe("jobDescriptionSchema", () => {
  it("acepta una descripción no vacía", () => {
    expect(
      jobDescriptionSchema.safeParse({ description: "  Buscamos Python.  " }).success
    ).toBe(true)
  })

  it("acepta título y empresa devueltos por la web", () => {
    const result = jobDescriptionSchema.parse({
      title: "  Backend Engineer  ",
      company: "  Acme Corp ",
      description: "Buscamos Python.",
    })

    expect(result).toEqual({
      title: "Backend Engineer",
      company: "Acme Corp",
      description: "Buscamos Python.",
    })
  })

  it("acepta título y empresa nulos", () => {
    expect(
      jobDescriptionSchema.safeParse({
        title: null,
        company: null,
        description: "Buscamos Python.",
      }).success
    ).toBe(true)
  })

  it("rechaza una descripción vacía", () => {
    expect(jobDescriptionSchema.safeParse({ description: "   " }).success).toBe(
      false
    )
  })
})
