const LINE_HOST_PATTERN =
  /(?:^|\.)line\.(?:me|biz)$|(?:^|\.)line-apps\.com$/i;

const statusEl = document.getElementById("status");
const importButton = document.getElementById("importButton");
const chatOutput = document.getElementById("chatOutput");

function isLineWebUrl(url) {
  try {
    return LINE_HOST_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function setStatus(message, type = "default") {
  statusEl.textContent = message;
  statusEl.classList.remove(
    "popup__status--detected",
    "popup__status--error"
  );

  if (type === "detected") {
    statusEl.classList.add("popup__status--detected");
  }

  if (type === "error") {
    statusEl.classList.add("popup__status--error");
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function initializePopup() {
  const tab = await getActiveTab();

  if (!tab?.url) {
    setStatus("Unable to read the current tab.", "error");
    importButton.disabled = true;
    return;
  }

  if (!isLineWebUrl(tab.url)) {
    setStatus("Open LINE Web to import a chat.", "error");
    importButton.disabled = true;
    return;
  }

  setStatus("LINE Web Detected", "detected");
  importButton.disabled = false;
}

async function importCurrentChat() {
  const tab = await getActiveTab();

  if (!tab?.id) {
    setStatus("Unable to access the current tab.", "error");
    return;
  }

  importButton.disabled = true;
  setStatus("Importing chat...", "detected");

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "importChat",
    });

    if (!response) {
      throw new Error(
        "Could not connect to LINE Web. Refresh the page and try again."
      );
    }

    if (!response.success) {
      throw new Error(response.error || "No chat messages found.");
    }

    const text = response.text || "";
    chatOutput.textContent = text || "No chat text found on this page.";
    console.log("[LedgerAI] Popup collected chat text:", text);
    setStatus("LINE Web Detected", "detected");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import chat.";
    chatOutput.textContent = message;
    setStatus(message, "error");
    console.error("[LedgerAI] Import failed:", error);
  } finally {
    importButton.disabled = false;
  }
}

importButton.addEventListener("click", () => {
  void importCurrentChat();
});

void initializePopup();
