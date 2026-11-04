import { useQueryClient } from "@tanstack/react-query"

import { useApiMutation } from "@/shared/api/query-client"
import { toast } from "@/shared/ui"

export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient()

  return useApiMutation<number, void, void>({
    url: (applicationId) => `/applications/${applicationId}`,
    method: "DELETE",
    buildBody: () => undefined,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.add({
        title: "Postulación eliminada",
        type: "success",
        timeout: 5000,
      })
    },
  })
}
