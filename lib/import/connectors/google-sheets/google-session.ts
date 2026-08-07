import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  decodeGoogleTokens,
  encodeGoogleTokens,
  GOOGLE_TOKEN_COOKIE,
  type GoogleTokenPayload,
} from "@/lib/import/connectors/google-sheets/google-auth";

export async function readGoogleTokensFromCookies() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
  if (!encoded) {
    return null;
  }

  return decodeGoogleTokens(encoded);
}

export function writeGoogleTokensCookie(
  response: NextResponse,
  tokens: GoogleTokenPayload
) {
  response.cookies.set(GOOGLE_TOKEN_COOKIE, encodeGoogleTokens(tokens), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearGoogleTokensCookie(response: NextResponse) {
  response.cookies.delete(GOOGLE_TOKEN_COOKIE);
}

export async function requireGoogleTokens() {
  const tokens = await readGoogleTokensFromCookies();
  if (!tokens) {
    throw new Error("Google account is not connected.");
  }

  return tokens;
}
