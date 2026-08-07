import type {
  ConversationAnalysisRecord,
  ConversationAnalysisResponse,
  ConversationRecord,
  ConversationSummary,
} from "@/lib/communication/types";

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

function toString(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }

  return String(value);
}

function normalizeOrderFields(
  raw: Record<string, unknown>
): ConversationAnalysisRecord {
  const quantity = toNumber(raw.quantity ?? raw["數量"]) || 1;
  const amount =
    toNumber(raw.amount ?? raw["金額"]) ||
    toNumber(raw.price ?? raw["價格"] ?? raw["單價"]) * quantity;

  return {
    orderNumber: toString(
      raw.orderNumber ?? raw["訂單編號"] ?? raw["order_number"]
    ),
    customerName: toString(
      raw.customerName ?? raw["客戶名稱"] ?? raw["customer_name"],
      "未知客戶"
    ),
    customerId: toString(
      raw.customerId ?? raw["客戶編號"] ?? raw["customer_id"]
    ),
    platform: toString(raw.platform ?? raw["平台"]),
    product: toString(raw.product ?? raw["產品"] ?? raw["商品"]),
    sku: toString(raw.sku ?? raw["SKU"] ?? raw["sku_code"]),
    quantity,
    amount: Math.round(amount * 100) / 100,
    currency: toString(raw.currency ?? raw["幣別"] ?? raw["currency_code"], "TWD"),
    paymentStatus: toString(
      raw.paymentStatus ?? raw["付款狀態"] ?? raw["payment_status"]
    ),
    paymentMethod: toString(
      raw.paymentMethod ?? raw["付款方式"] ?? raw["payment_method"]
    ),
    paymentDate: toString(
      raw.paymentDate ?? raw["付款日期"] ?? raw["payment_date"]
    ),
    orderStatus: toString(
      raw.orderStatus ?? raw["訂單狀態"] ?? raw["order_status"]
    ),
    shippingMethod: toString(
      raw.shippingMethod ?? raw["配送方式"] ?? raw["shipping_method"]
    ),
    trackingNumber: toString(
      raw.trackingNumber ?? raw["物流編號"] ?? raw["tracking_number"]
    ),
    shippingDate: toString(
      raw.shippingDate ?? raw["出貨日期"] ?? raw["shipping_date"]
    ),
    customerNotified: toString(
      raw.customerNotified ??
        raw["customer_notified"] ??
        raw["客戶已通知"] ??
        raw["已通知客戶"]
    ),
    notes: toString(
      raw.notes ??
        raw.note ??
        raw["備註"] ??
        raw["order_note"] ??
        raw["orderNote"]
    ),
    orderDate: toString(raw.orderDate ?? raw["訂單日期"] ?? raw["order_date"]),
    confidence: Math.min(
      100,
      Math.max(0, toNumber(raw.confidence ?? raw["信心度"]))
    ),
  };
}

function normalizeRecord(raw: Record<string, unknown>): ConversationAnalysisRecord {
  return normalizeOrderFields(raw);
}

export function normalizeStoredConversationRecord(
  raw: Partial<ConversationRecord>
): ConversationRecord {
  const normalized = normalizeOrderFields(
    raw as Partial<ConversationRecord> & Record<string, unknown>
  );
  const createdAt =
    toString(raw.createdAt) ||
    toString(raw.analyzedAt) ||
    new Date().toISOString();

  return {
    ...normalized,
    id: toString(raw.id) || crypto.randomUUID(),
    sourceLabel: toString(raw.sourceLabel),
    createdAt,
    analyzedAt: createdAt,
  };
}

export function normalizeConversationResponse(
  data: unknown
): ConversationAnalysisRecord[] {
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

export function createConversationRecords(
  records: ConversationAnalysisRecord[],
  sourceLabel: string
): ConversationRecord[] {
  const createdAt = new Date().toISOString();

  return records.map((record) => ({
    ...record,
    id: crypto.randomUUID(),
    sourceLabel,
    createdAt,
    analyzedAt: createdAt,
  }));
}

export function getRecordAmount(record: ConversationAnalysisRecord): number {
  return record.amount;
}

export function isPaidStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized.includes("paid") ||
    normalized.includes("已付") ||
    normalized.includes("已付款") ||
    normalized.includes("完成付款")
  );
}

export function isUnpaidStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized.includes("unpaid") ||
    normalized.includes("未付") ||
    normalized.includes("待付款") ||
    normalized.includes("部分")
  );
}

export function computeConversationSummary(
  records: ConversationRecord[]
): ConversationSummary {
  return records.reduce(
    (summary, record) => {
      const amount = getRecordAmount(record);
      const paid = isPaidStatus(record.paymentStatus);
      const unpaid = isUnpaidStatus(record.paymentStatus);

      return {
        totalOrders: summary.totalOrders + 1,
        paid: summary.paid + (paid ? amount : 0),
        unpaid: summary.unpaid + (unpaid ? amount : 0),
        refund: summary.refund,
        revenue: summary.revenue + (paid ? amount : 0),
      };
    },
    {
      totalOrders: 0,
      paid: 0,
      unpaid: 0,
      refund: 0,
      revenue: 0,
    }
  );
}

export function filterConversationRecords(
  records: ConversationRecord[],
  query: string
): ConversationRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return records;
  }

  return records.filter((record) =>
    [
      record.orderNumber,
      record.customerName,
      record.customerId,
      record.platform,
      record.product,
      record.sku,
      record.paymentStatus,
      record.paymentMethod,
      record.orderStatus,
      record.orderDate,
      record.paymentDate,
      record.shippingMethod,
      record.trackingNumber,
      record.shippingDate,
      record.currency,
      record.sourceLabel,
      record.notes,
    ].some((value) => value.toLowerCase().includes(normalized))
  );
}

export async function analyzeConversationText(
  text: string
): Promise<ConversationAnalysisResponse> {
  const response = await fetch("/api/analyze-conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Conversation analysis failed");
  }

  const data = await response.json();
  return {
    records: normalizeConversationResponse(data),
  };
}

export async function parseConversationFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const raw = await file.text();

  if (extension === "json") {
    try {
      const parsed = JSON.parse(raw) as unknown;

      if (typeof parsed === "string") {
        return parsed;
      }

      if (parsed && typeof parsed === "object") {
        const payload = parsed as Record<string, unknown>;

        if (typeof payload.text === "string") {
          return payload.text;
        }

        if (typeof payload.conversation === "string") {
          return payload.conversation;
        }

        if (Array.isArray(payload.messages)) {
          return payload.messages
            .map((message) => {
              const item = message as Record<string, unknown>;
              const sender = item.sender ?? item.role ?? item.name ?? "User";
              const content = item.content ?? item.text ?? item.message ?? "";
              return `${String(sender)}: ${String(content)}`;
            })
            .join("\n");
        }
      }

      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  return raw;
}

export function buildConversationSourceLabel(file?: File | null): string {
  if (file) {
    return file.name;
  }

  return "手動貼上";
}
