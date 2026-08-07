export interface ChatAnalysisRecord {
  customerName: string;
  paidAmount: number;
  unpaidAmount: number;
  refundAmount: number;
  paymentStatus: string;
  orderNote: string;
}

export interface ChatAnalysisResponse {
  records: ChatAnalysisRecord[];
}

export interface ChatRecord extends ChatAnalysisRecord {
  id: string;
  sourceLabel: string;
  analyzedAt: string;
}

export interface ChatSummary {
  totalReceived: number;
  totalUnpaid: number;
  totalRefund: number;
}
