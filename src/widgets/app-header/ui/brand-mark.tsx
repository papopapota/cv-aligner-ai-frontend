import { cn } from "cn"

interface BrandMarkProps {
  className?: string
  compact?: boolean
}

function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center border border-line bg-card font-display text-sm text-primary"
      >
        CV
      </span>
      {compact ? null : (
        <span className="font-display text-xl leading-none text-ink">
          CV Aligner AI
        </span>
      )}
    </div>
  )
}

export { BrandMark }
export type { BrandMarkProps }
