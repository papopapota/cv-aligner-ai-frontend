import {
  ACCEPTED_CV_TYPES,
  MAX_CV_SIZE_BYTES,
  type CvFile,
} from "@/entities/cv"

export type CvFileValidation =
  | { ok: true }
  | { ok: false; message: string }

const acceptedExtensions = [".pdf", ".docx"]

function hasAcceptedExtension(fileName: string): boolean {
  const lowerCaseName = fileName.toLowerCase()
  return acceptedExtensions.some((extension) => lowerCaseName.endsWith(extension))
}

export function validateCvFile(file: File): CvFileValidation {
  if (file.size === 0) {
    return { ok: false, message: "El archivo está vacío." }
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return {
      ok: false,
      message: "El archivo supera el tamaño máximo de 5 MB.",
    }
  }

  const acceptedType = ACCEPTED_CV_TYPES.some((type) => type === file.type)

  if (!acceptedType && !hasAcceptedExtension(file.name)) {
    return {
      ok: false,
      message: "Solo se aceptan archivos PDF o DOCX.",
    }
  }

  return { ok: true }
}

export function createCvFile(file: File): CvFile {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
