import { RegisterForm } from '@/features/auth-by-email/ui/register-form';

export function RegisterView() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white rounded-lg p-8 shadow-md max-w-md w-full">
        <RegisterForm />
      </div>
    </main>
  );
}
