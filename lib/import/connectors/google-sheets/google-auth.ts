import {
  assertGoogleOAuthConfigured,
  cleanEnvValue,
  getAppUrl,
} from "@/lib/import/connectors/google-sheets/google-config";

export interface GoogleTokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const GOOGLE_TOKEN_COOKIE = "ledgerai_google_tokens";

export function getGoogleOAuthConfig() {
  assertGoogleOAuthConfigured();

  const clientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET);
  const appUrl = getAppUrl();

  return {
    clientId,
    clientSecret,
    redirectUri: `${appUrl}/api/google/callback`,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  };
}

export function encodeGoogleTokens(tokens: GoogleTokenPayload) {
  return Buffer.from(JSON.stringify(tokens)).toString("base64url");
}

export function decodeGoogleTokens(value: string): GoogleTokenPayload | null {
  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as GoogleTokenPayload;
  } catch {
    return null;
  }
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google OAuth code.");
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? "",
    expiresAt: Date.now() + payload.expires_in * 1000,
  } satisfies GoogleTokenPayload;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleOAuthConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google access token.");
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  return {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };
}

export async function getValidGoogleAccessToken(
  tokens: GoogleTokenPayload
): Promise<{ accessToken: string; tokens: GoogleTokenPayload }> {
  if (tokens.expiresAt > Date.now() + 60_000) {
    return { accessToken: tokens.accessToken, tokens };
  }

  if (!tokens.refreshToken) {
    throw new Error("Google session expired. Please reconnect.");
  }

  const refreshed = await refreshGoogleAccessToken(tokens.refreshToken);
  const nextTokens = {
    ...tokens,
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
  };

  return {
    accessToken: nextTokens.accessToken,
    tokens: nextTokens,
  };
}

export async function googleFetch<T>(
  accessToken: string,
  url: string
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
