'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

import {
  registerSchema,
  type RegisterFormData,
} from '@/features/auth-by-email/model';

import { useRegisterMutation } from '@/features/auth-by-email/api';

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // La mutación debe declararse dentro del componente,
  // no dentro de onSubmit.
  const mutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // No enviar confirmPassword al backend.
      const { confirmPassword, ...registerData } = data;

      await mutation.mutateAsync(registerData);

      alert('Cuenta creada correctamente. Ahora puedes iniciar sesión.');

      router.push('/');

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al registrarse';

      alert(message);
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
        Crear cuenta
      </h2>

      <div>
        <Input
          placeholder="Nombre"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Correo electrónico"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Contraseña"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirmar contraseña"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || mutation.isPending}
      >
        {isLoading || mutation.isPending
          ? 'Registrando...'
          : 'Crear cuenta'}
      </Button>
    </form>
  );
}
