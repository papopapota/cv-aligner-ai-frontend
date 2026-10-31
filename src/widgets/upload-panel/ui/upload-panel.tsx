"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CircleAlert } from "lucide-react"

import type { CvFile } from "@/entities/cv"
import type { JobVacancy } from "@/entities/job-vacancy"
import { CvDropzone } from "@/features/upload-cv"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import { JobDescriptionPanel } from "./job-description-panel"

export function UploadPanel() {
  const router = useRouter()
  const [cvFile, setCvFile] = useState<CvFile | null>(null)
  const [vacancy, setVacancy] = useState<JobVacancy | null>(null)
  const [cvError, setCvError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleCvChange = (file: CvFile) => {
    setCvFile(file)
    setCvError(null)
    setSubmitError(null)
  }

  const handleCvRemove = () => {
    setCvFile(null)
  }

  const handleVacancyChange = useCallback((nextVacancy: JobVacancy | null) => {
    setVacancy(nextVacancy)
    setSubmitError(null)
  }, [])

  const handleContinue = () => {
    if (!cvFile) {
      setCvError("Sube tu CV para continuar.")
      setSubmitError("Necesitamos tu CV para generar el diagnóstico ATS.")
      return
    }

    if (!vacancy) {
      setSubmitError(
        "Añade una descripción válida de la vacante para continuar."
      )
      return
    }

    setSubmitError(null)
    router.push("/analysis")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle>Currículum Vitae</CardTitle>
            <CardDescription>
              Sube tu CV en formato PDF o DOCX. Usaremos su contenido para
              calcular la compatibilidad con la vacante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CvDropzone
              file={cvFile}
              onChange={handleCvChange}
              onRemove={handleCvRemove}
              error={cvError ?? undefined}
            />
          </CardContent>
        </Card>

        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle>Descripción del Trabajo</CardTitle>
            <CardDescription>
              Añade la oferta mediante un enlace o pegando el texto completo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobDescriptionPanel onVacancyChange={handleVacancyChange} />
          </CardContent>
        </Card>
      </div>

      {submitError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Faltan datos para continuar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          El análisis compara palabras clave, formato y alineación con el
          puesto.
        </p>
        <Button type="button" size="lg" onClick={handleContinue}>
          Personalizar CV
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
