export type FilePreviewCategory =
  | "image"
  | "pdf"
  | "spreadsheet"
  | "word"
  | "presentation"
  | "unknown";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const SPREADSHEET_EXTENSIONS = new Set(["xls", "xlsx", "csv"]);
const WORD_EXTENSIONS = new Set(["doc", "docx"]);
const PRESENTATION_EXTENSIONS = new Set(["pptx"]);

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function getFilePreviewCategory(file: File): FilePreviewCategory {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  switch (file.type) {
    case "application/pdf":
      return "pdf";
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "text/csv":
      return "spreadsheet";
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "word";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "presentation";
    default:
      break;
  }

  return getFilePreviewCategoryFromExtension(getExtension(file.name));
}

export function getFilePreviewCategoryFromExtension(
  extension: string
): FilePreviewCategory {
  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (PDF_EXTENSIONS.has(ext)) return "pdf";
  if (SPREADSHEET_EXTENSIONS.has(ext)) return "spreadsheet";
  if (WORD_EXTENSIONS.has(ext)) return "word";
  if (PRESENTATION_EXTENSIONS.has(ext)) return "presentation";

  return "unknown";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCategoryLabel(category: FilePreviewCategory): string {
  switch (category) {
    case "image":
      return "圖片";
    case "pdf":
      return "PDF 文件";
    case "spreadsheet":
      return "Excel 試算表";
    case "word":
      return "Word 文件";
    case "presentation":
      return "簡報";
    default:
      return "文件";
  }
}
