"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"

import { Button, FormField, Textarea } from "@/shared/ui"
import { jobTextSchema } from "../model"

interface JobTextFormProps {
  value: string
  onChange: (value: string) => void
}

export function JobTextForm({ value, onChange }: JobTextFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTextChange = (nextValue: string) => {
    setError(null)
    onChange(nextValue)
  }

  const handleBlur = () => {
    const parsed = jobTextSchema.safeParse({ text: value })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Descripción inválida.")
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return
    }

    if (file.size > 1024 * 1024) {
      setError("El archivo TXT supera el tamaño máximo de 1 MB.")
      return
    }

    try {
      const text = await file.text()
      handleTextChange(text)
    } catch {
      setError("No se pudo leer el archivo TXT.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField
        id="job-text"
        label="Descripción de la vacante"
        error={error ?? undefined}
        hint="Pega el texto de la oferta o cárgalo desde un archivo TXT."
      >
        <Textarea
          id="job-text"
          value={value}
          onChange={(event) => handleTextChange(event.target.value)}
          onBlur={handleBlur}
          placeholder="Pega aquí la descripción completa de la vacante..."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "job-text-error" : "job-text-hint"}
          className="min-h-[180px]"
        />
      </FormField>

      <div className="flex flex-col gap-3 border border-dashed border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink">Archivo TXT (alternativa)</p>
          <p className="text-xs text-muted-foreground">Máx. 1 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          Cargar TXT
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {value.trim().length} caracteres
      </p>
    </div>
  )
}
