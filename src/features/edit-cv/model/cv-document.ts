import type { CvContentResponse, TechnicalData } from "@/entities/cv"

export interface CvBlock {
  id: string
  heading: string
  body: string
}

const SECTION_LABELS: Array<{ key: keyof TechnicalData; label: string }> = [
  { key: "summary", label: "Resumen Profesional" },
  { key: "technical_skills", label: "Habilidades Técnicas" },
  { key: "experience", label: "Experiencia" },
  { key: "projects", label: "Proyectos" },
  { key: "education", label: "Educación" },
  { key: "certifications", label: "Certificaciones" },
  { key: "languages", label: "Idiomas" },
]

const KNOWN_HEADINGS = new Set(
  SECTION_LABELS.map(({ label }) => normalizeHeading(label))
)

export function normalizeHeading(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function slugify(value: string): string {
  const normalized = normalizeHeading(value)
  return normalized.length > 0 ? normalized.replace(/\s+/g, "-") : "seccion"
}

function isMarkdownHeading(line: string): string | null {
  const match = /^#{1,6}\s+(.+)$/.exec(line.trim())
  return match ? match[1].trim() : null
}

function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim()

  if (trimmed.length === 0 || trimmed.length > 60) {
    return false
  }

  if (KNOWN_HEADINGS.has(normalizeHeading(trimmed))) {
    return true
  }

  if (trimmed.endsWith(":")) {
    return true
  }

  const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "")
  return letters.length > 2 && letters === letters.toUpperCase()
}

function pushBlock(
  blocks: CvBlock[],
  heading: string,
  lines: string[]
): void {
  const body = lines.join("\n").trim()

  if (body.length === 0) {
    return
  }

  blocks.push({
    id: `${slugify(heading)}-${blocks.length}`,
    heading,
    body,
  })
}

export function parseCvBlocks(source: string): CvBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  const blocks: CvBlock[] = []
  let currentHeading: string | null = null
  let currentLines: string[] = []
  let preamble: string[] = []
  let sawHeading = false

  const flush = () => {
    if (currentHeading === null) {
      const body = preamble.join("\n").trim()
      if (body.length > 0) {
        pushBlock(blocks, "Perfil", preamble)
      }
      preamble = []
      return
    }

    pushBlock(blocks, currentHeading, currentLines)
    currentLines = []
  }

  for (const line of lines) {
    const markdownHeading = isMarkdownHeading(line)

    if (markdownHeading) {
      flush()
      currentHeading = markdownHeading
      sawHeading = true
      continue
    }

    const isFirstContent =
      currentHeading === null &&
      preamble.every((preambleLine) => preambleLine.trim().length === 0)

    if ((currentHeading !== null || isFirstContent) && looksLikeHeading(line)) {
      flush()
      currentHeading = line.trim().replace(/:$/, "")
      sawHeading = true
      continue
    }

    if (currentHeading === null) {
      preamble.push(line)
    } else {
      currentLines.push(line)
    }
  }

  flush()

  if (sawHeading && blocks.length > 0) {
    return blocks
  }

  const paragraphs = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

  return paragraphs.map((paragraph, index) => ({
    id: `contenido-${index}`,
    heading: "Contenido",
    body: paragraph,
  }))
}

function buildBlocksFromTechnicalData(
  technicalData: TechnicalData
): CvBlock[] {
  const blocks: CvBlock[] = []

  for (const { key, label } of SECTION_LABELS) {
    const value = technicalData[key]

    if (typeof value !== "string" || value.trim().length === 0) {
      continue
    }

    blocks.push({
      id: `${slugify(label)}-${blocks.length}`,
      heading: label,
      body: value.trim(),
    })
  }

  return blocks
}

export function buildOriginalBlocks(content: CvContentResponse): CvBlock[] {
  const technicalData = content.structured_cv?.technical_data

  if (technicalData) {
    const blocks = buildBlocksFromTechnicalData(technicalData)

    if (blocks.length > 0) {
      return blocks
    }
  }

  return parseCvBlocks(content.raw_text)
}

export function findMatchingBlock(
  blocks: CvBlock[],
  heading: string
): CvBlock | undefined {
  const target = normalizeHeading(heading)

  return blocks.find((block) => normalizeHeading(block.heading) === target)
}

export type DiffSegmentType = "equal" | "added" | "removed"

export interface DiffSegment {
  type: DiffSegmentType
  value: string
}

function tokenize(value: string): string[] {
  return value.split(/(\s+)/).filter((token) => token.length > 0)
}

export function diffWords(original: string, current: string): DiffSegment[] {
  const left = tokenize(original)
  const right = tokenize(current)
  const rows = left.length + 1
  const columns = right.length + 1
  const matrix: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(columns).fill(0)
  )

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      matrix[i][j] =
        left[i] === right[j]
          ? matrix[i + 1][j + 1] + 1
          : Math.max(matrix[i + 1][j], matrix[i][j + 1])
    }
  }

  const segments: DiffSegment[] = []
  let i = 0
  let j = 0

  const append = (type: DiffSegmentType, value: string) => {
    const last = segments[segments.length - 1]

    if (last && last.type === type) {
      last.value += value
      return
    }

    segments.push({ type, value })
  }

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      append("equal", left[i])
      i += 1
      j += 1
    } else if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      append("removed", left[i])
      i += 1
    } else {
      append("added", right[j])
      j += 1
    }
  }

  while (i < left.length) {
    append("removed", left[i])
    i += 1
  }

  while (j < right.length) {
    append("added", right[j])
    j += 1
  }

  return segments
}

export function hasBlockChanges(original: string, current: string): boolean {
  return original.trim() !== current.trim()
}

export function countAchievements(text: string): number {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line)).length
}

export function serializeCvDocument(
  personalInfoLines: string[],
  blocks: CvBlock[]
): string {
  const parts = [
    ...personalInfoLines.filter((line) => line.trim().length > 0),
    ...blocks.flatMap((block) => [block.heading, block.body]),
  ]

  return parts.join("\n\n").trim()
}
