import { BrandMark } from "./brand-mark"

function AuthHeader({ screenId = "SCR-01" }: { screenId?: string }) {
  return (
    <header className="bg-secondary">
      <div className="mx-auto flex h-20 w-full max-w-[1376px] items-center justify-between gap-6 px-4 sm:px-8">
        <BrandMark />
        <span className="text-xs text-ink/70">{screenId}</span>
      </div>
    </header>
  )
}

export { AuthHeader }
