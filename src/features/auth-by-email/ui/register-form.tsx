"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";

import { useRegisterMutation } from "@/features/auth-by-email/api";
import {
  registerSchema,
  type RegisterFormData,
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

export function RegisterForm() {
  const router = useRouter();
  const mutation = useRegisterMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push("/login");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo crear la cuenta."
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
          <AlertTitle>No se pudo crear la cuenta</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <FormField
          id="register-name"
          label="Nombre completo"
          error={errors.name?.message}
        >
          <Input
            id="register-name"
            autoComplete="name"
            placeholder="Tu nombre"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? "register-name-error" : undefined
            }
            {...register("name")}
          />
        </FormField>

        <FormField
          id="register-email"
          label="Correo electrónico"
          error={errors.email?.message}
        >
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "register-email-error" : undefined
            }
            {...register("email")}
          />
        </FormField>

        <FormField
          id="register-password"
          label="Contraseña"
          error={errors.password?.message}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            {...register("password")}
          />
        </FormField>

        <FormField
          id="register-confirm-password"
          label="Confirmar contraseña"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword
                ? "register-confirm-password-error"
                : undefined
            }
            {...register("confirmPassword")}
          />
        </FormField>
      </div>

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Spinner />
            Creando cuenta...
          </>
        ) : (
          "Crear cuenta"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
