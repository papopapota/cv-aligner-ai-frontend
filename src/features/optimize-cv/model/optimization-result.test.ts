import { describe, expect, it } from "@jest/globals"

import { cvOptimizationResultSchema } from "./optimization-result"

describe("cvOptimizationResultSchema", () => {
  it("acepta una respuesta válida del backend", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      optimized_content: "Contenido optimizado",
      original_variance_score: 0.8,
      optimized_variance_score: 0.2,
      writer_attempts: 2,
      is_within_threshold: true,
    })

    expect(parsed.success).toBe(true)
  })

  it("rechaza scores fuera del rango 0..1", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      optimized_content: "Contenido optimizado",
      original_variance_score: 1.2,
      optimized_variance_score: 0.2,
      writer_attempts: 2,
      is_within_threshold: true,
    })

    expect(parsed.success).toBe(false)
  })

  it("rechaza intentos negativos", () => {
    const parsed = cvOptimizationResultSchema.safeParse({
      optimized_content: "Contenido optimizado",
      original_variance_score: 0.8,
      optimized_variance_score: 0.2,
      writer_attempts: -1,
      is_within_threshold: true,
    })

    expect(parsed.success).toBe(false)
  })
})
