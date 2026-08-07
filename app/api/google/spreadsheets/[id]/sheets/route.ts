import { NextResponse } from "next/server";

import {
  getValidGoogleAccessToken,
  googleFetch,
} from "@/lib/import/connectors/google-sheets/google-auth";
import {
  googleApiErrorResponse,
  googleNotConfiguredResponse,
  googleUnauthorizedResponse,
} from "@/lib/import/connectors/google-sheets/google-api-response";
import { getGoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";
import {
  readGoogleTokensFromCookies,
  writeGoogleTokensCookie,
} from "@/lib/import/connectors/google-sheets/google-session";

interface SpreadsheetMetadataResponse {
  sheets?: Array<{
    properties?: {
      sheetId?: number;
      title?: string;
      index?: number;
    };
  }>;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const config = getGoogleOAuthConfigStatus();
  if (!config.configured) {
    return googleNotConfiguredResponse();
  }

  try {
    const { id } = await context.params;
    const storedTokens = await readGoogleTokensFromCookies();
    if (!storedTokens) {
      return googleUnauthorizedResponse();
    }

    const { accessToken, tokens } =
      await getValidGoogleAccessToken(storedTokens);

    const payload = await googleFetch<SpreadsheetMetadataResponse>(
      accessToken,
      `https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties(sheetId,title,index)`
    );

    const response = NextResponse.json({
      worksheets: (payload.sheets ?? []).map((sheet) => ({
        sheetId: sheet.properties?.sheetId ?? 0,
        title: sheet.properties?.title ?? "Sheet",
        index: sheet.properties?.index ?? 0,
      })),
    });

    if (tokens.accessToken !== storedTokens.accessToken) {
      writeGoogleTokensCookie(response, tokens);
    }

    return response;
  } catch (error) {
    return googleApiErrorResponse(error, "Failed to list worksheets.");
  }
}
