import { NextResponse } from "next/server";

import { exchangeGoogleCode } from "@/lib/import/connectors/google-sheets/google-auth";
import { getAppUrl } from "@/lib/import/connectors/google-sheets/google-config";
import { writeGoogleTokensCookie } from "@/lib/import/connectors/google-sheets/google-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const appUrl = getAppUrl();

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/import-center?google=error&message=missing_code`
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const response = NextResponse.redirect(
      `${appUrl}/import-center?google=connected`
    );
    writeGoogleTokensCookie(response, tokens);
    return response;
  } catch {
    return NextResponse.redirect(
      `${appUrl}/import-center?google=error&message=oauth_failed`
    );
  }
}
