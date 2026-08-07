import { NextResponse } from "next/server";

import { clearGoogleTokensCookie } from "@/lib/import/connectors/google-sheets/google-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearGoogleTokensCookie(response);
  return response;
}
