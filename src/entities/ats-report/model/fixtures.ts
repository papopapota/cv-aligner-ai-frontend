import type { AtsReport } from "./types"

export const sampleAtsReport: AtsReport = {
  score: 86,
  summary:
    "Tu CV está bien alineado con la vacante. Refuerza las palabras clave del puesto y simplifica la estructura de dos secciones para mejorar la lectura automática.",
  metrics: [
    {
      id: "alignment",
      label: "Alineación con la vacante",
      value: 88,
    },
    {
      id: "keywords",
      label: "Palabras clave",
      value: 92,
    },
    {
      id: "format",
      label: "Formato compatible ATS",
      value: 78,
    },
  ],
  recommendations: [
    "Incluye las palabras clave React, TypeScript y diseño de sistemas en el resumen profesional.",
    "Convierte las responsabilidades en logros medibles con métricas de impacto.",
    "Evita tablas y columnas múltiples en la sección de experiencia para facilitar el parseo.",
  ],
}
