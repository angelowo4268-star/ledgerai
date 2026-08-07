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

interface DriveFileListResponse {
  files?: Array<{
    id: string;
    name: string;
    modifiedTime: string;
  }>;
}

export async function GET() {
  const config = getGoogleOAuthConfigStatus();
  if (!config.configured) {
    return googleNotConfiguredResponse();
  }

  try {
    const storedTokens = await readGoogleTokensFromCookies();
    if (!storedTokens) {
      return googleUnauthorizedResponse();
    }

    const { accessToken, tokens } =
      await getValidGoogleAccessToken(storedTokens);

    const query = encodeURIComponent(
      "mimeType='application/vnd.google-apps.form' and trashed=false"
    );
    const payload = await googleFetch<DriveFileListResponse>(
      accessToken,
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,modifiedTime)`
    );

    const response = NextResponse.json({
      forms: (payload.files ?? []).map((file) => ({
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      })),
    });

    if (tokens.accessToken !== storedTokens.accessToken) {
      writeGoogleTokensCookie(response, tokens);
    }

    return response;
  } catch (error) {
    return googleApiErrorResponse(error, "Failed to list Google Forms.");
  }
}
