import { describe, expect, it } from "@jest/globals"

import { cvOptimizationResultSchema } from "./optimization-result"

function createPayload() {
  return {
    optimized_content: "Contenido optimizado",
    original_variance_score: 0.8,
    optimized_variance_score: 0.2,
    writer_attempts: 2,
    is_within_threshold: true,
    original_ic: 47.42792536818668,
    optimized_ic: 52.526491409966816,
    original_per_dimension: {
      experience: 0.487,
      languages: 0.578,
      technical_skills: 0.712,
    },
    optimized_per_dimension: {
      experience: 0.48753576009618216,
      languages: 0.5783152165695601,
      technical_skills: 0.7422323118510642,
    },
    gap_report: "Falta experiencia específica en Node.js.",
  }
}

describe("cvOptimizationResultSchema", () => {
  it("acepta una respuesta válida del backend", () => {
    const parsed = cvOptimizationResultSchema.safeParse(createPayload())

    expect(parsed.success).toBe(true)
  })

  it("acepta un gap_report vacío", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      ...createPayload(),
      gap_report: "",
    })

    expect(parsed.success).toBe(true)
  })

  it("rechaza scores fuera del rango 0..1", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      ...createPayload(),
      original_variance_score: 1.2,
    })

    expect(parsed.success).toBe(false)
  })

  it("rechaza intentos negativos", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      ...createPayload(),
      writer_attempts: -1,
    })

    expect(parsed.success).toBe(false)
  })

  it("rechaza dimensiones fuera del rango 0..1", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      ...createPayload(),
      optimized_per_dimension: {
        experience: 1.2,
        languages: 0.578,
        technical_skills: 0.742,
      },
    })

    expect(parsed.success).toBe(false)
  })

  it("rechaza un IC negativo", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      ...createPayload(),
      original_ic: -1,
    })

    expect(parsed.success).toBe(false)
  })
})
