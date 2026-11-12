"use client"

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react"

import {
  EditableCvBlock,
  buildOriginalBlocks,
  clearCvEditorDraft,
  countAchievements,
  exportCvToPdf,
  findMatchingBlock,
  getCvEditorDraftSnapshot,
  parseCvBlocks,
  parseCvEditorDraft,
  saveCvEditorDraft,
  subscribeToCvEditorDraft,
  useCvContentQuery,
  type CvBlock,
} from "@/features/edit-cv"
import {
  getOptimizationResultSnapshot,
  parseOptimizationResult,
  subscribeToOptimizationResult,
} from "@/features/optimize-cv"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  buttonVariants,
  toast,
} from "@/shared/ui"
import { CvOriginalPanel } from "./cv-original-panel"

function useOptimizationResult() {
  const rawResult = useSyncExternalStore(
    subscribeToOptimizationResult,
    getOptimizationResultSnapshot,
    () => null
  )

  return useMemo(() => parseOptimizationResult(rawResult), [rawResult])
}

export function CvDiffViewer() {
  const result = useOptimizationResult()
  const cvId = result?.cv_id
  const contentQuery = useCvContentQuery(cvId)
  const optimizedSource = result?.optimized_body ?? result?.optimized_content ?? ""
  const optimizedBlocks = useMemo(
    () => parseCvBlocks(optimizedSource),
    [optimizedSource]
  )
  const originalBlocks = useMemo(
    () => (contentQuery.data ? buildOriginalBlocks(contentQuery.data) : []),
    [contentQuery.data]
  )
  const personalInfo =
    result?.personal_info ?? contentQuery.data?.structured_cv?.personal_info

  const rawDraft = useSyncExternalStore(
    subscribeToCvEditorDraft,
    getCvEditorDraftSnapshot,
    () => null
  )
  const draft = useMemo(() => parseCvEditorDraft(rawDraft), [rawDraft])
  const edits = useMemo(() => {
    if (!draft || draft.baseOptimizedContent !== optimizedSource) {
      return {}
    }

    return draft.edits
  }, [draft, optimizedSource])
  const [isExporting, setIsExporting] = useState(false)

  const valueFor = useCallback(
    (block: CvBlock) => edits[block.id] ?? block.body,
    [edits]
  )

  const originalTextFor = useCallback(
    (block: CvBlock) =>
      findMatchingBlock(originalBlocks, block.heading)?.body ?? "",
    [originalBlocks]
  )

  const persistEdits = useCallback(
    (nextEdits: Record<string, string>) => {
      if (!result) {
        return
      }

      saveCvEditorDraft({
        cvId,
        baseOptimizedContent: optimizedSource,
        edits: nextEdits,
      })
    },
    [cvId, optimizedSource, result]
  )

  const handleChange = useCallback(
    (blockId: string, value: string) => {
      persistEdits({ ...edits, [blockId]: value })
    },
    [edits, persistEdits]
  )

  const handleRevert = useCallback(
    (blockId: string) => {
      const nextEdits = { ...edits }
      delete nextEdits[blockId]
      persistEdits(nextEdits)
    },
    [edits, persistEdits]
  )

  const handleReset = useCallback(() => {
    clearCvEditorDraft()
  }, [])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      await exportCvToPdf({
        personalInfo,
        blocks: optimizedBlocks.map((block) => ({
          ...block,
          body: valueFor(block),
        })),
      })
      toast.add({
        title: "PDF descargado",
        description: "Tu CV optimizado se descargó correctamente.",
        type: "success",
        timeout: 5000,
      })
    } catch {
      toast.add({
        title: "No se pudo exportar el PDF",
        description: "Inténtalo de nuevo en unos segundos.",
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsExporting(false)
    }
  }, [optimizedBlocks, personalInfo, valueFor])

  if (!result) {
    return (
      <EmptyState
        icon={<FileText aria-hidden="true" />}
        title="Aún no hay un CV optimizado"
        description="Genera una optimización desde la carga de documentos para abrir el editor."
        action={
          <Link href="/upload" className={buttonVariants()}>
            Cargar documentos
          </Link>
        }
      />
    )
  }

  const editedContent = optimizedBlocks
    .map((block) => valueFor(block))
    .join("\n")
  const achievements = countAchievements(editedContent)
  const modifiedCount = optimizedBlocks.filter(
    (block) => valueFor(block) !== block.body
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg text-ink">CV optimizado</h2>
            <Badge
              variant={result.is_within_threshold ? "secondary" : "destructive"}
            >
              {result.is_within_threshold ? (
                <CheckCircle2 aria-hidden="true" />
              ) : (
                <CircleAlert aria-hidden="true" />
              )}
              {result.is_within_threshold
                ? "Coherencia dentro del umbral"
                : "Coherencia fuera del umbral"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Edita cada sección y revisa los cambios frente a tu CV original.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/analysis"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft aria-hidden="true" />
            Volver al análisis
          </Link>
          <Button
            type="button"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || optimizedBlocks.length === 0}
          >
            <Download aria-hidden="true" />
            {isExporting ? "Generando PDF..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {contentQuery.isError ? (
        <div className="border border-line bg-canvas p-4 text-sm text-muted-foreground">
          No pudimos cargar el CV original. Puedes seguir editando el contenido
          optimizado.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contenido original</CardTitle>
            <CardDescription>
              Referencia de solo lectura extraída de tu CV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CvOriginalPanel
              personalInfo={personalInfo}
              blocks={originalBlocks}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-5 text-primary" />
              Contenido optimizado
            </CardTitle>
            <CardDescription>
              Ajusta el texto. Los cambios se guardan automáticamente en esta
              sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {optimizedBlocks.length > 0 ? (
              optimizedBlocks.map((block) => (
                <EditableCvBlock
                  key={block.id}
                  block={block}
                  originalText={originalTextFor(block)}
                  value={valueFor(block)}
                  onChange={(value) => handleChange(block.id, value)}
                  onRevert={() => handleRevert(block.id)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                El CV optimizado no contiene secciones editables.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {achievements} logros detectados · {modifiedCount} secciones
          modificadas
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={modifiedCount === 0}
        >
          <RotateCcw aria-hidden="true" />
          Restaurar todo
        </Button>
      </div>
    </div>
  )
}
