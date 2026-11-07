import { describe, expect, it } from "@jest/globals"

import { buildDimensionComparisons } from "./dimension-comparison"

describe("buildDimensionComparisons", () => {
  it("devuelve las dimensiones en orden canónico con sus etiquetas", () => {
    const comparisons = buildDimensionComparisons(
      {
        experience: 0.48,
        technical_skills: 0.71,
        certifications: 0.58,
        languages: 0.57,
        education: 0.54,
      },
      {
        experience: 0.49,
        technical_skills: 0.74,
        certifications: 0.69,
        languages: 0.57,
        education: 0.55,
      }
    )

    expect(comparisons.map(({ key, label }) => ({ key, label }))).toEqual([
      { key: "certifications", label: "Certificaciones" },
      { key: "education", label: "Formación" },
      { key: "experience", label: "Experiencia" },
      { key: "languages", label: "Idiomas" },
      { key: "technical_skills", label: "Habilidades técnicas" },
    ])
    expect(comparisons.map(({ original }) => original)).toEqual([
      0.58, 0.54, 0.48, 0.57, 0.71,
    ])
    expect(comparisons.map(({ optimized }) => optimized)).toEqual([
      0.69, 0.55, 0.49, 0.57, 0.74,
    ])
    expect(comparisons[2].delta).toBeCloseTo(0.01)
    expect(comparisons[3].delta).toBeCloseTo(0)
    expect(comparisons[4].delta).toBeCloseTo(0.03)
  })

  it("solo incluye las dimensiones presentes en ambos lados", () => {
    const comparisons = buildDimensionComparisons(
      {
        experience: 0.5,
        languages: 0.4,
        certifications: 0.3,
      },
      {
        experience: 0.6,
        technical_skills: 0.7,
        certifications: 0.5,
      }
    )

    expect(comparisons.map(({ key }) => key)).toEqual([
      "certifications",
      "experience",
    ])
  })

  it("calcula deltas negativos cuando la dimensión empeora", () => {
    const comparisons = buildDimensionComparisons(
      {
        experience: 0.5,
        languages: 0.5,
        technical_skills: 0.5,
      },
      {
        experience: 0.4,
        languages: 0.5,
        technical_skills: 0.6,
      }
    )

    expect(comparisons[0].delta).toBeCloseTo(-0.1)
    expect(comparisons[2].delta).toBeCloseTo(0.1)
  })

  it("genera etiquetas para dimensiones desconocidas", () => {
    const comparisons = buildDimensionComparisons(
      { soft_skills: 0.4 },
      { soft_skills: 0.6 }
    )

    expect(comparisons).toHaveLength(1)
    expect(comparisons[0]).toMatchObject({
      key: "soft_skills",
      label: "soft skills",
      original: 0.4,
      optimized: 0.6,
    })
    expect(comparisons[0].delta).toBeCloseTo(0.2)
  })

  it("devuelve una lista vacía cuando no hay dimensiones comunes", () => {
    const comparisons = buildDimensionComparisons(
      { experience: 0.5 },
      { languages: 0.6 }
    )

    expect(comparisons).toEqual([])
  })
})
