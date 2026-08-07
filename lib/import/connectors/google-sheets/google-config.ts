export type GoogleOAuthEnvKey =
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET";

export interface GoogleOAuthConfigStatus {
  configured: boolean;
  missing: GoogleOAuthEnvKey[];
  appUrl: string;
  redirectUri: string;
  requiredApis: string[];
  recommendedEnv: Array<"NEXT_PUBLIC_APP_URL">;
}

const REQUIRED_APIS = [
  "Google Drive API",
  "Google Sheets API",
] as const;

export function getAppUrl() {
  return (
    cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL)?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function cleanEnvValue(value?: string) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
}

export function getGoogleOAuthConfigStatus(): GoogleOAuthConfigStatus {
  const clientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET);
  const appUrl = getAppUrl();

  const missing: GoogleOAuthEnvKey[] = [];

  if (!clientId) {
    missing.push("GOOGLE_CLIENT_ID");
  }

  if (!clientSecret) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }

  return {
    configured: missing.length === 0,
    missing,
    appUrl,
    redirectUri: `${appUrl}/api/google/callback`,
    requiredApis: [...REQUIRED_APIS],
    recommendedEnv: cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL)
      ? []
      : ["NEXT_PUBLIC_APP_URL"],
  };
}

export function getGoogleOAuthConfigError(status = getGoogleOAuthConfigStatus()) {
  if (status.configured) {
    return null;
  }

  if (status.missing.length === 1) {
    return `Missing environment variable: ${status.missing[0]}`;
  }

  return `Missing environment variables: ${status.missing.join(", ")}`;
}

export function assertGoogleOAuthConfigured() {
  const status = getGoogleOAuthConfigStatus();
  const error = getGoogleOAuthConfigError(status);

  if (error) {
    throw new Error(error);
  }

  return status;
}
