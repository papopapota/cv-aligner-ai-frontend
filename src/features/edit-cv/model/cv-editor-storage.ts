import { z } from "zod"

export const CV_EDITOR_STORAGE_KEY = "cv-editor-draft"

export const cvEditorDraftSchema = z.object({
  cvId: z.string().uuid().optional(),
  baseOptimizedContent: z.string(),
  edits: z.record(z.string(), z.string()),
})

export type CvEditorDraft = z.infer<typeof cvEditorDraftSchema>

export function parseCvEditorDraft(raw: string | null): CvEditorDraft | null {
  if (!raw) {
    return null
  }

  try {
    const payload: unknown = JSON.parse(raw)
    const parsed = cvEditorDraftSchema.safeParse(payload)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function getCvEditorDraftSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return window.sessionStorage.getItem(CV_EDITOR_STORAGE_KEY)
}

const listeners = new Set<() => void>()

function notifyListeners(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeToCvEditorDraft(
  onStoreChange: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CV_EDITOR_STORAGE_KEY) {
      onStoreChange()
    }
  }

  listeners.add(onStoreChange)
  window.addEventListener("storage", handleStorage)

  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener("storage", handleStorage)
  }
}

export function saveCvEditorDraft(draft: CvEditorDraft): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(CV_EDITOR_STORAGE_KEY, JSON.stringify(draft))
  notifyListeners()
}

export function readCvEditorDraft(): CvEditorDraft | null {
  return parseCvEditorDraft(getCvEditorDraftSnapshot())
}

export function clearCvEditorDraft(): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(CV_EDITOR_STORAGE_KEY)
  notifyListeners()
}
