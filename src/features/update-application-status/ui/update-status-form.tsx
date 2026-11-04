"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  updateApplicationStatusSchema,
  useUpdateApplicationStatusMutation,
  type UpdateApplicationStatusForm,
} from "@/features/update-application-status"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FormField,
  Input,
  Spinner,
} from "@/shared/ui"

export function UpdateApplicationStatusForm({
  applicationId,
}: {
  applicationId: number
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const mutation = useUpdateApplicationStatusMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateApplicationStatusForm>({
    resolver: zodResolver(updateApplicationStatusSchema),
    defaultValues: {
      status: "pending",
    },
  })

  const onSubmit = async (data: UpdateApplicationStatusForm) => {
    setSubmitError(null)

    try {
      await mutation.mutateAsync({
        applicationId,
        status: data.status,
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo actualizar el estado."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="status"
        label="Estado"
        error={errors.status?.message}
      >
        <Input
          id="status"
          disabled={mutation.isPending}
          {...register("status")}
        />
      </FormField>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Spinner className="mr-2" />
            Actualizando...
          </>
        ) : (
          "Actualizar estado"
        )}
      </Button>
    </form>
  )
}
