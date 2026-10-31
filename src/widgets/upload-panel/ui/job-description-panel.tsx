"use client"

import { useCallback, useState } from "react"
import { CheckCircle2, Link2, TextAlignStart } from "lucide-react"

import type { JobVacancy } from "@/entities/job-vacancy"
import {
  JobUrlForm,
} from "@/features/extract-job-url"
import {
  createVacancyFromText,
  jobTextSchema,
  JobTextForm,
} from "@/features/upload-job-text"
import {
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui"

type JobInputMode = "url" | "text"

interface JobDescriptionPanelProps {
  onVacancyChange: (vacancy: JobVacancy | null) => void
}

export function JobDescriptionPanel({
  onVacancyChange,
}: JobDescriptionPanelProps) {
  const [mode, setMode] = useState<JobInputMode>("url")
  const [text, setText] = useState("")
  const [vacancy, setVacancy] = useState<JobVacancy | null>(null)

  const updateVacancy = useCallback(
    (nextVacancy: JobVacancy | null) => {
      setVacancy(nextVacancy)
      onVacancyChange(nextVacancy)
    },
    [onVacancyChange]
  )

  const handleTextChange = (nextText: string) => {
    setText(nextText)

    const parsed = jobTextSchema.safeParse({ text: nextText })
    updateVacancy(
      parsed.success ? createVacancyFromText(nextText) : null
    )
  }

  const handleModeChange = (value: string | null) => {
    const nextMode: JobInputMode = value === "text" ? "text" : "url"
    setMode(nextMode)

    if (nextMode === "text") {
      const parsed = jobTextSchema.safeParse({ text })
      updateVacancy(
        parsed.success ? createVacancyFromText(text) : null
      )
      return
    }

    updateVacancy(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList>
          <TabsTrigger value="url">
            <Link2 aria-hidden="true" className="mr-2 size-4" />
            Enlace
          </TabsTrigger>
          <TabsTrigger value="text">
            <TextAlignStart aria-hidden="true" className="mr-2 size-4" />
            Texto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="pt-4">
          <JobUrlForm onExtracted={updateVacancy} />
        </TabsContent>

        <TabsContent value="text" className="pt-4">
          <JobTextForm value={text} onChange={handleTextChange} />
        </TabsContent>
      </Tabs>

      <div aria-live="polite" className="flex flex-col gap-3">
        {vacancy ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <CheckCircle2 aria-hidden="true" />
                Descripción validada
              </Badge>
              <span className="text-xs text-muted-foreground">
                Fuente: {vacancy.source === "url" ? "enlace" : "texto"}
              </span>
            </div>
            <div className="border border-line bg-canvas p-4">
              <p className="text-base text-ink">{vacancy.title}</p>
              <p className="text-sm text-muted-foreground">
                {vacancy.company}
                {vacancy.location ? ` · ${vacancy.location}` : ""}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {vacancy.description}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Añade un enlace o pega el texto de la oferta para validar la
            descripción.
          </p>
        )}
      </div>
    </div>
  )
}
