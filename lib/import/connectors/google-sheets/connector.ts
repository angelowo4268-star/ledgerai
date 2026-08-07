import type { GoogleSpreadsheetSummary, GoogleWorksheetSummary, RawImportData } from "@/lib/import/types";
import type { ImportConnector } from "@/lib/import/connectors/types";
import type { GoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";

interface GoogleApiErrorResponse {
  error: string;
  code?: string;
  missing?: string[];
  redirectUri?: string;
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

export async function fetchGoogleOAuthConfig(): Promise<GoogleOAuthConfigStatus> {
  return fetchJson<GoogleOAuthConfigStatus>("/api/google/config");
}

export const googleSheetsConnector: ImportConnector = {
  meta: {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Import worksheets from Google Sheets",
    available: true,
  },

  async isConnected() {
    const result = await fetchJson<{ connected: boolean }>("/api/google/status");
    return result.connected;
  },

  connect() {
    window.location.assign("/api/google/auth");
  },

  async disconnect() {
    await fetchJson("/api/google/disconnect", { method: "POST" });
  },

  async listSpreadsheets() {
    const result = await fetchJson<{ spreadsheets: GoogleSpreadsheetSummary[] }>(
      "/api/google/spreadsheets"
    );
    return result.spreadsheets;
  },

  async listWorksheets(spreadsheetId: string) {
    const result = await fetchJson<{ worksheets: GoogleWorksheetSummary[] }>(
      `/api/google/spreadsheets/${spreadsheetId}/sheets`
    );
    return result.worksheets;
  },

  async loadWorksheet(
    spreadsheetId: string,
    sheetName: string,
    spreadsheetName: string,
    sheetId: number
  ): Promise<RawImportData> {
    const params = new URLSearchParams({
      sheetName,
      spreadsheetName,
      sheetId: String(sheetId),
    });

    const result = await fetchJson<{ data: RawImportData }>(
      `/api/google/spreadsheets/${spreadsheetId}/values?${params.toString()}`
    );

    return result.data;
  },
};
