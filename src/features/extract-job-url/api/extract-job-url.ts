import { sampleJobVacancy, type JobVacancy } from "@/entities/job-vacancy"

const MOCK_DELAY_MS = 650

export async function extractJobUrl(url: string): Promise<JobVacancy> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

  return {
    ...sampleJobVacancy,
    id: `job-${Date.now()}`,
    source: "url",
    url,
  }
}
