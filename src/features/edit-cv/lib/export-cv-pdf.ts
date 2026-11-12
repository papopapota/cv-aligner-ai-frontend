import type { PersonalInfo } from "@/entities/cv"
import type { CvBlock } from "../model/cv-document"

interface ExportCvPdfInput {
  personalInfo?: PersonalInfo
  blocks: CvBlock[]
  filename?: string
}

function buildContactLine(personalInfo: PersonalInfo): string {
  const location = [personalInfo.location?.city, personalInfo.location?.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ")
  const links = [
    personalInfo.links?.linkedin,
    personalInfo.links?.github,
    personalInfo.links?.portfolio,
  ].filter((value): value is string => Boolean(value && value.trim()))

  return [personalInfo.email, personalInfo.phone, location, ...links]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" · ")
}

export async function exportCvToPdf({
  personalInfo,
  blocks,
  filename = "cv-optimizado.pdf",
}: ExportCvPdfInput): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const margin = 48
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = pageWidth - margin * 2
  let y = margin

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const write = (
    text: string,
    {
      size = 10,
      style = "normal",
      gap = 6,
      color = "#111111",
    }: {
      size?: number
      style?: "normal" | "bold" | "italic"
      gap?: number
      color?: string
    } = {}
  ) => {
    doc.setFont("helvetica", style)
    doc.setFontSize(size)
    doc.setTextColor(color)

    const lines = doc.splitTextToSize(text, maxWidth) as string[]
    const lineHeight = size * 1.4

    for (const line of lines) {
      ensureSpace(lineHeight)
      doc.text(line, margin, y)
      y += lineHeight
    }

    y += gap
  }

  if (personalInfo?.full_name) {
    write(personalInfo.full_name, { size: 20, style: "bold", gap: 4 })
  }

  if (personalInfo?.headline) {
    write(personalInfo.headline, { size: 12, color: "#444444", gap: 4 })
  }

  if (personalInfo) {
    const contact = buildContactLine(personalInfo)

    if (contact.length > 0) {
      write(contact, { size: 9, color: "#555555", gap: 12 })
    }
  }

  for (const block of blocks) {
    ensureSpace(40)
    write(block.heading, { size: 13, style: "bold", gap: 4 })
    write(block.body, { size: 10, gap: 12 })
  }

  doc.save(filename)
}
