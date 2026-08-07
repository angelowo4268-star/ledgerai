export interface ChatParserSummary {
  orders: number;
  pendingPayments: number;
  refunds: number;
  paid: number;
  cod: number;
  shippingTotal: number;
  expectedIncome: number;
}

export type ChatParserSummaryDraft = Partial<ChatParserSummary>;

export interface ParseChatOrderResult {
  orders: ParsedChatOrder[];
  summary: ChatParserSummary;
}

export interface ParsedChatOrder {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  paid: number;
  remaining: number;
  refund: number;
  shipping: number;
  paymentMethod: string;
  status: string;
  notes: string;
  sourceLine: string;
  confidence: number;
}

export interface ParsedChatOrderDraft {
  customer?: string;
  customerName?: string;
  product?: string;
  quantity?: number;
  total?: number;
  totalPrice?: number;
  paid?: number;
  paidAmount?: number;
  remaining?: number;
  remainingAmount?: number;
  refund?: number;
  refundAmount?: number;
  shipping?: number;
  shippingFee?: number;
  paymentMethod?: string;
  status?: string;
  orderStatus?: string;
  notes?: string;
  sourceLine?: string;
  confidence?: number;
}

export interface ParsedChatOrderJson {
  customer: string;
  product: string;
  quantity: number;
  total: number;
  paid: number;
  remaining: number;
  refund: number;
  shipping: number;
  paymentMethod: string;
  status: string;
  notes: string;
}

export interface ParseChatOrderResponse {
  orders: ParsedChatOrderDraft[];
  summary?: ChatParserSummaryDraft;
}

export function toParsedChatOrderJson(
  order: ParsedChatOrder
): ParsedChatOrderJson {
  return {
    customer: order.customer,
    product: order.product,
    quantity: order.quantity,
    total: order.total,
    paid: order.paid,
    remaining: order.remaining,
    refund: order.refund,
    shipping: order.shipping,
    paymentMethod: order.paymentMethod,
    status: order.status,
    notes: order.notes,
  };
}
