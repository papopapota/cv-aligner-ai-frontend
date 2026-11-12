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
  buildCvSectionComparisons,
  buildOriginalBlocks,
  clearCvEditorDraft,
  countAchievements,
  exportCvToPdf,
  getCvEditorDraftSnapshot,
  parseCvEditorDraft,
  saveCvEditorDraft,
  subscribeToCvEditorDraft,
  useCvContentQuery,
  type CvSectionComparison,
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
import { buildPersonalInfoComparisons } from "../model/personal-info-comparison"
import { CvOriginalPanel } from "./cv-original-panel"
import { CvPersonalInfoDiff } from "./cv-personal-info-diff"

function useOptimizationResult() {
  const rawResult = useSyncExternalStore(
    subscribeToOptimizationResult,
    getOptimizationResultSnapshot,
    () => null
  )

  return useMemo(() => parseOptimizationResult(rawResult), [rawResult])
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function CvDiffViewer() {
  const result = useOptimizationResult()
  const cvId = result?.cv_id
  const contentQuery = useCvContentQuery(cvId)
  const originalTechnicalData = contentQuery.data?.structured_cv?.technical_data
  const optimizedSections = result?.optimized_sections
  const fallbackOptimizedBody =
    result?.optimized_body ?? result?.optimized_content
  const originalBlocks = useMemo(
    () => (contentQuery.data ? buildOriginalBlocks(contentQuery.data) : []),
    [contentQuery.data]
  )
  const comparisons = useMemo(
    () =>
      buildCvSectionComparisons({
        originalSections: originalTechnicalData,
        originalBlocks,
        optimizedSections,
        fallbackOptimizedBody,
      }),
    [
      fallbackOptimizedBody,
      optimizedSections,
      originalBlocks,
      originalTechnicalData,
    ]
  )
  const draftBase = useMemo(() => {
    if (optimizedSections) {
      return JSON.stringify(optimizedSections)
    }

    return fallbackOptimizedBody ?? ""
  }, [fallbackOptimizedBody, optimizedSections])
  const originalPersonalInfo = contentQuery.data?.structured_cv?.personal_info
  const optimizedPersonalInfo = result?.personal_info ?? originalPersonalInfo
  const personalInfoComparisons = useMemo(
    () =>
      buildPersonalInfoComparisons(
        originalPersonalInfo,
        optimizedPersonalInfo
      ),
    [optimizedPersonalInfo, originalPersonalInfo]
  )
  const personalInfoMissing = Boolean(
    result && !result.personal_info && originalPersonalInfo
  )

  const rawDraft = useSyncExternalStore(
    subscribeToCvEditorDraft,
    getCvEditorDraftSnapshot,
    () => null
  )
  const draft = useMemo(() => parseCvEditorDraft(rawDraft), [rawDraft])
  const edits = useMemo(() => {
    if (!draft || draft.baseOptimizedContent !== draftBase) {
      return {}
    }

    return draft.edits
  }, [draft, draftBase])
  const [isExporting, setIsExporting] = useState(false)

  const valueFor = useCallback(
    (comparison: CvSectionComparison) =>
      edits[comparison.key] ?? comparison.optimizedBody,
    [edits]
  )

  const hasLocalEdit = useCallback(
    (comparison: CvSectionComparison) =>
      edits[comparison.key] !== undefined &&
      edits[comparison.key] !== comparison.optimizedBody,
    [edits]
  )

  const persistEdits = useCallback(
    (nextEdits: Record<string, string>) => {
      if (!result) {
        return
      }

      saveCvEditorDraft({
        cvId,
        baseOptimizedContent: draftBase,
        edits: nextEdits,
      })
    },
    [cvId, draftBase, result]
  )

  const handleChange = useCallback(
    (sectionKey: string, value: string) => {
      persistEdits({ ...edits, [sectionKey]: value })
    },
    [edits, persistEdits]
  )

  const handleRevert = useCallback(
    (sectionKey: string) => {
      const nextEdits = { ...edits }
      delete nextEdits[sectionKey]
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
        personalInfo: optimizedPersonalInfo,
        blocks: comparisons
          .filter((comparison) => comparison.status !== "removed")
          .map((comparison) => ({
            id: comparison.key,
            heading: comparison.heading,
            body: valueFor(comparison),
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
  }, [comparisons, optimizedPersonalInfo, valueFor])

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

  const editedContent = comparisons
    .filter((comparison) => comparison.status !== "removed")
    .map((comparison) => valueFor(comparison))
    .join("\n")
  const achievements = countAchievements(editedContent)
  const localEditCount = comparisons.filter(hasLocalEdit).length
  const detectedCounts = comparisons.reduce(
    (counts, comparison) => {
      counts[comparison.status] += 1
      return counts
    },
    { unchanged: 0, modified: 0, added: 0, removed: 0 }
  )
  const detectedSummary = [
    formatCount(detectedCounts.modified, "modificada", "modificadas"),
    formatCount(detectedCounts.added, "añadida", "añadidas"),
    formatCount(detectedCounts.removed, "eliminada", "eliminadas"),
  ].join(" · ")

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
            disabled={isExporting || comparisons.length === 0}
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

      <CvPersonalInfoDiff
        comparisons={personalInfoComparisons}
        optimizedMissing={personalInfoMissing}
      />

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
              personalInfo={originalPersonalInfo}
              blocks={comparisons
                .filter((comparison) => comparison.originalBody.length > 0)
                .map((comparison) => ({
                  id: comparison.key,
                  heading: comparison.heading,
                  body: comparison.originalBody,
                }))}
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
            {comparisons.length > 0 ? (
              comparisons.map((comparison) => (
                <EditableCvBlock
                  key={comparison.key}
                  block={{
                    id: comparison.key,
                    heading: comparison.heading,
                    body: comparison.optimizedBody,
                  }}
                  status={comparison.status}
                  originalText={comparison.originalBody}
                  value={valueFor(comparison)}
                  hasLocalEdit={hasLocalEdit(comparison)}
                  onChange={(value) => handleChange(comparison.key, value)}
                  onRevert={() => handleRevert(comparison.key)}
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
          {achievements} logros detectados · {detectedSummary}
          {localEditCount > 0
            ? ` · ${formatCount(localEditCount, "edición local", "ediciones locales")}`
            : ""}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={localEditCount === 0}
        >
          <RotateCcw aria-hidden="true" />
          Restaurar todo
        </Button>
      </div>
    </div>
  )
}
