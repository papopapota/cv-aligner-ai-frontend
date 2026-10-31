"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"

import type { JobVacancy } from "@/entities/job-vacancy"
import {
  Alert,
  AlertDescription,
  Button,
  FormField,
  Input,
  Spinner,
} from "@/shared/ui"
import { extractJobUrl } from "../api"
import { jobUrlSchema, type JobUrlFormData } from "../model"

export function JobUrlForm({
  onExtracted,
}: {
  onExtracted: (vacancy: JobVacancy) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobUrlFormData>({
    resolver: zodResolver(jobUrlSchema),
    defaultValues: { url: "" },
  })

  const onSubmit = async (values: JobUrlFormData) => {
    setSubmitError(null)

    try {
      const vacancy = await extractJobUrl(values.url)
      onExtracted(vacancy)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo analizar el enlace."
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {submitError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="job-url"
        label="Enlace de la oferta"
        error={errors.url?.message}
        hint="Pega la URL pública de la vacante."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="job-url"
            type="url"
            autoComplete="url"
            placeholder="https://empresa.com/ofertas/vacante"
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? "job-url-error" : "job-url-hint"}
            {...register("url")}
          />
          <Button type="submit" disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? (
              <>
                <Spinner />
                Analizando...
              </>
            ) : (
              "Analizar enlace"
            )}
          </Button>
        </div>
      </FormField>
    </form>
  )
}
