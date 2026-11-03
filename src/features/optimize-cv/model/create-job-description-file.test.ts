import { describe, expect, it } from "@jest/globals"

import { createJobDescriptionFile } from "./create-job-description-file"

describe("createJobDescriptionFile", () => {
  it("crea un archivo TXT con la descripción de la vacante", () => {
    const file = createJobDescriptionFile("Descripción de prueba")

    expect(file.name).toBe("job-description.txt")
    expect(file.type).toBe("text/plain")
  })
})
