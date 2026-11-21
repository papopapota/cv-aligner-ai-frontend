import { describe, expect, it } from "@jest/globals"
import type { PersonalInfo } from "@/entities/cv"
import type { CvBlock } from "./cv-document"
import { buildContactLine, buildHarvardDocument } from "./harvard-document"

describe("harvard-document", () => {
  it("construye la línea de contacto en orden y sin campos vacíos", () => {
    const personalInfo: PersonalInfo = {
      email: "ada@example.com",
      phone: "+34 600 000 000",
      location: { city: "Madrid", country: "España" },
      links: {
        linkedin: "linkedin.com/in/ada",
        github: "github.com/ada",
      },
    }

    expect(buildContactLine(personalInfo)).toBe(
      "Madrid, España | +34 600 000 000 | ada@example.com | linkedin.com/in/ada | github.com/ada"
    )
    expect(buildContactLine({ full_name: "Ada Lovelace" })).toBeNull()
  })

  it("ordena las secciones según la jerarquía Harvard", () => {
    const blocks: CvBlock[] = [
      { id: "languages", heading: "Idiomas", body: "Inglés: Avanzado" },
      { id: "projects", heading: "Proyectos", body: "- Prototipo interno" },
      {
        id: "experience",
        heading: "Experiencia",
        body: "ACME | Madrid\nSenior Engineer | 2020 – 2023\n- Logro uno\n- Logro dos",
      },
      {
        id: "summary",
        heading: "Resumen Profesional",
        body: "Ingeniera de software con ocho años de experiencia.",
      },
      {
        id: "education",
        heading: "Educación",
        body: "Universidad Politécnica | Valencia\nMáster | 2019",
      },
    ]

    const document = buildHarvardDocument(undefined, blocks)

    expect(document.sections.map((section) => section.key)).toEqual([
      "summary",
      "experience",
      "education",
      "languages",
      "projects",
    ])
    expect(document.sections[0]?.heading).toBe("RESUMEN PROFESIONAL")
  })

  it("parsea filas, viñetas y pares clave-valor, agrupando cada puesto", () => {
    const document = buildHarvardDocument(undefined, [
      {
        id: "experience",
        heading: "Experiencia",
        body: [
          "ACME Corporation | Madrid, España",
          "Senior Engineer | Ene 2020 – Dic 2023",
          "- Lideró la migración a microservicios",
          "- Redujo la latencia un 40%",
          "",
          "Globex - Remoto",
        ].join("\n"),
      },
      {
        id: "skills",
        heading: "Habilidades Técnicas",
        body: "Frameworks: React, Node.js.\nBases de datos: PostgreSQL.\nhttps://example.com/cv",
      },
    ])

    const experience = document.sections[0]
    const skills = document.sections[1]

    expect(experience?.entries[0]?.lines).toEqual([
      {
        kind: "row",
        left: "ACME Corporation",
        right: "Madrid, España",
      },
    ])
    expect(experience?.entries[1]?.lines).toEqual([
      {
        kind: "row",
        left: "Senior Engineer",
        right: "Ene 2020 – Dic 2023",
      },
      {
        kind: "bullet",
        left: "Lideró la migración a microservicios",
      },
      {
        kind: "bullet",
        left: "Redujo la latencia un 40%",
      },
    ])
    expect(experience?.entries[2]?.lines).toEqual([
      { kind: "row", left: "Globex", right: "Remoto" },
    ])
    expect(skills?.entries[0]?.lines).toEqual([
      { kind: "keyValue", left: "Frameworks:", right: "React, Node.js." },
      { kind: "keyValue", left: "Bases de datos:", right: "PostgreSQL." },
    ])
    expect(skills?.entries[1]?.lines).toEqual([
      { kind: "paragraph", left: "https://example.com/cv" },
    ])
  })

  it("omite secciones sin contenido y conserva el encabezado", () => {
    const document = buildHarvardDocument(
      {
        full_name: " Ada Lovelace ",
        headline: " Engineering Manager ",
        email: "ada@example.com",
      },
      [
        { id: "empty", heading: "Certificaciones", body: "  \n " },
        {
          id: "summary",
          heading: "Resumen Profesional",
          body: "Perfil ejecutivo.",
        },
      ]
    )

    expect(document.name).toBe("Ada Lovelace")
    expect(document.headline).toBe("Engineering Manager")
    expect(document.contact).toBe("ada@example.com")
    expect(document.sections).toHaveLength(1)
  })
})
