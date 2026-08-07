const LINE_HOST_PATTERN =
  /(?:^|\.)line\.(?:me|biz)$|(?:^|\.)line-apps\.com$/i;

function isLineWebPage() {
  return LINE_HOST_PATTERN.test(window.location.hostname);
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function findChatContainer() {
  const selectors = [
    ".conversation-panel",
    ".messages-container",
    '[class*="chat-container"]',
    '[class*="ChatContainer"]',
    '[class*="message-list"]',
    '[class*="MessageList"]',
    '[class*="conversation"]',
    "main",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && normalizeText(element.textContent).length > 0) {
      return element;
    }
  }

  return document.body;
}

function findMessageElements(container) {
  const selectors = [
    '[class*="message-item"]',
    '[class*="MessageItem"]',
    '[class*="chat-message"]',
    '[class*="ChatMessage"]',
    '[class*="message-row"]',
    '[class*="MessageRow"]',
    '[class*="message-bubble"]',
    '[class*="MessageBubble"]',
    '[data-testid*="message"]',
    '[role="listitem"]',
    "li",
  ];

  const seen = new Set();
  const messages = [];

  for (const selector of selectors) {
    const elements = container.querySelectorAll(selector);

    elements.forEach((element) => {
      const text = normalizeText(element.innerText || element.textContent);
      if (!text || text.length < 2 || seen.has(text)) {
        return;
      }

      const isNested = messages.some((existing) => existing.contains(element));
      if (isNested) {
        return;
      }

      const hasNestedMessage = messages.some(
        (existing) => element.contains(existing) && existing !== element
      );
      if (hasNestedMessage) {
        messages.splice(
          0,
          messages.length,
          ...messages.filter((existing) => !element.contains(existing))
        );
      }

      seen.add(text);
      messages.push(element);
    });

    if (messages.length >= 3) {
      break;
    }
  }

  return messages;
}

function extractSender(element) {
  const senderSelectors = [
    '[class*="sender"]',
    '[class*="Sender"]',
    '[class*="author"]',
    '[class*="Author"]',
    '[class*="name"]',
    "strong",
    "b",
  ];

  for (const selector of senderSelectors) {
    const sender = element.querySelector(selector);
    const text = normalizeText(sender?.textContent);
    if (text && text.length <= 40) {
      return text;
    }
  }

  return "";
}

function extractMessageBody(element) {
  const bodySelectors = [
    '[class*="message-text"]',
    '[class*="MessageText"]',
    '[class*="text-content"]',
    '[class*="TextContent"]',
    '[class*="bubble"]',
    "p",
    "span",
  ];

  for (const selector of bodySelectors) {
    const body = element.querySelector(selector);
    const text = normalizeText(body?.textContent);
    if (text && text.length >= 2) {
      return text;
    }
  }

  return normalizeText(element.innerText || element.textContent);
}

function formatMessageLine(element) {
  const sender = extractSender(element);
  const body = extractMessageBody(element);

  if (!body) {
    return "";
  }

  if (sender && !body.startsWith(sender)) {
    return `${sender}: ${body}`;
  }

  return body;
}

function scrapeLineChat() {
  if (!isLineWebPage()) {
    return {
      success: false,
      text: "",
      error: "This page is not LINE Web.",
    };
  }

  const container = findChatContainer();
  const messageElements = findMessageElements(container);
  const lines = messageElements
    .map(formatMessageLine)
    .filter(Boolean)
    .filter((line, index, array) => array.indexOf(line) === index);

  if (lines.length === 0) {
    const fallback = normalizeText(container.innerText || container.textContent);
    return {
      success: Boolean(fallback),
      text: fallback,
      error: fallback ? "" : "No chat messages found on this page.",
    };
  }

  return {
    success: true,
    text: lines.join("\n"),
    error: "",
  };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action !== "importChat") {
    return false;
  }

  const result = scrapeLineChat();
  console.log("[LedgerAI] Imported chat text:", result.text);
  sendResponse(result);
  return true;
});
