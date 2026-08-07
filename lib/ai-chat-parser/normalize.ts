import { enrichOrderWorkflow } from "@/lib/ai-chat-parser/workflow";
import type {
  ParsedChatOrder,
  ParsedChatOrderDraft,
} from "@/lib/ai-chat-parser/types";

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  return 0;
}

function toString(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }

  return String(value).trim();
}

function clampConfidence(value: unknown) {
  const parsed = toNumber(value);
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function pickString(draft: ParsedChatOrderDraft, ...keys: Array<keyof ParsedChatOrderDraft>) {
  for (const key of keys) {
    const value = draft[key];
    if (value != null && String(value).trim() !== "") {
      return toString(value);
    }
  }

  return "";
}

function pickNumber(draft: ParsedChatOrderDraft, ...keys: Array<keyof ParsedChatOrderDraft>) {
  for (const key of keys) {
    const value = draft[key];
    if (value != null && value !== "") {
      return toNumber(value);
    }
  }

  return 0;
}

export function normalizeParsedChatOrders(
  drafts: ParsedChatOrderDraft[],
  fallbackSourceLine = ""
): ParsedChatOrder[] {
  return drafts.map((draft) => {
    const paid = pickNumber(draft, "paid", "paidAmount");
    const remaining = pickNumber(draft, "remaining", "remainingAmount");
    let total = pickNumber(draft, "total", "totalPrice");

    if (total <= 0 && (paid > 0 || remaining > 0)) {
      total = paid + remaining;
    }

    const quantity = pickNumber(draft, "quantity") || 1;

    return enrichOrderWorkflow({
      id: crypto.randomUUID(),
      customer: pickString(draft, "customer", "customerName") || "未知客戶",
      product: pickString(draft, "product"),
      quantity,
      total,
      paid,
      remaining,
      refund: pickNumber(draft, "refund", "refundAmount"),
      shipping: pickNumber(draft, "shipping", "shippingFee"),
      paymentMethod: pickString(draft, "paymentMethod"),
      status: pickString(draft, "status", "orderStatus") || "Unknown",
      notes: pickString(draft, "notes"),
      sourceLine: pickString(draft, "sourceLine") || fallbackSourceLine,
      confidence: clampConfidence(draft.confidence),
    });
  });
}

export function extractSummaryDraft(data: unknown) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const payload = data as Record<string, unknown>;
  const summary = payload.summary;

  if (!summary || typeof summary !== "object") {
    return undefined;
  }

  return summary as Record<string, unknown>;
}

export function normalizeParseChatResponse(data: unknown): ParsedChatOrderDraft[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.orders)) {
    return payload.orders as ParsedChatOrderDraft[];
  }

  if (Array.isArray(payload.records)) {
    return payload.records as ParsedChatOrderDraft[];
  }

  if (Array.isArray(data)) {
    return data as ParsedChatOrderDraft[];
  }

  return [payload as ParsedChatOrderDraft];
}
