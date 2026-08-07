import type { FilePreviewCategory } from "@/lib/file-preview";
import { getFilePreviewCategory } from "@/lib/file-preview";

export type UploadFileStatus = "uploading" | "ready" | "error";

export interface UploadedFileItem {
  id: string;
  file: File;
  status: UploadFileStatus;
  category: FilePreviewCategory;
}

export function createUploadedFileItem(file: File): UploadedFileItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    status: "uploading",
    category: getFilePreviewCategory(file),
  };
}

export const uploadStatusConfig: Record<
  UploadFileStatus,
  { label: string; className: string }
> = {
  uploading: {
    label: "上傳中",
    className: "bg-violet-50 text-violet-700",
  },
  ready: {
    label: "就緒",
    className: "bg-emerald-50 text-emerald-700",
  },
  error: {
    label: "失敗",
    className: "bg-red-50 text-red-700",
  },
};
