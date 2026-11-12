import { CvDiffText } from "@/features/edit-cv"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import type {
  PersonalInfoComparison,
  PersonalInfoStatus,
} from "../model/personal-info-comparison"

interface CvPersonalInfoDiffProps {
  comparisons: PersonalInfoComparison[]
  optimizedMissing: boolean
}

const STATUS_LABELS: Record<PersonalInfoStatus, string> = {
  unchanged: "Sin cambios",
  modified: "Modificado",
  added: "Añadido",
  removed: "Eliminado",
}

const STATUS_VARIANTS: Record<
  PersonalInfoStatus,
  "outline" | "secondary" | "default" | "destructive"
> = {
  unchanged: "outline",
  modified: "secondary",
  added: "default",
  removed: "destructive",
}

function OptimizedValue({
  comparison,
}: {
  comparison: PersonalInfoComparison
}) {
  if (comparison.status === "removed") {
    return <span className="text-muted-foreground">—</span>
  }

  if (comparison.status === "unchanged") {
    return <span>{comparison.optimizedValue}</span>
  }

  return (
    <CvDiffText
      original={comparison.originalValue}
      current={comparison.optimizedValue}
    />
  )
}

export function CvPersonalInfoDiff({
  comparisons,
  optimizedMissing,
}: CvPersonalInfoDiffProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
        <CardDescription>
          Comparación entre los datos de tu CV original y el optimizado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {optimizedMissing ? (
          <p className="border border-line bg-canvas p-3 text-sm text-muted-foreground">
            El backend no devolvió datos personales optimizados. Se muestran los
            originales.
          </p>
        ) : null}

        {comparisons.length > 0 ? (
          comparisons.map((comparison) => (
            <div
              key={comparison.key}
              className="flex flex-col gap-2 border border-line bg-card p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-ink">{comparison.label}</span>
                <Badge variant={STATUS_VARIANTS[comparison.status]}>
                  {STATUS_LABELS[comparison.status]}
                </Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Original
                  </span>
                  <span className="break-words whitespace-pre-wrap text-sm text-ink">
                    {comparison.originalValue.length > 0
                      ? comparison.originalValue
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Optimizado
                  </span>
                  <span className="break-words whitespace-pre-wrap text-sm text-ink">
                    <OptimizedValue comparison={comparison} />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay datos personales disponibles para comparar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
