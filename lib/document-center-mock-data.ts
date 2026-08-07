export type DocumentPreviewType =
  | "invoice"
  | "receipt"
  | "spreadsheet"
  | "word"
  | "contract";

export interface RecentUpload {
  id: string;
  name: string;
  type: DocumentPreviewType;
  extension: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "ready" | "failed";
}

export interface PreviewField {
  label: string;
  value: string;
}

export interface DocumentPreviewData {
  type: DocumentPreviewType;
  title: string;
  subtitle: string;
  confidence: number;
  fields: PreviewField[];
  highlights: string[];
}

export type FormatCategoryKey =
  | "images"
  | "documents"
  | "spreadsheets"
  | "presentations";

export const supportedFormats: {
  categoryKey: FormatCategoryKey;
  formats: string[];
  color: string;
}[] = [
  {
    categoryKey: "images",
    formats: ["JPG", "JPEG", "PNG", "WEBP", "HEIC"],
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    categoryKey: "documents",
    formats: ["PDF", "DOCX", "DOC"],
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    categoryKey: "spreadsheets",
    formats: ["XLSX", "XLS", "CSV"],
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    categoryKey: "presentations",
    formats: ["PPTX"],
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export const recentUploads: RecentUpload[] = [
  {
    id: "1",
    name: "acme-invoice-0312.pdf",
    type: "invoice",
    extension: "PDF",
    size: "248 KB",
    uploadedAt: "2 分鐘前",
    status: "ready",
  },
  {
    id: "2",
    name: "team-lunch-receipt.jpg",
    type: "receipt",
    extension: "JPG",
    size: "1.2 MB",
    uploadedAt: "15 分鐘前",
    status: "ready",
  },
  {
    id: "3",
    name: "q3-expense-report.xlsx",
    type: "spreadsheet",
    extension: "XLSX",
    size: "892 KB",
    uploadedAt: "1 小時前",
    status: "processing",
  },
  {
    id: "4",
    name: "vendor-agreement-v2.docx",
    type: "word",
    extension: "DOCX",
    size: "156 KB",
    uploadedAt: "2 小時前",
    status: "ready",
  },
  {
    id: "5",
    name: "service-contract-2026.pdf",
    type: "contract",
    extension: "PDF",
    size: "512 KB",
    uploadedAt: "昨天",
    status: "ready",
  },
  {
    id: "6",
    name: "office-supplies-receipt.png",
    type: "receipt",
    extension: "PNG",
    size: "340 KB",
    uploadedAt: "昨天",
    status: "ready",
  },
];

export const previewDataMap: Record<DocumentPreviewType, DocumentPreviewData> = {
  invoice: {
    type: "invoice",
    title: "供應商發票",
    subtitle: "AI 已辨識結構化發票資料",
    confidence: 97,
    fields: [
      { label: "發票號碼", value: "INV-2026-0312" },
      { label: "供應商", value: "Acme 辦公用品" },
      { label: "金額", value: "NT$1,245" },
      { label: "到期日", value: "2026/08/15" },
      { label: "會計科目", value: "6100 · 辦公用品費" },
    ],
    highlights: [
      "已擷取稅額：NT$112",
      "付款條件：月結 30 天",
      "辨識到 3 筆明細項目",
    ],
  },
  receipt: {
    type: "receipt",
    title: "支出收據",
    subtitle: "AI 已辨識收據與商家資訊",
    confidence: 94,
    fields: [
      { label: "商家", value: "Blue Bottle Coffee" },
      { label: "總額", value: "NT$86" },
      { label: "日期", value: "2026/08/02" },
      { label: "類別", value: "餐飲交際費" },
      { label: "付款方式", value: "公司卡 ·••• 4821" },
    ],
    highlights: [
      "小費金額：NT$12",
      "收據上共 4 項商品",
      "建議傳票：VCH-2026-0162",
    ],
  },
  spreadsheet: {
    type: "spreadsheet",
    title: "Excel 試算表",
    subtitle: "AI 已辨識表格化會計資料",
    confidence: 91,
    fields: [
      { label: "檔案", value: "q3-expense-report.xlsx" },
      { label: "工作表", value: "3 個" },
      { label: "列數", value: "248 列" },
      { label: "欄位", value: "日期、供應商、金額、科目" },
      { label: "合計", value: "NT$48,392" },
    ],
    highlights: [
      "第 1 列自動辨識為標題列",
      "標記 12 筆可能重複的資料",
      "可進行分類帳匯入對應",
    ],
  },
  word: {
    type: "word",
    title: "Word 文件",
    subtitle: "AI 已辨識文件結構與關鍵條款",
    confidence: 89,
    fields: [
      { label: "文件名稱", value: "vendor-agreement-v2.docx" },
      { label: "頁數", value: "8 頁" },
      { label: "字數", value: "2,840 字" },
      { label: "作者", value: "法務部" },
      { label: "最後修改", value: "2026/07/28" },
    ],
    highlights: [
      "已辨識 §4.2 付款條款",
      "已擷取終止條款內容",
      "交易對象：太平洋電信",
    ],
  },
  contract: {
    type: "contract",
    title: "服務合約",
    subtitle: "AI 已辨識合約義務與簽約方",
    confidence: 96,
    fields: [
      { label: "合約編號", value: "CTR-2026-0089" },
      { label: "甲方", value: "Ledger 股份有限公司" },
      { label: "乙方", value: "CloudServe 股份有限公司" },
      { label: "生效日期", value: "2026/01/01" },
      { label: "合約金額", value: "NT$36,000 / 年" },
    ],
    highlights: [
      "續約條款：每年自動續約",
      "附錄 B 已辨識 SLA 條款",
      "第 6 頁已辨識簽名欄位",
    ],
  },
};

export const defaultSelectedUploadId = recentUploads[0].id;
