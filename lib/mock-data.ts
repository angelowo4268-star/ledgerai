export type DocumentStatus = "approved" | "pending" | "review" | "rejected";

export interface Document {
  id: string;
  document: string;
  vendor: string;
  amount: number;
  date: string;
  status: DocumentStatus;
  category?: string;
}

export interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
}

export const dashboardStats: StatCardData[] = [
  {
    title: "今日發票",
    value: "47",
    change: "較昨日 +8",
    changeType: "positive",
    icon: "invoices",
  },
  {
    title: "AI 已辨識",
    value: "42",
    change: "辨識率 89.4%",
    changeType: "positive",
    icon: "ai",
  },
  {
    title: "待審核",
    value: "12",
    change: "5 筆需留意",
    changeType: "neutral",
    icon: "pending",
  },
  {
    title: "已產生傳票",
    value: "38",
    change: "今日 +6",
    changeType: "positive",
    icon: "vouchers",
  },
];

export const recentDocuments: Document[] = [
  {
    id: "1",
    document: "INV-2026-0312",
    vendor: "Acme 辦公用品",
    amount: 1245.0,
    date: "2026/08/02",
    status: "approved",
    category: "辦公用品費 · 6100",
  },
  {
    id: "2",
    document: "INV-2026-0311",
    vendor: "太平洋電信",
    amount: 3890.5,
    date: "2026/08/02",
    status: "pending",
    category: "水電費 · 6200",
  },
  {
    id: "3",
    document: "BILL-2026-0089",
    vendor: "勤業眾信",
    amount: 8750.0,
    date: "2026/08/01",
    status: "approved",
    category: "專業服務費 · 6300",
  },
  {
    id: "4",
    document: "INV-2026-0308",
    vendor: "FedEx 企業快遞",
    amount: 428.75,
    date: "2026/08/01",
    status: "review",
    category: "運費 · 6400",
  },
  {
    id: "5",
    document: "VCH-2026-0156",
    vendor: "薪資分攤",
    amount: 24500.0,
    date: "2026/07/31",
    status: "approved",
    category: "薪資支出 · 7100",
  },
  {
    id: "6",
    document: "INV-2026-0305",
    vendor: "Microsoft 台灣",
    amount: 1560.0,
    date: "2026/07/31",
    status: "rejected",
    category: "軟體授權 · 6500",
  },
  {
    id: "7",
    document: "INV-2026-0302",
    vendor: "台電公司",
    amount: 2180.3,
    date: "2026/07/30",
    status: "approved",
    category: "水電費 · 6200",
  },
];

export const navItems = [
  { key: "dashboard", href: "/", icon: "layout-dashboard" },
  { key: "documentCenter", href: "/invoice-upload", icon: "upload" },
  { key: "aiRecognition", href: "/ai-recognition", icon: "sparkles" },
  { key: "voucherManagement", href: "/voucher-management", icon: "voucher" },
  { key: "companyRules", href: "/company-rules", icon: "scale" },
  { key: "chatRecords", href: "/chat-records", icon: "messages-square" },
  { key: "communicationCenter", href: "/communication-center", icon: "message-circle" },
  { key: "aiReports", href: "/reports", icon: "bar-chart" },
  { key: "importCenter", href: "/import-center", icon: "cloud-download" },
  { key: "excelImport", href: "/excel-import", icon: "file-spreadsheet" },
  { key: "history", href: "/history", icon: "history" },
  { key: "settings", href: "/settings", icon: "settings" },
] as const;

export type NavItemKey = (typeof navItems)[number]["key"];
