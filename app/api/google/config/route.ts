import { NextResponse } from "next/server";

import { getGoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";

export async function GET() {
  const status = getGoogleOAuthConfigStatus();

  return NextResponse.json({
    configured: status.configured,
    missing: status.missing,
    appUrl: status.appUrl,
    redirectUri: status.redirectUri,
    requiredApis: status.requiredApis,
    recommendedEnv: status.recommendedEnv,
  });
}
