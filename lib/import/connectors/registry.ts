import { googleSheetsConnector } from "@/lib/import/connectors/google-sheets/connector";
import type { ImportConnector } from "@/lib/import/connectors/types";

const connectors: ImportConnector[] = [googleSheetsConnector];

export function getImportConnectors(): ImportConnector[] {
  return connectors;
}

export function getImportConnector(id: string): ImportConnector | undefined {
  return connectors.find((connector) => connector.meta.id === id);
}
