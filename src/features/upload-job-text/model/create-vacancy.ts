import type { JobVacancy } from "@/entities/job-vacancy"

export function createVacancyFromText(text: string): JobVacancy {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    id: `job-text-${Date.now()}`,
    title: lines[0]?.slice(0, 80) ?? "Vacante sin título",
    company: lines[1]?.slice(0, 80) ?? "Empresa no especificada",
    description: text.trim(),
    source: "text",
  }
}
