import type { PersonalInfo } from "@/entities/cv"
import type { CvBlock } from "../model/cv-document"
import {
  buildHarvardDocument,
  type HarvardEntry,
  type HarvardLine,
} from "../model/harvard-document"

interface ExportCvPdfInput {
  personalInfo?: PersonalInfo
  blocks: CvBlock[]
  filename?: string
}

type FontStyle = "normal" | "bold" | "italic"
type TextAlign = "left" | "center" | "right"

const FONT_FAMILY = "times"
const TEXT_COLOR = "#000000"
const PAGE_FORMAT = "letter"
const MARGIN = 54
const NAME_SIZE = 17
const HEADLINE_SIZE = 10
const CONTACT_SIZE = 9.5
const SECTION_SIZE = 11.5
const BODY_SIZE = 10
const LINE_SPACING = 1.15
const BULLET_INDENT = 12
const COLUMN_GAP = 8
const SECTION_GAP = 10
const ENTRY_GAP = 3

export async function exportCvToPdf({
  personalInfo,
  blocks,
  filename = "cv-optimizado.pdf",
}: ExportCvPdfInput): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "pt", format: PAGE_FORMAT })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const columnWidth = (contentWidth - COLUMN_GAP) * 0.6
  let y = MARGIN

  const setStyle = (size: number, style: FontStyle) => {
    doc.setFont(FONT_FAMILY, style)
    doc.setFontSize(size)
    doc.setTextColor(TEXT_COLOR)
  }

  const wrap = (text: string, width: number): string[] =>
    doc.splitTextToSize(text, width) as string[]

  const measureText = (
    text: string,
    width: number,
    size: number,
    style: FontStyle
  ): number => {
    setStyle(size, style)
    return wrap(text, width).length * size * LINE_SPACING
  }

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  const renderText = (
    text: string,
    x: number,
    width: number,
    size: number,
    style: FontStyle,
    align: TextAlign,
    startY: number
  ): number => {
    setStyle(size, style)
    const lineHeight = size * LINE_SPACING
    const lines = wrap(text, width)

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight

      if (align === "left") {
        doc.text(line, x, lineY)
      } else {
        doc.text(line, align === "center" ? pageWidth / 2 : pageWidth - MARGIN, lineY, {
          align,
        })
      }
    })

    return lines.length * lineHeight
  }

  const drawText = (
    text: string,
    width: number,
    size: number,
    style: FontStyle,
    align: TextAlign = "left"
  ) => {
    const height = measureText(text, width, size, style)
    ensureSpace(height)
    renderText(text, MARGIN, width, size, style, align, y)
    y += height
  }

  const keyWidthFor = (key: string): number => {
    setStyle(BODY_SIZE, "bold")
    return Math.min(doc.getTextWidth(key), contentWidth * 0.5)
  }

  const measureLine = (line: HarvardLine): number => {
    if (line.kind === "row") {
      return Math.max(
        measureText(line.left, columnWidth, BODY_SIZE, "bold"),
        line.right
          ? measureText(line.right, contentWidth - columnWidth - COLUMN_GAP, BODY_SIZE, "italic")
          : 0
      )
    }

    if (line.kind === "bullet") {
      return measureText(
        line.left,
        contentWidth - BULLET_INDENT,
        BODY_SIZE,
        "normal"
      )
    }

    if (line.kind === "keyValue") {
      const keyWidth = keyWidthFor(line.left)
      const valueWidth = contentWidth - keyWidth - COLUMN_GAP

      return Math.max(
        measureText(line.left, keyWidth, BODY_SIZE, "bold"),
        line.right ? measureText(line.right, valueWidth, BODY_SIZE, "normal") : 0
      )
    }

    return measureText(line.left, contentWidth, BODY_SIZE, "normal")
  }

  const drawEntry = (entry: HarvardEntry) => {
    for (const line of entry.lines) {
      const height = measureLine(line)
      ensureSpace(height + 1)
      const startY = y

      if (line.kind === "row") {
        renderText(line.left, MARGIN, columnWidth, BODY_SIZE, "bold", "left", startY)

        if (line.right) {
          renderText(
            line.right,
            pageWidth - MARGIN,
            contentWidth - columnWidth - COLUMN_GAP,
            BODY_SIZE,
            "italic",
            "right",
            startY
          )
        }
      } else if (line.kind === "bullet") {
        setStyle(BODY_SIZE, "normal")
        doc.text("•", MARGIN, startY)
        renderText(
          line.left,
          MARGIN + BULLET_INDENT,
          contentWidth - BULLET_INDENT,
          BODY_SIZE,
          "normal",
          "left",
          startY
        )
      } else if (line.kind === "keyValue") {
        const keyWidth = keyWidthFor(line.left)
        renderText(
          line.left,
          MARGIN,
          keyWidth,
          BODY_SIZE,
          "bold",
          "left",
          startY
        )

        if (line.right) {
          renderText(
            line.right,
            MARGIN + keyWidth + COLUMN_GAP,
            contentWidth - keyWidth - COLUMN_GAP,
            BODY_SIZE,
            "normal",
            "left",
            startY
          )
        }
      } else {
        renderText(
          line.left,
          MARGIN,
          contentWidth,
          BODY_SIZE,
          "normal",
          "left",
          startY
        )
      }

      y = startY + height + 1
    }
  }

  const harvard = buildHarvardDocument(personalInfo, blocks)

  if (harvard.name) {
    drawText(harvard.name, contentWidth, NAME_SIZE, "bold", "center")
  }

  if (harvard.headline) {
    drawText(harvard.headline, contentWidth, HEADLINE_SIZE, "normal", "center")
  }

  if (harvard.contact) {
    drawText(harvard.contact, contentWidth, CONTACT_SIZE, "normal", "center")
  }

  if (harvard.name || harvard.headline || harvard.contact) {
    y += 8
  }

  for (const section of harvard.sections) {
    const headingHeight = SECTION_SIZE * LINE_SPACING
    ensureSpace(headingHeight + 16)
    setStyle(SECTION_SIZE, "bold")
    doc.text(section.heading, MARGIN, y)
    y += 3
    doc.setDrawColor(TEXT_COLOR)
    doc.setLineWidth(0.75)
    doc.line(MARGIN, y, pageWidth - MARGIN, y)
    y += headingHeight + 2

    for (const entry of section.entries) {
      const entryHeight = entry.lines.reduce(
        (total, line, index) => total + measureLine(line) + (index > 0 ? 1 : 0),
        0
      )
      ensureSpace(entryHeight + ENTRY_GAP)
      drawEntry(entry)
      y += ENTRY_GAP
    }

    y += SECTION_GAP
  }

  doc.save(filename)
}
