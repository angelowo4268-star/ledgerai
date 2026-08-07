import type { GoogleSpreadsheetSummary, GoogleWorksheetSummary, RawImportData } from "@/lib/import/types";

export interface ImportConnectorMeta {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface ImportConnector {
  meta: ImportConnectorMeta;
  isConnected(): Promise<boolean>;
  connect(): void;
  disconnect(): Promise<void>;
  listSpreadsheets(): Promise<GoogleSpreadsheetSummary[]>;
  listWorksheets(spreadsheetId: string): Promise<GoogleWorksheetSummary[]>;
  loadWorksheet(
    spreadsheetId: string,
    sheetName: string,
    spreadsheetName: string,
    sheetId: number
  ): Promise<RawImportData>;
}
