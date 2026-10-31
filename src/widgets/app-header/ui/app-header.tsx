"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserRound } from "lucide-react"

import { cn } from "cn"
import { BrandMark } from "./brand-mark"

const navigation = [
  { href: "/upload", label: "Cargar documentos" },
  { href: "/analysis", label: "Diagnóstico ATS" },
]

function AppHeader({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <header className={cn("border-b border-line bg-canvas", className)}>
      <div className="mx-auto flex h-20 w-full max-w-[1376px] items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/upload" aria-label="Ir a carga de documentos">
          <BrandMark />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-base text-muted-foreground transition-colors hover:text-ink",
                  isActive && "border-primary text-ink"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/login"
          aria-label="Cuenta"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:border-primary"
        >
          <UserRound aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </header>
  )
}

export { AppHeader }
