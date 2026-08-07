import { normalizeStoredConversationRecord } from "@/lib/communication/conversation-utils";
import type { ConversationRecord } from "@/lib/communication/types";

export const COMMUNICATION_STORAGE_KEY = "ledgerai-communication-records";
export const COMMUNICATION_UPDATED_EVENT = "ledgerai-communication-updated";

function readStorage(): ConversationRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COMMUNICATION_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Partial<ConversationRecord>[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((record) => normalizeStoredConversationRecord(record));
  } catch {
    return [];
  }
}

function writeStorage(records: ConversationRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    COMMUNICATION_STORAGE_KEY,
    JSON.stringify(records)
  );
  window.dispatchEvent(new Event(COMMUNICATION_UPDATED_EVENT));
}

export function getConversationRecords(): ConversationRecord[] {
  return readStorage();
}

export function saveConversationRecords(records: ConversationRecord[]) {
  writeStorage(records);
}

export function appendConversationRecords(records: ConversationRecord[]) {
  const existing = readStorage();
  writeStorage([...records, ...existing]);
}

export function updateConversationRecord(record: ConversationRecord) {
  const records = readStorage();
  const index = records.findIndex((item) => item.id === record.id);

  if (index === -1) {
    throw new Error("Conversation record not found");
  }

  records[index] = normalizeStoredConversationRecord(record);
  writeStorage(records);
}

export function deleteConversationRecord(id: string) {
  writeStorage(readStorage().filter((record) => record.id !== id));
}

export function deleteConversationRecords(ids: string[]) {
  const idSet = new Set(ids);
  writeStorage(readStorage().filter((record) => !idSet.has(record.id)));
}

export function clearConversationRecords() {
  writeStorage([]);
}
