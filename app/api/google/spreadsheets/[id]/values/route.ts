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

interface SheetValuesResponse {
  values?: string[][];
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const config = getGoogleOAuthConfigStatus();
  if (!config.configured) {
    return googleNotConfiguredResponse();
  }

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const sheetName = url.searchParams.get("sheetName");
    const spreadsheetName = url.searchParams.get("spreadsheetName") ?? id;
    const sheetId = Number(url.searchParams.get("sheetId") ?? "0");

    if (!sheetName) {
      return NextResponse.json({ error: "Missing sheetName" }, { status: 400 });
    }

    const storedTokens = await readGoogleTokensFromCookies();
    if (!storedTokens) {
      return googleUnauthorizedResponse();
    }

    const { accessToken, tokens } =
      await getValidGoogleAccessToken(storedTokens);

    const range = encodeURIComponent(sheetName);
    const payload = await googleFetch<SheetValuesResponse>(
      accessToken,
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}`
    );

    const rawValues = payload.values ?? [];
    const [headerRow, ...bodyRows] = rawValues;
    const headers = (headerRow ?? []).map((cell) => String(cell ?? "").trim());
    const normalizedHeaders =
      headers.length > 0 && headers.some(Boolean)
        ? headers
        : ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5"];

    const rows = bodyRows
      .map((row) =>
        normalizedHeaders.map((_, index) => String(row?.[index] ?? "").trim())
      )
      .filter((row) => row.some((cell) => cell !== ""));

    const response = NextResponse.json({
      data: {
        sourceId: id,
        sourceName: spreadsheetName,
        sheetId: String(sheetId),
        sheetName,
        headers: normalizedHeaders,
        rows,
        totalRows: rows.length,
      },
    });

    if (tokens.accessToken !== storedTokens.accessToken) {
      writeGoogleTokensCookie(response, tokens);
    }

    return response;
  } catch (error) {
    return googleApiErrorResponse(error, "Failed to load worksheet values.");
  }
}
