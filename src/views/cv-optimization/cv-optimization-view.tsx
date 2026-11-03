import Link from "next/link"

import {
  Badge,
  buttonVariants,
  PageHeader,
} from "@/shared/ui"
import { OptimizationResult } from "@/widgets/optimization-result"

export function CvOptimizationView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="CV Optimizado"
        description="Revisa el contenido generado y la mejora en la varianza respecto a tu CV original."
        actions={<Badge variant="outline">Resultado del análisis</Badge>}
      />

      <OptimizationResult />

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
