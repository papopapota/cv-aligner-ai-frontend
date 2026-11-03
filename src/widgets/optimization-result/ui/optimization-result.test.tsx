import { beforeEach, describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import { saveOptimizationResult } from "@/features/optimize-cv"
import { OptimizationResult } from "./optimization-result"

describe("OptimizationResult", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("muestra el estado vacío cuando no hay resultado", async () => {
    render(<OptimizationResult />)

    expect(
      await screen.findByText("Aún no hay análisis disponible")
    ).toBeInTheDocument()
  })

  it("muestra el contenido y los scores reales", async () => {
    saveOptimizationResult({
      optimized_content: "Contenido optimizado del CV",
      original_variance_score: 0.8,
      optimized_variance_score: 0.2,
      writer_attempts: 2,
      is_within_threshold: true,
    })

    render(<OptimizationResult />)

    expect(
      await screen.findByText("Contenido optimizado del CV")
    ).toBeInTheDocument()
    expect(screen.getByText("80%")).toBeInTheDocument()
    expect(screen.getByText("20%")).toBeInTheDocument()
    expect(screen.getByText("Intentos del redactor: 2")).toBeInTheDocument()
    expect(screen.getByText("Dentro del umbral")).toBeInTheDocument()
  })
})
