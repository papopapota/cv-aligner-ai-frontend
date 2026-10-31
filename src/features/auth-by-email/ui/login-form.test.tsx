const fetchMock = globalThis.fetch as unknown as jest.Mock;

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, jest } from "@jest/globals";

import { LoginForm } from "./login-form";

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("LoginForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("rechaza el formulario vacío sin llamar a la API", async () => {
    render(<LoginForm />, { wrapper });

    fireEvent.click(screen.getByText("Iniciar sesión"));

    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
      expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("inicia sesión y llama a la API de autenticación", async () => {
    const response = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ access_token: "token-prueba" }),
    };
    fetchMock.mockResolvedValue(response);

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreto123" },
    });

    fireEvent.click(screen.getByText("Iniciar sesión"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "ana@email.com",
            password: "secreto123",
          }),
        })
      );
    });
  });
});
