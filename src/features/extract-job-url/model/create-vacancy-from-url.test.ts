import { createVacancyFromUrl } from "./create-vacancy-from-url"

const URL_VALUE = "https://www.nexa.example.com/ofertas/frontend"

describe("createVacancyFromUrl", () => {
  it("prioriza el título y la empresa extraídos de la web", () => {
    const vacancy = createVacancyFromUrl(URL_VALUE, {
      title: "Senior Frontend Engineer",
      company: "Nexa Labs",
      description: "Otra línea que no debe usarse como título.\nBuscamos React.",
    })

    expect(vacancy).toMatchObject({
      id: expect.stringMatching(/^job-url-/),
      title: "Senior Frontend Engineer",
      company: "Nexa Labs",
      description: "Otra línea que no debe usarse como título.\nBuscamos React.",
      source: "url",
      url: URL_VALUE,
    })
  })

  it("usa la primera línea y el hostname si la web no aporta metadatos", () => {
    const description = "Desarrollador Frontend\nRemoto · LATAM"

    const vacancy = createVacancyFromUrl(URL_VALUE, {
      title: null,
      company: null,
      description,
    })

    expect(vacancy.title).toBe("Desarrollador Frontend")
    expect(vacancy.company).toBe("nexa.example.com")
    expect(vacancy.description).toBe(description)
  })

  it("usa valores por defecto si no hay metadatos ni líneas", () => {
    const vacancy = createVacancyFromUrl(URL_VALUE, {
      title: "   ",
      company: "",
      description: "   ",
    })

    expect(vacancy.title).toBe("Oferta desde enlace")
    expect(vacancy.company).toBe("nexa.example.com")
    expect(vacancy.description).toBe("")
  })
})
