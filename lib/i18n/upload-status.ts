import type { UploadFileStatus } from "@/lib/document-center/uploaded-file";
import type { TranslationKey } from "@/lib/i18n/types";

export function getUploadStatusLabel(
  status: UploadFileStatus,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  switch (status) {
    case "uploading":
      return t("documentCenter.statusUploading");
    case "ready":
      return t("documentCenter.statusReady");
    case "error":
      return t("documentCenter.statusError");
    default:
      return status;
  }
}

export const uploadStatusClassNames: Record<UploadFileStatus, string> = {
  uploading: "bg-violet-50 text-violet-700",
  ready: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
};
