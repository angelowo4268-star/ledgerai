import type { FilePreviewCategory } from "@/lib/file-preview";
import type { TranslationKey } from "@/lib/i18n/types";

export function getFileCategoryLabel(
  category: FilePreviewCategory,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  switch (category) {
    case "image":
      return t("documentCenter.fileCategoryImage");
    case "pdf":
      return t("documentCenter.fileCategoryPdf");
    case "spreadsheet":
      return t("documentCenter.fileCategorySpreadsheet");
    case "word":
      return t("documentCenter.fileCategoryWord");
    case "presentation":
      return t("documentCenter.fileCategoryPresentation");
    default:
      return t("documentCenter.fileCategoryUnknown");
  }
}
