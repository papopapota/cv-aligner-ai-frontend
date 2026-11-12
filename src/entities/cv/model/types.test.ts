import { describe, expect, it } from "@jest/globals"

import {
  cvContentResponseSchema,
  cvStatusResponseSchema,
  cvUploadResponseSchema,
  personalInfoSchema,
} from "./types"

const CV_ID = "11111111-1111-4111-8111-111111111111"

describe("cv schemas", () => {
  it("valida la respuesta de subida", () => {
    const parsed = cvUploadResponseSchema.safeParse({
      id: CV_ID,
      filename: "cv.pdf",
      content_type: "application/pdf",
      size_bytes: 12,
      sha256: "abc123",
      status: "UPLOADED",
      action_required: "WAIT_FOR_PARSING",
    })

    expect(parsed.success).toBe(true)
  })

  it("valida el estado con campos de error opcionales", () => {
    const parsed = cvStatusResponseSchema.safeParse({
      id: CV_ID,
      filename: "cv.pdf",
      content_type: "application/pdf",
      size_bytes: 12,
      sha256: "abc123",
      status: "ERROR",
      action_required: "REUPLOAD_CV",
      error_code: "EMPTY_TEXT",
      error_message: "El PDF no contiene texto.",
    })

    expect(parsed.success).toBe(true)
  })

  it("valida el contenido con structured_cv nulo", () => {
    const parsed = cvContentResponseSchema.safeParse({
      id: CV_ID,
      status: "PARSED",
      raw_text: "Texto",
      characters_extracted: 5,
      structured_cv: null,
    })

    expect(parsed.success).toBe(true)
  })

  it("acepta información personal parcial y campos extra", () => {
    const parsed = personalInfoSchema.safeParse({
      full_name: "Ada Lovelace",
      location: { city: "Londres" },
      links: { github: "https://github.com/ada" },
      pronouns: "she/her",
    })

    expect(parsed.success).toBe(true)
    expect(parsed.data?.full_name).toBe("Ada Lovelace")
  })
})
