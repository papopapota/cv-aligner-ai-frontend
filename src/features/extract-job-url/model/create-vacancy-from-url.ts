import type { JobVacancy } from "@/entities/job-vacancy"

import type { JobDescriptionResponse } from "./job-description-schema"

export function createVacancyFromUrl(
  url: string,
  content: Pick<JobDescriptionResponse, "title" | "company" | "description">
): JobVacancy {
  const lines = content.description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const webTitle = content.title?.trim()
  const webCompany = content.company?.trim()

  let company = webCompany || "Empresa no especificada"
  if (!webCompany) {
    try {
      company = new URL(url).hostname.replace(/^www\./, "")
    } catch {
      // La URL ya fue validada por el formulario; se mantiene el valor por defecto.
    }
  }

  return {
    id: `job-url-${Date.now()}`,
    title: (webTitle || lines[0] || "Oferta desde enlace").slice(0, 80),
    company,
    description: content.description.trim(),
    source: "url",
    url,
  }
}
