const fetchMock = globalThis.fetch as unknown as jest.Mock;

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, jest } from "@jest/globals";

import { RegisterForm } from "./register-form";

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("RegisterForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("rechaza contraseñas que no coinciden sin llamar a la API", async () => {
    render(<RegisterForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreto123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "otro-secreto" },
    });

    fireEvent.click(screen.getByText("Crear cuenta"));

    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("crea la cuenta y llama a la API de autenticación", async () => {
    const response = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ id: "user-1", email: "ana@email.com" }),
    };
    fetchMock.mockResolvedValue(response);

    render(<RegisterForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreto123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "secreto123" },
    });

    fireEvent.click(screen.getByText("Crear cuenta"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Ana",
            email: "ana@email.com",
            password: "secreto123",
          }),
        })
      );
    });
  });
});
