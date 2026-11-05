import { useQueryClient } from "@tanstack/react-query"

import {
  applicationApiSchema,
  toApplication,
  type Application,
  type ApplicationApi,
  type ApplicationStatus,
} from "@/entities/application"
import { useApiMutation } from "@/shared/api/query-client"
import { toast } from "@/shared/ui"

export interface UpdateApplicationStatusVariables {
  applicationId: number
  status: ApplicationStatus
}

export function useUpdateApplicationStatusMutation() {
  const queryClient = useQueryClient()

  return useApiMutation<
    UpdateApplicationStatusVariables,
    ApplicationApi,
    Application
  >({
    url: ({ applicationId }) => `/applications/${applicationId}/status`,
    method: "PATCH",
    schema: applicationApiSchema,
    buildBody: ({ status }) => ({ status }),
    transform: toApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.add({
        title: "Estado actualizado",
        type: "success",
        timeout: 5000,
      })
    },
  })
}
