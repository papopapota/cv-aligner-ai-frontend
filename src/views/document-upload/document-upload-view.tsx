import { PageHeader } from "@/shared/ui"
import { UploadPanel } from "@/widgets/upload-panel"

export function DocumentUploadView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Carga de Documentos"
        description="Sube tu CV y la descripción de la vacante para generar un diagnóstico ATS alineado a la oferta."
      />
      <UploadPanel />
    </div>
  )
}
