export {
  appendConversationRecords,
  clearConversationRecords,
  COMMUNICATION_STORAGE_KEY,
  COMMUNICATION_UPDATED_EVENT,
  deleteConversationRecord,
  deleteConversationRecords,
  getConversationRecords,
  saveConversationRecords,
  updateConversationRecord,
} from "@/lib/communication/conversation-storage";
export type {
  ConversationAnalysisRecord,
  ConversationAnalysisResponse,
  ConversationOrderFields,
  ConversationRecord,
  ConversationSummary,
} from "@/lib/communication/types";
