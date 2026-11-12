import type { PersonalInfo } from "@/entities/cv"

export type PersonalInfoStatus =
  | "unchanged"
  | "modified"
  | "added"
  | "removed"

export interface PersonalInfoComparison {
  key: string
  label: string
  originalValue: string
  optimizedValue: string
  status: PersonalInfoStatus
}

interface PersonalInfoField {
  key: string
  label: string
  read: (info: PersonalInfo | undefined) => string
}

function normalize(value: string | undefined): string {
  return value?.trim() ?? ""
}

function buildLocation(info: PersonalInfo | undefined): string {
  if (!info) {
    return ""
  }

  return [info.location?.city, info.location?.country]
    .map(normalize)
    .filter((value) => value.length > 0)
    .join(", ")
}

function buildLinks(info: PersonalInfo | undefined): string {
  if (!info) {
    return ""
  }

  return [
    info.links?.linkedin,
    info.links?.github,
    info.links?.portfolio,
  ]
    .map(normalize)
    .filter((value) => value.length > 0)
    .join(" · ")
}

const PERSONAL_INFO_FIELDS: PersonalInfoField[] = [
  {
    key: "full_name",
    label: "Nombre",
    read: (info) => normalize(info?.full_name),
  },
  {
    key: "headline",
    label: "Titular",
    read: (info) => normalize(info?.headline),
  },
  {
    key: "email",
    label: "Email",
    read: (info) => normalize(info?.email),
  },
  {
    key: "phone",
    label: "Teléfono",
    read: (info) => normalize(info?.phone),
  },
  { key: "location", label: "Ubicación", read: buildLocation },
  { key: "links", label: "Enlaces", read: buildLinks },
]

function getStatus(
  originalValue: string,
  optimizedValue: string
): PersonalInfoStatus {
  if (originalValue.length === 0) {
    return "added"
  }

  if (optimizedValue.length === 0) {
    return "removed"
  }

  return originalValue === optimizedValue ? "unchanged" : "modified"
}

export function buildPersonalInfoComparisons(
  original: PersonalInfo | undefined,
  optimized: PersonalInfo | undefined
): PersonalInfoComparison[] {
  const comparisons: PersonalInfoComparison[] = []

  for (const { key, label, read } of PERSONAL_INFO_FIELDS) {
    const originalValue = read(original)
    const optimizedValue = read(optimized)

    if (originalValue.length === 0 && optimizedValue.length === 0) {
      continue
    }

    comparisons.push({
      key,
      label,
      originalValue,
      optimizedValue,
      status: getStatus(originalValue, optimizedValue),
    })
  }

  return comparisons
}
