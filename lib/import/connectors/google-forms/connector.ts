import type { GoogleFormSummary, RawImportData } from "@/lib/import/types";
import { googleSheetsConnector } from "@/lib/import/connectors/google-sheets/connector";

interface GoogleApiErrorResponse {
  error: string;
  code?: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected response from ${url}`);
  }

  const payload = (await response.json()) as T & GoogleApiErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

export const googleFormsConnector = {
  meta: {
    id: "google-forms",
    name: "Google Forms",
    description: "Import responses from Google Forms",
    available: true,
  },

  async isConnected() {
    return googleSheetsConnector.isConnected();
  },

  connect() {
    googleSheetsConnector.connect();
  },

  async disconnect() {
    await googleSheetsConnector.disconnect();
  },

  async listForms() {
    const result = await fetchJson<{ forms: GoogleFormSummary[] }>(
      "/api/google/forms"
    );
    return result.forms;
  },

  async loadFormResponses(formId: string, formName: string): Promise<RawImportData> {
    console.log("[Google Forms Debug] client selected form id:", formId);

    const params = new URLSearchParams({ formName });
    const result = await fetchJson<{
      data: RawImportData;
      _debug?: {
        selectedFormId: string;
        resolvedFormId: string;
        formIdMatches: boolean;
        formGetUrl: string;
        responsesListUrl: string;
        responsesLength: number;
        hasFormsResponsesScope: boolean;
        tokenScopes: string[];
        configuredScopes: string[];
        linkedSheetId: string | null;
        parsedRawRows: number;
        formItemCount: number;
      };
    }>(`/api/google/forms/${formId}/responses?${params.toString()}`);

    if (result._debug) {
      console.log("[Google Forms Debug] API _debug:", result._debug);
      console.log(
        "[Google Forms Debug] responses.length:",
        result._debug.responsesLength
      );
    }

    console.log(
      "[Google Forms Debug] client received rawRows:",
      result.data.rows.length
    );

    return result.data;
  },
};
