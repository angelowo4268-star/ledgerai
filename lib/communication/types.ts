export interface ConversationOrderFields {
  orderNumber: string;
  customerName: string;
  customerId: string;
  platform: string;
  product: string;
  sku: string;
  quantity: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  orderStatus: string;
  shippingMethod: string;
  trackingNumber: string;
  shippingDate: string;
  customerNotified: string;
  notes: string;
}

export interface ConversationAnalysisRecord extends ConversationOrderFields {
  orderDate: string;
  confidence: number;
}

export interface ConversationAnalysisResponse {
  records: ConversationAnalysisRecord[];
}

export interface ConversationRecord extends ConversationAnalysisRecord {
  id: string;
  sourceLabel: string;
  createdAt: string;
  analyzedAt: string;
}

export interface ConversationSummary {
  totalOrders: number;
  paid: number;
  unpaid: number;
  refund: number;
  revenue: number;
}
