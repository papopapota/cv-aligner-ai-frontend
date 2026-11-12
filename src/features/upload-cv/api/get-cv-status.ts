import { cvStatusResponseSchema, type CvStatusResponse } from "@/entities/cv"
import { getJson } from "@/shared/api"

export async function getCvStatus(cvId: string): Promise<CvStatusResponse> {
  return getJson({
    url: `/cvs/${cvId}`,
    schema: cvStatusResponseSchema,
  })
}
