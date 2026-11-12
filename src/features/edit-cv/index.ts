export { useCvContentQuery } from "./api/get-cv-content"
export { exportCvToPdf } from "./lib/export-cv-pdf"
export {
  buildOriginalBlocks,
  countAchievements,
  diffWords,
  findMatchingBlock,
  hasBlockChanges,
  normalizeHeading,
  parseCvBlocks,
  serializeCvDocument,
} from "./model/cv-document"
export type {
  CvBlock,
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
export { EditableCvBlock } from "./ui/editable-cv-block"
