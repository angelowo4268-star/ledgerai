import { NextResponse } from "next/server";

import { getGoogleOAuthConfig } from "@/lib/import/connectors/google-sheets/google-auth";
import {
  getAppUrl,
  getGoogleOAuthConfigError,
  getGoogleOAuthConfigStatus,
} from "@/lib/import/connectors/google-sheets/google-config";

function redirectToImportCenter(message: string) {
  const appUrl = getAppUrl();
  const params = new URLSearchParams({
    google: "error",
    message,
  });

  return NextResponse.redirect(`${appUrl}/import-center?${params.toString()}`);
}

export async function GET() {
  const status = getGoogleOAuthConfigStatus();
  const configError = getGoogleOAuthConfigError(status);

  if (configError) {
    return redirectToImportCenter("oauth_not_configured");
  }

  try {
    const { clientId, redirectUri, scopes } = getGoogleOAuthConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  } catch {
    return redirectToImportCenter("oauth_start_failed");
  }
}
