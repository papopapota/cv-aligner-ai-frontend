"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FileText, Upload, X } from "lucide-react"

import type { CvFile } from "@/entities/cv"
import {
  MAX_CV_SIZE_BYTES,
} from "@/entities/cv"
import { Button } from "@/shared/ui"
import { cn } from "cn"
import {
  createCvFile,
  formatFileSize,
  validateCvFile,
} from "../model/validate-file"

interface CvDropzoneProps {
  file: CvFile | null
  onChange: (file: CvFile) => void
  onRemove: () => void
  error?: string
}

export function CvDropzone({ file, onChange, onRemove, error }: CvDropzoneProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0]

      if (!nextFile) {
        return
      }

      const validation = validateCvFile(nextFile)

      if (!validation.ok) {
        setLocalError(validation.message)
        return
      }

      setLocalError(null)
      onChange(createCvFile(nextFile))
    },
    [onChange]
  )

  const onDropRejected = useCallback(() => {
    setLocalError("Solo se aceptan archivos PDF o DOCX de hasta 5 MB.")
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    maxSize: MAX_CV_SIZE_BYTES,
    multiple: false,
    noClick: true,
    onDropAccepted,
    onDropRejected,
  })

  const visibleError = error ?? localError

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[256px] flex-col items-center justify-center gap-4 border border-dashed border-line bg-canvas p-6 text-center transition-colors",
          isDragActive && "border-primary bg-secondary/20"
        )}
      >
        <input {...getInputProps()} aria-label="Seleccionar archivo de CV" />
        <span className="flex size-12 items-center justify-center border border-line bg-card text-primary">
          <Upload aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base text-ink">
            {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu CV aquí"}
          </p>
          <p className="text-sm text-muted-foreground">
            o selecciona un archivo desde tu equipo
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={open}>
          Seleccionar archivo
        </Button>
        <p className="text-xs text-muted-foreground">PDF o DOCX · Máx. 5 MB</p>
      </div>

      {visibleError ? (
        <p role="alert" className="text-sm text-destructive">
          {visibleError}
        </p>
      ) : null}

      {file ? (
        <div className="flex items-center gap-3 border border-line bg-card p-3">
          <span className="flex size-10 shrink-0 items-center justify-center border border-line text-primary">
            <FileText aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${file.name}`}
            className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
