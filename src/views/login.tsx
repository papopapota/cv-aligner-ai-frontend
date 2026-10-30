
"use client";

import { LoginForm } from "@/features/auth-by-email";
import { useState } from "react";

export function LoginView() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white rounded-lg p-8 shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Iniciar sesión
        </h2>

        <LoginForm />

        {isLoading && (
          <p className="mt-4 text-center">
            Iniciando sesión...
          </p>
        )}
      </div>
    </div>
  );
}
