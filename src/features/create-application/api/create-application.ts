import { useQueryClient } from "@tanstack/react-query"

import {
  applicationApiSchema,
  toApplication,
  type Application,
  type ApplicationApi,
} from "@/entities/application"
import { useApiMutation } from "@/shared/api/query-client"
import { toast } from "@/shared/ui"

export interface CreateApplicationVariables {
  jobTitle: string
  company: string
}

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient()

  return useApiMutation<CreateApplicationVariables, ApplicationApi, Application>({
    url: "/applications",
    method: "POST",
    schema: applicationApiSchema,
    buildBody: ({ jobTitle, company }) => ({
      job_title: jobTitle,
      company,
    }),
    transform: toApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.add({
        title: "Postulación agregada",
        type: "success",
        timeout: 5000,
      })
    },
  })
}
