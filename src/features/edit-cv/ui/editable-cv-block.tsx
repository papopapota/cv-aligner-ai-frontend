"use client"

import { RotateCcw } from "lucide-react"

import { Badge, Button, Textarea } from "@/shared/ui"
import { cn } from "cn"
import {
  diffWords,
  hasBlockChanges,
  type CvBlock,
} from "../model/cv-document"

interface EditableCvBlockProps {
  block: CvBlock
  originalText: string
  value: string
  onChange: (value: string) => void
  onRevert: () => void
}

export function EditableCvBlock({
  block,
  originalText,
  value,
  onChange,
  onRevert,
}: EditableCvBlockProps) {
  const modified = hasBlockChanges(originalText, value)
  const segments = modified ? diffWords(originalText, value) : []

  return (
    <section
      aria-label={block.heading}
      className="flex flex-col gap-3 border border-line bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base text-ink">{block.heading}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={modified ? "secondary" : "outline"}>
            {modified ? "Modificado" : "Sin cambios"}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRevert}
            disabled={!modified}
          >
            <RotateCcw aria-hidden="true" />
            Revertir cambios
          </Button>
        </div>
      </div>

      <Textarea
        aria-label={`Editar ${block.heading}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 text-sm"
      />

      {modified ? (
        <div className="flex flex-col gap-2 border border-line bg-canvas p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Cambios respecto al CV original
          </p>
          <p className="whitespace-pre-wrap text-sm text-ink">
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
          </p>
        </div>
      ) : null}
    </section>
  )
}
