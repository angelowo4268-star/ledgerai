import type { ParsedChatOrder } from "@/lib/ai-chat-parser/types";

function isPaidStatus(status: string) {
  const normalized = status.toLowerCase();
  return (
    normalized.includes("paid") ||
    status.includes("已匯") ||
    status.includes("已付")
  );
}

function isRefundStatus(status: string) {
  const normalized = status.toLowerCase();
  return normalized.includes("refund") || status.includes("退");
}

function isCodPayment(paymentMethod: string) {
  const normalized = paymentMethod.toLowerCase();
  return (
    normalized === "cod" ||
    normalized.includes("cash on delivery") ||
    paymentMethod.includes("取付") ||
    paymentMethod.includes("貨到付款")
  );
}

export function enrichOrderWorkflow(order: ParsedChatOrder): ParsedChatOrder {
  const next = { ...order };

  if (next.total <= 0 && (next.paid > 0 || next.remaining > 0)) {
    next.total = next.paid + next.remaining;
  }

  if (isCodPayment(next.paymentMethod)) {
    next.paymentMethod = "COD";
    if (!next.status || next.status === "Unknown") {
      next.status = "Unpaid";
    }
  }

  if (isPaidStatus(next.status)) {
    next.status = "Paid";
    if (next.total > 0) {
      next.paid = next.total;
      next.remaining = 0;
    } else if (next.paid > 0) {
      next.total = next.paid;
      next.remaining = 0;
    }
  }

  if (isRefundStatus(next.status) && next.refund <= 0 && next.total > 0) {
    next.status = "Refund Pending";
  }

  if (
    next.remaining > 0 &&
    !isPaidStatus(next.status) &&
    !isRefundStatus(next.status)
  ) {
    if (!next.status || next.status === "Unknown") {
      next.status = "Pending Payment";
    }
  }

  if (next.total > 0 && next.paid > 0 && next.remaining <= 0 && !isPaidStatus(next.status)) {
    next.remaining = Math.max(0, next.total - next.paid);
    if (next.remaining > 0 && !next.status) {
      next.status = "Pending Payment";
    }
  }

  return next;
}
