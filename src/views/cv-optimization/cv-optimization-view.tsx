import Link from "next/link"

import { sampleAtsReport } from "@/entities/ats-report"
import {
  Badge,
  buttonVariants,
  PageHeader,
} from "@/shared/ui"
import { AtsScoreDashboard } from "@/widgets/ats-score-dashboard"

export function CvOptimizationView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Diagnóstico ATS Score"
        description="Revisa la compatibilidad de tu CV con la vacante y aplica las recomendaciones prioritarias."
        actions={<Badge variant="outline">Análisis completado</Badge>}
      />

      <AtsScoreDashboard report={sampleAtsReport} />

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/upload"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver a carga
        </Link>
        <p className="text-sm text-muted-foreground">
          El editor de CV estará disponible en la siguiente fase.
        </p>
      </div>
    </div>
  )
}
