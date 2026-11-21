import { postJson } from "@/shared/api"

import { jobDescriptionSchema, type JobDescriptionResponse } from "../model"

export async function extractJobUrl(url: string): Promise<JobDescriptionResponse> {
  return postJson({
    url: "/job-descriptions/extract",
    body: { url },
    schema: jobDescriptionSchema,
  })
}
