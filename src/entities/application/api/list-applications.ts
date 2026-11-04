import { useApiQuery } from "@/shared/api/query-client"
import {
  applicationListSchema,
  toApplication,
  type Application,
  type ApplicationApi,
} from "@/entities/application/model/types"

export function useApplicationsQuery() {
  return useApiQuery<ApplicationApi[], Application[]>({
    url: "/applications",
    schema: applicationListSchema,
    queryKey: ["applications"],
    select: (rows) => rows.map(toApplication),
  })
}
