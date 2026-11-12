import { describe, expect, it } from "@jest/globals"

import type { CvContentResponse } from "@/entities/cv"
import {
  buildCvSectionComparisons,
  buildOriginalBlocks,
  countAchievements,
  diffWords,
  findMatchingBlock,
  hasBlockChanges,
  parseCvBlocks,
  serializeCvDocument,
} from "./cv-document"

const CV_ID = "11111111-1111-4111-8111-111111111111"

function createContent(
  overrides: Partial<CvContentResponse> = {}
): CvContentResponse {
  return {
    id: CV_ID,
    status: "PARSED",
    raw_text: "Texto plano del CV",
    characters_extracted: 18,
    structured_cv: null,
    ...overrides,
  }
}

describe("parseCvBlocks", () => {
  it("separa secciones por encabezados markdown", () => {
    const blocks = parseCvBlocks(
      "## Resumen Profesional\nTexto de resumen\n\n## Experiencia\n- Logro uno"
    )

    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toMatchObject({
      heading: "Resumen Profesional",
      body: "Texto de resumen",
    })
    expect(blocks[1]).toMatchObject({
      heading: "Experiencia",
      body: "- Logro uno",
    })
  })

  it("detecta encabezados en mayúsculas sin markdown", () => {
    const blocks = parseCvBlocks("HABILIDADES TÉCNICAS\nReact, TypeScript")

    expect(blocks).toHaveLength(1)
    expect(blocks[0].heading).toBe("HABILIDADES TÉCNICAS")
    expect(blocks[0].body).toBe("React, TypeScript")
  })

  it("usa párrafos cuando no hay encabezados", () => {
    const blocks = parseCvBlocks("Primer párrafo\n\nSegundo párrafo")

    expect(blocks).toHaveLength(2)
    expect(blocks.map((block) => block.body)).toEqual([
      "Primer párrafo",
      "Segundo párrafo",
    ])
  })
})

describe("buildOriginalBlocks", () => {
  it("mapea technical_data a secciones legibles", () => {
    const blocks = buildOriginalBlocks(
      createContent({
        structured_cv: {
          technical_data: {
            summary: "Resumen original",
            technical_skills: "React",
            experience: "Acme",
            languages: "",
          },
        },
      })
    )

    expect(blocks.map((block) => block.heading)).toEqual([
      "Resumen Profesional",
      "Habilidades Técnicas",
      "Experiencia",
    ])
  })

  it("usa raw_text cuando no hay datos estructurados", () => {
    const blocks = buildOriginalBlocks(
      createContent({ raw_text: "RESUMEN\nContenido original" })
    )

    expect(blocks[0].heading).toBe("RESUMEN")
    expect(blocks[0].body).toBe("Contenido original")
  })
})

describe("buildCvSectionComparisons", () => {
  it("clasifica secciones sin cambios, modificadas, añadidas y eliminadas", () => {
    const comparisons = buildCvSectionComparisons({
      originalSections: {
        summary: "Resumen original",
        experience: "Experiencia original",
        education: "Formación original",
      },
      optimizedSections: {
        summary: "Resumen original",
        experience: "Experiencia optimizada",
        projects: "Proyecto nuevo",
      },
    })

    expect(
      comparisons.map((comparison) => [comparison.key, comparison.status])
    ).toEqual([
      ["summary", "unchanged"],
      ["experience", "modified"],
      ["projects", "added"],
      ["education", "removed"],
    ])
  })

  it("usa optimized_body cuando no hay optimized_sections", () => {
    const comparisons = buildCvSectionComparisons({
      originalSections: { summary: "Resumen original" },
      fallbackOptimizedBody:
        "## Resumen Profesional\nResumen optimizado\n\n## Experiencia\n- Logro",
    })

    expect(
      comparisons.map((comparison) => ({
        key: comparison.key,
        status: comparison.status,
        optimizedBody: comparison.optimizedBody,
      }))
    ).toEqual([
      {
        key: "summary",
        status: "modified",
        optimizedBody: "Resumen optimizado",
      },
      {
        key: "experience",
        status: "added",
        optimizedBody: "- Logro",
      },
    ])
  })

  it("incluye secciones originales que no están en el CV optimizado", () => {
    const comparisons = buildCvSectionComparisons({
      originalBlocks: [
        { id: "perfil-0", heading: "Perfil", body: "Perfil original" },
      ],
      optimizedSections: { summary: "Resumen nuevo" },
    })

    expect(comparisons).toContainEqual({
      key: "original-perfil-0",
      heading: "Perfil",
      originalBody: "Perfil original",
      optimizedBody: "",
      status: "removed",
    })
  })

  it("omite secciones vacías en ambos lados", () => {
    const comparisons = buildCvSectionComparisons({
      originalSections: { summary: "", experience: "   " },
      optimizedSections: { summary: "", projects: "" },
    })

    expect(comparisons).toEqual([])
  })

  it("no duplica secciones conocidas presentes en secciones y bloques", () => {
    const comparisons = buildCvSectionComparisons({
      originalSections: { summary: "Resumen original" },
      originalBlocks: [
        {
          id: "resumen-profesional-0",
          heading: "Resumen Profesional",
          body: "Resumen original",
        },
      ],
      optimizedSections: { summary: "Resumen optimizado" },
    })

    expect(comparisons).toHaveLength(1)
    expect(comparisons[0]).toMatchObject({
      key: "summary",
      status: "modified",
    })
  })
})

describe("findMatchingBlock", () => {
  it("ignora mayúsculas y acentos", () => {
    const blocks = parseCvBlocks("## Educacion\nContenido")
    const match = findMatchingBlock(blocks, "EDUCACIÓN")

    expect(match?.body).toBe("Contenido")
  })
})

describe("diffWords", () => {
  it("marca palabras añadidas y eliminadas", () => {
    const segments = diffWords("React y Vue", "React y Angular")
    const added = segments
      .filter((segment) => segment.type === "added")
      .map((segment) => segment.value)
      .join("")
    const removed = segments
      .filter((segment) => segment.type === "removed")
      .map((segment) => segment.value)
      .join("")

    expect(added.trim()).toBe("Angular")
    expect(removed.trim()).toBe("Vue")
  })

  it("devuelve un único segmento igual para textos idénticos", () => {
    expect(diffWords("mismo texto", "mismo texto")).toEqual([
      { type: "equal", value: "mismo texto" },
    ])
  })
})

describe("helpers de contenido", () => {
  it("detecta cambios ignorando espacios en los extremos", () => {
    expect(hasBlockChanges("Texto", "  Texto  ")).toBe(false)
    expect(hasBlockChanges("Texto", "Otro texto")).toBe(true)
  })

  it("cuenta logros en viñetas y listas numeradas", () => {
    expect(
      countAchievements("- Logro uno\n* Logro dos\n1. Logro tres\nTexto")
    ).toBe(3)
  })

  it("serializa la información personal y los bloques", () => {
    const document = serializeCvDocument(
      ["Ada Lovelace", "ada@example.com"],
      [{ id: "resumen-0", heading: "Resumen", body: "Contenido" }]
    )

    expect(document).toBe(
      "Ada Lovelace\n\nada@example.com\n\nResumen\n\nContenido"
    )
  })
})
