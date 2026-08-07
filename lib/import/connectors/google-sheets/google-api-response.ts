import { NextResponse } from "next/server";

import {
  getGoogleOAuthConfigError,
  getGoogleOAuthConfigStatus,
} from "@/lib/import/connectors/google-sheets/google-config";

export function googleNotConfiguredResponse() {
  const status = getGoogleOAuthConfigStatus();

  return NextResponse.json(
    {
      error:
        getGoogleOAuthConfigError(status) ??
        "Google OAuth is not configured.",
      code: "oauth_not_configured",
      missing: status.missing,
      redirectUri: status.redirectUri,
      requiredApis: status.requiredApis,
    },
    { status: 503 }
  );
}

export function googleApiErrorResponse(error: unknown, fallback: string) {
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : fallback,
      code: "google_api_error",
    },
    { status: 500 }
  );
}

export function googleUnauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Google account is not connected.",
      code: "not_connected",
    },
    { status: 401 }
  );
}
