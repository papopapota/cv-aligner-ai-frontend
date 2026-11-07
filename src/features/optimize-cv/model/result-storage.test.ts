import { beforeEach, describe, expect, it } from "@jest/globals"

import type { CvOptimizationResult } from "./optimization-result"
import {
  clearOptimizationResult,
  readOptimizationResult,
  saveOptimizationResult,
} from "./result-storage"

const result: CvOptimizationResult = {
  optimized_content: "Contenido optimizado",
  original_variance_score: 0.8,
  optimized_variance_score: 0.2,
  writer_attempts: 2,
  is_within_threshold: true,
  original_ic: 47.4,
  optimized_ic: 52.5,
  original_per_dimension: {
    certifications: 0.586,
    education: 0.545,
    experience: 0.431,
    languages: 0.51,
    technical_skills: 0.624,
  },
  optimized_per_dimension: {
    certifications: 0.693,
    education: 0.548,
    experience: 0.452,
    languages: 0.51,
    technical_skills: 0.711,
  },
  gap_report: "Falta experiencia específica en Node.js.",
}

describe("result-storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("guarda y recupera un resultado válido", () => {
    saveOptimizationResult(result)

    expect(readOptimizationResult()).toEqual(result)
  })

  it("devuelve null cuando el contenido almacenado es inválido", () => {
    window.sessionStorage.setItem("cv-optimization-result", "{invalido")

    expect(readOptimizationResult()).toBeNull()
  })

  it("limpia el resultado almacenado", () => {
    saveOptimizationResult(result)
    clearOptimizationResult()

    expect(readOptimizationResult()).toBeNull()
  })
})
