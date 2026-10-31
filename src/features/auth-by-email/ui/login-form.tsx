"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";

import { useLoginMutation } from "@/features/auth-by-email/api";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth-by-email/model";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FormField,
  Input,
  Spinner,
} from "@/shared/ui";

export function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync(data);
      router.push("/upload");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo iniciar sesión."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      {submitError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No se pudo iniciar sesión</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <FormField
          id="login-email"
          label="Correo electrónico"
          error={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
        </FormField>

        <FormField
          id="login-password"
          label="Contraseña"
          error={errors.password?.message}
        >
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Mínimo 6 caracteres"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />
        </FormField>
      </div>

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Spinner />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Crear una cuenta
        </Link>
      </p>
    </form>
  );
}
