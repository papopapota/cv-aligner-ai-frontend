jest.mock("jspdf", () => {
  const doc = {
    internal: {
      pageSize: { getWidth: () => 612, getHeight: () => 792 },
    },
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    splitTextToSize: jest.fn((value: string) => [value]),
    getTextWidth: jest.fn((value: string) => value.length * 5),
    text: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
  }

  return { jsPDF: jest.fn(() => doc), __doc: doc }
})

import { beforeEach, describe, expect, jest, it } from "@jest/globals"
import type { CvBlock } from "../model/cv-document"
import { exportCvToPdf } from "./export-cv-pdf"

interface MockDoc {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } }
  setFont: jest.Mock<(...args: unknown[]) => unknown>
  setFontSize: jest.Mock<(...args: unknown[]) => unknown>
  setTextColor: jest.Mock<(...args: unknown[]) => unknown>
  setDrawColor: jest.Mock<(...args: unknown[]) => unknown>
  setLineWidth: jest.Mock<(...args: unknown[]) => unknown>
  splitTextToSize: jest.Mock<(text: string, width: number) => string[]>
  getTextWidth: jest.Mock<(text: string) => number>
  text: jest.Mock<(...args: unknown[]) => unknown>
  line: jest.Mock<(...args: unknown[]) => unknown>
  addPage: jest.Mock<() => unknown>
  save: jest.Mock<(filename: string) => unknown>
}

const { __doc: mockDoc, jsPDF: jsPDFConstructor } = jest.requireMock<{
  __doc: MockDoc
  jsPDF: jest.Mock<(options: { unit: string; format: string }) => unknown>
}>("jspdf")

const blocks: CvBlock[] = [
  {
    id: "skills",
    heading: "Habilidades Técnicas",
    body: "Frameworks: React, Node.js.",
  },
  {
    id: "experience",
    heading: "Experiencia",
    body: "ACME | Madrid\nSenior Engineer | 2020 – 2023\n- Lideró la migración",
  },
  {
    id: "summary",
    heading: "Resumen Profesional",
    body: "Ingeniera de software con experiencia.",
  },
]

const personalInfo = {
  full_name: "Ada Lovelace",
  headline: "Engineering Manager",
  email: "ada@example.com",
  phone: "+34 600 000 000",
  location: { city: "Madrid", country: "España" },
}

describe("exportCvToPdf", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("usa Letter, Times y paleta monocromática", async () => {
    await exportCvToPdf({ personalInfo, blocks, filename: "harvard.pdf" })

    expect(jsPDFConstructor).toHaveBeenCalledWith({
      unit: "pt",
      format: "letter",
    })
    expect(mockDoc.setFont).toHaveBeenCalledWith("times", "bold")
    expect(mockDoc.setFont).toHaveBeenCalledWith("times", "italic")
    expect(mockDoc.setFont).not.toHaveBeenCalledWith(
      "helvetica",
      expect.anything()
    )
    expect(
      mockDoc.setTextColor.mock.calls.every(([color]) => color === "#000000")
    ).toBe(true)
    expect(mockDoc.setDrawColor).toHaveBeenCalledWith("#000000")
    expect(mockDoc.save).toHaveBeenCalledWith("harvard.pdf")
  })

  it("centrado del encabezado, reglas de sección y jerarquía Harvard", async () => {
    await exportCvToPdf({ personalInfo, blocks })

    const texts = mockDoc.text.mock.calls.map((call) => call[0])

    expect(texts).toContain("Ada Lovelace")
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Ada Lovelace",
      306,
      expect.any(Number),
      { align: "center" }
    )
    expect(texts).toContain("RESUMEN PROFESIONAL")
    expect(texts).toContain("EXPERIENCIA")
    expect(texts).toContain("HABILIDADES TÉCNICAS")
    expect(texts.indexOf("RESUMEN PROFESIONAL")).toBeLessThan(
      texts.indexOf("EXPERIENCIA")
    )
    expect(texts.indexOf("EXPERIENCIA")).toBeLessThan(
      texts.indexOf("HABILIDADES TÉCNICAS")
    )
    expect(mockDoc.line).toHaveBeenCalledWith(
      54,
      expect.any(Number),
      558,
      expect.any(Number)
    )
  })

  it("alinea empresa y fechas a extremos y dibuja viñetas con sangría", async () => {
    await exportCvToPdf({ personalInfo, blocks })

    expect(mockDoc.text).toHaveBeenCalledWith(
      "Madrid",
      558,
      expect.any(Number),
      { align: "right" }
    )
    expect(mockDoc.text).toHaveBeenCalledWith(
      "2020 – 2023",
      558,
      expect.any(Number),
      { align: "right" }
    )
    expect(mockDoc.text).toHaveBeenCalledWith("•", 54, expect.any(Number))
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Lideró la migración",
      66,
      expect.any(Number)
    )
    expect(mockDoc.save).toHaveBeenCalledWith("cv-optimizado.pdf")
  })

  it("añade una página limpia cuando el contenido no cabe", async () => {
    const longBlocks: CvBlock[] = [
      {
        id: "summary",
        heading: "Resumen Profesional",
        body: Array.from(
          { length: 60 },
          (_, index) => `Logro número ${index + 1}`
        ).join("\n\n"),
      },
    ]

    await exportCvToPdf({ personalInfo, blocks: longBlocks })

    expect(mockDoc.addPage).toHaveBeenCalled()
  })
})
