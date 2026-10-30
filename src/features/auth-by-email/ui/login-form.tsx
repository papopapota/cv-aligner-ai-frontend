"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth-by-email/model";

import { useLoginMutation } from "@/features/auth-by-email/api";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Ejecutar el hook en el nivel superior del componente
  const mutation = useLoginMutation();

  const {
    register,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);

  try {
    const response = await mutation.mutateAsync(data);

    // Guardar temporalmente el token para las siguientes peticiones
    sessionStorage.setItem("access_token", response.access_token);

    router.push("/dashboard");
  } catch (error) {
    console.error(error);
    alert(
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión"
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md space-y-4"
    >
      <h2 className="text-2xl font-semibold">
        Iniciar sesión
      </h2>

      <Input
        type="email"
        placeholder="Correo electrónico"
        {...register("email")}
      />

      <Input
        type="password"
        placeholder="Contraseña"
        {...register("password")}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Entrar"}
      </Button>
    </form>
  );
}
