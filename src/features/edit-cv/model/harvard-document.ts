import type { PersonalInfo } from "@/entities/cv"
import {
  CV_SECTION_DEFINITIONS,
  normalizeHeading,
  type CvBlock,
  type CvSectionKey,
} from "./cv-document"

export type HarvardLineKind = "paragraph" | "row" | "bullet" | "keyValue"

export interface HarvardLine {
  kind: HarvardLineKind
  left: string
  right?: string
}

export interface HarvardEntry {
  lines: HarvardLine[]
}

export interface HarvardSection {
  key: string
  heading: string
  entries: HarvardEntry[]
}

export interface HarvardDocument {
  name: string | null
  headline: string | null
  contact: string | null
  sections: HarvardSection[]
}

const SECTION_ORDER: Record<CvSectionKey, number> = {
  summary: 0,
  experience: 1,
  education: 2,
  technical_skills: 3,
  certifications: 4,
  languages: 5,
  projects: 6,
}

const KNOWN_SECTION_LABELS = new Map(
  CV_SECTION_DEFINITIONS.map(({ key, label }) => [normalizeHeading(label), key])
)

const BULLET_PATTERN = /^\s*(?:[-*•]|\d+[.)])\s+(.+)$/
const KEY_VALUE_PATTERN = /^\s*([^:]{2,60}):\s+(.+)$/
const ROW_SEPARATOR = /\s+\|\s+|\t+|\s{2,}/
const DASH_SEPARATOR = /\s+(?:-|\u2013|\u2014)\s+/

function clean(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : ""
}

function sectionRank(block: CvBlock): number {
  const key = KNOWN_SECTION_LABELS.get(normalizeHeading(block.heading))
  return key ? SECTION_ORDER[key] : Object.keys(SECTION_ORDER).length
}

export function buildContactLine(personalInfo: PersonalInfo): string | null {
  const location = [clean(personalInfo.location?.city), clean(personalInfo.location?.country)]
    .filter(Boolean)
    .join(", ")
  const links = [
    clean(personalInfo.links?.linkedin),
    clean(personalInfo.links?.github),
    clean(personalInfo.links?.portfolio),
  ].filter(Boolean)

  const parts = [
    location,
    clean(personalInfo.phone),
    clean(personalInfo.email),
    ...links,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(" | ") : null
}

function parseRow(value: string): HarvardLine | null {
  const parts = value.split(ROW_SEPARATOR).map(clean).filter(Boolean)

  if (parts.length >= 2) {
    return { kind: "row", left: parts[0], right: parts.slice(1).join(" | ") }
  }

  if (!/\d{4}/.test(value)) {
    const dashParts = value.split(DASH_SEPARATOR).map(clean).filter(Boolean)

    if (dashParts.length === 2) {
      return { kind: "row", left: dashParts[0], right: dashParts[1] }
    }
  }

  return null
}

function parseLine(value: string): HarvardLine | null {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }

  const bullet = BULLET_PATTERN.exec(trimmed)

  if (bullet) {
    return { kind: "bullet", left: bullet[1].trim() }
  }

  const keyValue = KEY_VALUE_PATTERN.exec(trimmed)

  if (keyValue && !/^https?$/i.test(keyValue[1].trim())) {
    return {
      kind: "keyValue",
      left: `${keyValue[1].trim()}:`,
      right: keyValue[2].trim(),
    }
  }

  return parseRow(trimmed) ?? { kind: "paragraph", left: trimmed }
}

function groupEntries(lines: HarvardLine[]): HarvardEntry[] {
  const entries: HarvardEntry[] = []
  let current: HarvardLine[] = []
  let currentKind: HarvardLineKind | null = null

  const flush = () => {
    if (current.length > 0) {
      entries.push({ lines: current })
      current = []
      currentKind = null
    }
  }

  for (const line of lines) {
    if (line.kind === "row") {
      flush()
      current = [line]
      currentKind = "row"
      continue
    }

    if (line.kind === "bullet") {
      if (currentKind !== "row" && currentKind !== "bullet") {
        flush()
      }
      current.push(line)
      currentKind = "bullet"
      continue
    }

    if (line.kind === "keyValue") {
      if (currentKind !== "keyValue") {
        flush()
      }
      current.push(line)
      currentKind = "keyValue"
      continue
    }

    flush()
    current = [line]
    currentKind = "paragraph"
  }

  flush()

  return entries
}

export function buildHarvardDocument(
  personalInfo: PersonalInfo | undefined,
  blocks: CvBlock[]
): HarvardDocument {
  const ordered = blocks
    .map((block, index) => ({ block, index }))
    .sort(
      (a, b) =>
        sectionRank(a.block) - sectionRank(b.block) || a.index - b.index
    )

  const sections = ordered
    .map(({ block }) => {
      const lines = block.body
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map(parseLine)
        .filter((line): line is HarvardLine => line !== null)

      return {
        key: block.id,
        heading: clean(block.heading).toUpperCase(),
        entries: groupEntries(lines),
      }
    })
    .filter(
      (section) => section.heading.length > 0 && section.entries.length > 0
    )

  return {
    name: clean(personalInfo?.full_name) || null,
    headline: clean(personalInfo?.headline) || null,
    contact: personalInfo ? buildContactLine(personalInfo) : null,
    sections,
  }
}
