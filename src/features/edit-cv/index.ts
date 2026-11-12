export { useCvContentQuery } from "./api/get-cv-content"
export { exportCvToPdf } from "./lib/export-cv-pdf"
export {
  buildCvSectionComparisons,
  buildOriginalBlocks,
  countAchievements,
  CV_SECTION_DEFINITIONS,
  diffWords,
  findMatchingBlock,
  hasBlockChanges,
  normalizeHeading,
  parseCvBlocks,
  serializeCvDocument,
} from "./model/cv-document"
export type {
  CvBlock,
  CvSectionComparison,
  CvSectionKey,
  CvSectionStatus,
  DiffSegment,
  DiffSegmentType,
} from "./model/cv-document"
export {
  clearCvEditorDraft,
  CV_EDITOR_STORAGE_KEY,
  cvEditorDraftSchema,
  getCvEditorDraftSnapshot,
  parseCvEditorDraft,
  readCvEditorDraft,
  saveCvEditorDraft,
  subscribeToCvEditorDraft,
} from "./model/cv-editor-storage"
export type { CvEditorDraft } from "./model/cv-editor-storage"
export { CvDiffText } from "./ui/cv-diff-text"
export { EditableCvBlock } from "./ui/editable-cv-block"
