import { cn } from "cn"
import { diffWords } from "../model/cv-document"

interface CvDiffTextProps {
  original: string
  current: string
  className?: string
}

export function CvDiffText({
  original,
  current,
  className,
}: CvDiffTextProps) {
  const segments = diffWords(original, current)

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span
          key={`${segment.type}-${index}`}
          className={cn(
            segment.type === "added" &&
              "bg-primary/10 text-primary underline decoration-primary/40",
            segment.type === "removed" &&
              "text-destructive line-through"
          )}
        >
          {segment.value}
        </span>
      ))}
    </span>
  )
}
