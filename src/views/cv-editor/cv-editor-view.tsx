import { Badge, PageHeader } from "@/shared/ui"
import { CvDiffViewer } from "@/widgets/cv-diff-viewer"

export function CvEditorView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Editor de CV Optimizado"
        description="Ajusta el contenido generado, compáralo con tu CV original y descarga la versión final."
        actions={<Badge variant="outline">Edición asistida</Badge>}
      />
      <CvDiffViewer />
    </div>
  )
}
