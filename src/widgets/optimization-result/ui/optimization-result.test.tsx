import { beforeEach, describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import {
  saveOptimizationResult,
  type CvOptimizationResult,
} from "@/features/optimize-cv"
import { OptimizationResult } from "./optimization-result"

function saveResult(overrides: Partial<CvOptimizationResult> = {}) {
  saveOptimizationResult({
    optimized_content: "Contenido optimizado del CV",
    original_variance_score: 0.8,
    optimized_variance_score: 0.2,
    writer_attempts: 2,
    is_within_threshold: true,
    original_ic: 47.4,
    optimized_ic: 52.5,
    original_per_dimension: {
      certifications: 0.58,
      education: 0.54,
      experience: 0.48,
      languages: 0.57,
      technical_skills: 0.71,
    },
    optimized_per_dimension: {
      certifications: 0.69,
      education: 0.55,
      experience: 0.49,
      languages: 0.57,
      technical_skills: 0.74,
    },
    gap_report: "Falta experiencia específica en Node.js.",
    ...overrides,
  })
}

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

  it("muestra el contenido, los scores y las dimensiones reales", async () => {
    saveResult()

    render(<OptimizationResult />)

    expect(
      await screen.findByText("Contenido optimizado del CV")
    ).toBeInTheDocument()
    expect(screen.getByText("80%")).toBeInTheDocument()
    expect(screen.getByText("20%")).toBeInTheDocument()
    expect(screen.getByText("47.4")).toBeInTheDocument()
    expect(screen.getByText("52.5")).toBeInTheDocument()
    expect(screen.getByText("Certificaciones")).toBeInTheDocument()
    expect(screen.getByText("Formación")).toBeInTheDocument()
    expect(screen.getByText("Experiencia")).toBeInTheDocument()
    expect(screen.getByText("Idiomas")).toBeInTheDocument()
    expect(screen.getByText("Habilidades técnicas")).toBeInTheDocument()
    expect(
      screen.getByText("Falta experiencia específica en Node.js.")
    ).toBeInTheDocument()
    expect(screen.getByText("Intentos del redactor: 2")).toBeInTheDocument()
    expect(screen.getByText("Dentro del umbral")).toBeInTheDocument()
  })

  it("muestra un mensaje neutro cuando no hay brechas", async () => {
    saveResult({ gap_report: "" })

    render(<OptimizationResult />)

    expect(
      await screen.findByText("No se detectaron brechas relevantes.")
    ).toBeInTheDocument()
  })

  it("solo muestra las dimensiones presentes en ambos lados", async () => {
    saveResult({
      original_per_dimension: {
        experience: 0.48,
        certifications: 0.58,
      },
      optimized_per_dimension: {
        experience: 0.49,
        technical_skills: 0.74,
      },
    })

    render(<OptimizationResult />)

    expect(await screen.findByText("Experiencia")).toBeInTheDocument()
    expect(screen.queryByText("Certificaciones")).not.toBeInTheDocument()
    expect(screen.queryByText("Habilidades técnicas")).not.toBeInTheDocument()
  })

  it("muestra un mensaje cuando no hay dimensiones comunes", async () => {
    saveResult({
      original_per_dimension: { experience: 0.48 },
      optimized_per_dimension: { languages: 0.57 },
    })

    render(<OptimizationResult />)

    expect(
      await screen.findByText("No hay dimensiones comparables disponibles.")
    ).toBeInTheDocument()
  })
})
