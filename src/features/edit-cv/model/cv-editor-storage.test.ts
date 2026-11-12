import { beforeEach, describe, expect, it } from "@jest/globals"

import {
  CV_EDITOR_STORAGE_KEY,
  clearCvEditorDraft,
  readCvEditorDraft,
  saveCvEditorDraft,
} from "./cv-editor-storage"

const CV_ID = "11111111-1111-4111-8111-111111111111"

describe("cv-editor-storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("guarda y recupera un borrador válido", () => {
    const draft = {
      cvId: CV_ID,
      baseOptimizedContent: "Contenido base",
      edits: { "resumen-0": "Contenido editado" },
    }

    saveCvEditorDraft(draft)

    expect(readCvEditorDraft()).toEqual(draft)
  })

  it("acepta borradores sin cvId", () => {
    const draft = {
      baseOptimizedContent: "Contenido base",
      edits: {},
    }

    saveCvEditorDraft(draft)

    expect(readCvEditorDraft()).toEqual(draft)
  })

  it("devuelve null cuando el JSON es inválido", () => {
    window.sessionStorage.setItem(CV_EDITOR_STORAGE_KEY, "{invalido")

    expect(readCvEditorDraft()).toBeNull()
  })

  it("devuelve null cuando la forma no es válida", () => {
    window.sessionStorage.setItem(
      CV_EDITOR_STORAGE_KEY,
      JSON.stringify({ baseOptimizedContent: 42 })
    )

    expect(readCvEditorDraft()).toBeNull()
  })

  it("limpia el borrador almacenado", () => {
    saveCvEditorDraft({
      baseOptimizedContent: "Contenido base",
      edits: {},
    })
    clearCvEditorDraft()

    expect(readCvEditorDraft()).toBeNull()
  })
})
