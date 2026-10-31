import { render, screen } from "@testing-library/react";
import { describe, expect } from "@jest/globals";

import { sampleAtsReport } from "@/entities/ats-report";
import { AtsScoreDashboard } from "./ats-score-dashboard";

describe("AtsScoreDashboard", () => {
  it("renderiza el puntaje, el nivel y las métricas", () => {
    render(<AtsScoreDashboard report={sampleAtsReport} />);

    expect(screen.getByText("86 / 100")).toBeInTheDocument();
    expect(screen.getByText("Puntaje ATS")).toBeInTheDocument();
    expect(screen.getByText("Alta compatibilidad")).toBeInTheDocument();

    expect(screen.getByText("Alineación con la vacante")).toBeInTheDocument();
    expect(screen.getByText("Palabras clave")).toBeInTheDocument();
    expect(screen.getByText("Formato compatible ATS")).toBeInTheDocument();

    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();

    expect(screen.getByText("Incluye las palabras clave React, TypeScript y diseño de sistemas en el resumen profesional.")).toBeInTheDocument();
  });
});
