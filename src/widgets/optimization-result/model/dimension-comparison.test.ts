import { describe, expect, it } from "@jest/globals"

import { buildDimensionComparisons } from "./dimension-comparison"

describe("buildDimensionComparisons", () => {
  it("devuelve las dimensiones en orden con sus etiquetas", () => {
    const comparisons = buildDimensionComparisons(
      {
        experience: 0.48,
        languages: 0.57,
        technical_skills: 0.71,
      },
      {
        experience: 0.49,
        languages: 0.57,
        technical_skills: 0.74,
      }
    )

    expect(comparisons).toHaveLength(3)
    expect(comparisons.map(({ key, label }) => ({ key, label }))).toEqual([
      { key: "experience", label: "Experiencia" },
      { key: "languages", label: "Idiomas" },
      { key: "technical_skills", label: "Habilidades técnicas" },
    ])
    expect(comparisons.map(({ original }) => original)).toEqual([
      0.48, 0.57, 0.71,
    ])
    expect(comparisons.map(({ optimized }) => optimized)).toEqual([
      0.49, 0.57, 0.74,
    ])
    expect(comparisons[0].delta).toBeCloseTo(0.01)
    expect(comparisons[1].delta).toBeCloseTo(0)
    expect(comparisons[2].delta).toBeCloseTo(0.03)
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
})
