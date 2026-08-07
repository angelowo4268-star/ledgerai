import { NextResponse } from "next/server";

import { getGoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";
import { readGoogleTokensFromCookies } from "@/lib/import/connectors/google-sheets/google-session";

export async function GET() {
  const config = getGoogleOAuthConfigStatus();
  const tokens = await readGoogleTokensFromCookies();

  return NextResponse.json({
    configured: config.configured,
    connected: Boolean(config.configured && tokens?.accessToken),
    missing: config.missing,
    redirectUri: config.redirectUri,
  });
}
