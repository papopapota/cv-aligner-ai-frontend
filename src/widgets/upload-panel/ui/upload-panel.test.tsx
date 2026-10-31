jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/upload",
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect } from "@jest/globals";

import { UploadPanel } from "./upload-panel";

describe("UploadPanel", () => {
  it("exige CV y descripción antes de continuar", async () => {
    const user = userEvent.setup();

    render(<UploadPanel />);

    fireEvent.click(screen.getByText("Personalizar CV"));

    await waitFor(() => {
      expect(screen.getByText("Faltan datos para continuar")).toBeInTheDocument();
      expect(screen.getByText("Necesitamos tu CV para generar el diagnóstico ATS.")).toBeInTheDocument();
    });

    await user.upload(
      screen.getByLabelText("Seleccionar archivo de CV"),
      [new File(["contenido"], "cv.pdf", { type: "application/pdf" })]
    );

    await waitFor(() => {
      expect(screen.queryByText("Necesitamos tu CV para generar el diagnóstico ATS.")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Personalizar CV"));

    await waitFor(() => {
      expect(screen.getByText("Añade una descripción válida de la vacante para continuar.")).toBeInTheDocument();
    });
  });
});
