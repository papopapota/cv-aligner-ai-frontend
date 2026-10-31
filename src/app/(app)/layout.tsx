import { AppHeader } from "@/widgets/app-header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1376px] flex-1 flex-col px-4 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  )
}
