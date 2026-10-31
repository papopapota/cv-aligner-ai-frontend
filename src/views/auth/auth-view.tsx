import Link from "next/link";

import { LoginForm, RegisterForm } from "@/features/auth-by-email";
import { AuthHeader } from "@/widgets/app-header";
import { cn } from "cn";

export type AuthMode = "login" | "register";

const copy = {
  login: {
    title: "Iniciar sesión",
    subtitle: "Accede a tu cuenta para continuar optimizando tu CV.",
  },
  register: {
    title: "Crear cuenta",
    subtitle: "Completa tus datos para comenzar a optimizar tu CV.",
  },
} satisfies Record<AuthMode, { title: string; subtitle: string }>;

function AuthView({ mode }: { mode: AuthMode }) {
  const content = copy[mode];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <AuthHeader />

      <main className="mx-auto flex w-full max-w-[1376px] flex-1 flex-col items-center justify-center gap-6 px-4 py-10 sm:px-8 sm:py-14">
        <section className="w-full max-w-[480px] border border-line bg-card">
          <nav
            aria-label="Autenticación"
            className="grid grid-cols-2 border-b border-line"
          >
            <Link
              href="/login"
              aria-current={mode === "login" ? "page" : undefined}
              className={cn(
                "flex h-[52px] items-center justify-center border-b-[3px] border-transparent text-base text-muted-foreground transition-colors hover:text-ink",
                mode === "login" && "border-primary text-ink"
              )}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              aria-current={mode === "register" ? "page" : undefined}
              className={cn(
                "flex h-[52px] items-center justify-center border-b-[3px] border-transparent text-base text-muted-foreground transition-colors hover:text-ink",
                mode === "register" && "border-primary text-ink"
              )}
            >
              Registrarse
            </Link>
          </nav>

          <div className="flex flex-col gap-8 p-6 sm:p-8">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-[28.432px] leading-[1.4] font-normal text-ink">
                {content.title}
              </h1>
              <p className="text-base text-muted-foreground">
                {content.subtitle}
              </p>
            </div>

            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </section>

        <p className="max-w-[480px] text-center text-xs text-muted-foreground">
          Tus documentos se procesan de forma segura y solo se usan para
          generar tu diagnóstico.
        </p>
      </main>
    </div>
  );
}

export { AuthView };
