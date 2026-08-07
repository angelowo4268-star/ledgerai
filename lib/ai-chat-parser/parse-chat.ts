import {
  extractSummaryDraft,
  normalizeParseChatResponse,
  normalizeParsedChatOrders,
} from "@/lib/ai-chat-parser/normalize";
import { normalizeChatParserSummary } from "@/lib/ai-chat-parser/insights";
import type {
  ChatParserSummaryDraft,
  ParseChatOrderResult,
} from "@/lib/ai-chat-parser/types";

export async function parseShoppingChat(text: string): Promise<ParseChatOrderResult> {
  const response = await fetch("/api/parse-chat-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Chat parsing failed");
  }

  const data = await response.json();
  const drafts = normalizeParseChatResponse(data);
  const sourceLine = text.trim().split("\n").find(Boolean) ?? text.trim();
  const orders = normalizeParsedChatOrders(drafts, sourceLine);
  const summaryDraft = extractSummaryDraft(data) as
    | ChatParserSummaryDraft
    | undefined;

  return {
    orders,
    summary: normalizeChatParserSummary(summaryDraft, orders),
  };
}
