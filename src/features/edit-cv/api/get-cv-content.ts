import { cvContentResponseSchema, type CvContentResponse } from "@/entities/cv"
import { useApiQuery } from "@/shared/api/query-client"

export function useCvContentQuery(cvId: string | undefined) {
  return useApiQuery<CvContentResponse>({
    url: `/cvs/${cvId ?? ""}/content`,
    schema: cvContentResponseSchema,
    params: { include_structured: true },
    queryKey: ["cv-content", cvId],
    enabled: Boolean(cvId),
  })
}
