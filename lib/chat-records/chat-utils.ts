import type {
  ChatAnalysisRecord,
  ChatAnalysisResponse,
  ChatRecord,
  ChatSummary,
} from "@/lib/chat-records/types";

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeRecord(raw: Record<string, unknown>): ChatAnalysisRecord {
  return {
    customerName: String(
      raw.customerName ?? raw["客戶名稱"] ?? raw["customer_name"] ?? ""
    ),
    paidAmount: toNumber(raw.paidAmount ?? raw["已付金額"] ?? raw["paid_amount"]),
    unpaidAmount: toNumber(
      raw.unpaidAmount ?? raw["未付金額"] ?? raw["unpaid_amount"]
    ),
    refundAmount: toNumber(
      raw.refundAmount ?? raw["退款金額"] ?? raw["refund_amount"]
    ),
    paymentStatus: String(
      raw.paymentStatus ?? raw["付款狀態"] ?? raw["payment_status"] ?? ""
    ),
    orderNote: String(raw.orderNote ?? raw["訂單備註"] ?? raw["order_note"] ?? ""),
  };
}

export function normalizeAnalysisResponse(
  data: unknown
): ChatAnalysisRecord[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.records)) {
    return payload.records.map((record) =>
      normalizeRecord(record as Record<string, unknown>)
    );
  }

  if (Array.isArray(data)) {
    return data.map((record) =>
      normalizeRecord(record as Record<string, unknown>)
    );
  }

  return [normalizeRecord(payload)];
}

export function createChatRecords(
  records: ChatAnalysisRecord[],
  sourceLabel: string
): ChatRecord[] {
  const analyzedAt = new Date().toISOString();

  return records.map((record) => ({
    ...record,
    id: crypto.randomUUID(),
    sourceLabel,
    analyzedAt,
  }));
}

export function computeChatSummary(records: ChatRecord[]): ChatSummary {
  return records.reduce(
    (summary, record) => ({
      totalReceived: summary.totalReceived + record.paidAmount,
      totalUnpaid: summary.totalUnpaid + record.unpaidAmount,
      totalRefund: summary.totalRefund + record.refundAmount,
    }),
    {
      totalReceived: 0,
      totalUnpaid: 0,
      totalRefund: 0,
    }
  );
}

export function filterChatRecords(
  records: ChatRecord[],
  query: string
): ChatRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return records;
  }

  return records.filter((record) =>
    [
      record.customerName,
      record.paymentStatus,
      record.orderNote,
      record.sourceLabel,
      String(record.paidAmount),
      String(record.unpaidAmount),
      String(record.refundAmount),
    ].some((value) => value.toLowerCase().includes(normalized))
  );
}

export async function analyzeChatText(text: string): Promise<ChatAnalysisResponse> {
  const response = await fetch("/api/analyze-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Chat analysis failed");
  }

  const data = await response.json();
  return {
    records: normalizeAnalysisResponse(data),
  };
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}

export function buildSourceLabel(file?: File | null): string {
  if (file) {
    return file.name;
  }

  return "手動貼上";
}
