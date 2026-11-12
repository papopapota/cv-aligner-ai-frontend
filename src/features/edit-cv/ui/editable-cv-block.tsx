"use client"

import { RotateCcw } from "lucide-react"

import { Badge, Button, Textarea } from "@/shared/ui"
import {
  hasBlockChanges,
  type CvBlock,
  type CvSectionStatus,
} from "../model/cv-document"
import { CvDiffText } from "./cv-diff-text"

interface EditableCvBlockProps {
  block: CvBlock
  status: CvSectionStatus
  originalText: string
  value: string
  hasLocalEdit: boolean
  onChange: (value: string) => void
  onRevert: () => void
}

export function EditableCvBlock({
  block,
  status,
  originalText,
  value,
  hasLocalEdit,
  onChange,
  onRevert,
}: EditableCvBlockProps) {
  const changed = hasBlockChanges(originalText, value)
  const badgeLabel =
    status === "removed"
      ? "Eliminado"
      : status === "added"
        ? "Añadido"
        : changed
          ? "Modificado"
          : "Sin cambios"
  const badgeVariant =
    status === "removed"
      ? "destructive"
      : status === "added"
        ? "default"
        : changed
          ? "secondary"
          : "outline"

  return (
    <section
      aria-label={block.heading}
      className="flex flex-col gap-3 border border-line bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base text-ink">{block.heading}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRevert}
            disabled={!hasLocalEdit || status === "removed"}
          >
            <RotateCcw aria-hidden="true" />
            Revertir cambios
          </Button>
        </div>
      </div>

      {status === "removed" ? (
        <div className="flex flex-col gap-2 border border-line bg-canvas p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Esta sección no está en el CV optimizado
          </p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground line-through">
            {originalText}
          </p>
        </div>
      ) : (
        <Textarea
          aria-label={`Editar ${block.heading}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-32 text-sm"
        />
      )}

      {changed && status !== "removed" ? (
        <div className="flex flex-col gap-2 border border-line bg-canvas p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Cambios respecto al CV original
          </p>
          <p className="whitespace-pre-wrap text-sm text-ink">
            <CvDiffText original={originalText} current={value} />
          </p>
        </div>
      ) : null}
    </section>
  )
}
