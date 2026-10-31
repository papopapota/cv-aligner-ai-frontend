import type { CvFile } from "@/entities/cv"

const MOCK_DELAY_MS = 500

export async function uploadCv(file: CvFile): Promise<CvFile> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  return file
}
