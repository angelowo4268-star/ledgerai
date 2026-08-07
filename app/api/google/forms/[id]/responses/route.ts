import { NextResponse } from "next/server";

import {
  parseGoogleFormResponses,
  type FormResponsesPayload,
  type GoogleFormPayload,
} from "@/lib/import/connectors/google-forms/parse-responses";
import {
  getGoogleOAuthConfig,
  getValidGoogleAccessToken,
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

const FORMS_RESPONSES_SCOPE =
  "https://www.googleapis.com/auth/forms.responses.readonly";

async function fetchTokenScopes(accessToken: string) {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status,
        scopes: [] as string[],
      };
    }

    const payload = (await response.json()) as { scope?: string };
    const scopes = (payload.scope ?? "")
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter(Boolean);

    return {
      ok: true as const,
      status: response.status,
      scopes,
    };
  } catch (error) {
    console.error("[Google Forms Debug] tokeninfo failed:", error);
    return {
      ok: false as const,
      status: 0,
      scopes: [] as string[],
    };
  }
}

async function googleFormsFetch<T>(
  accessToken: string,
  url: string,
  label: string
) {
  console.log(`[Google Forms Debug] ${label} request URL:`, url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const rawBody = await response.text();
  let parsedBody: unknown = rawBody;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    // Keep raw text when the response is not JSON.
  }

  console.log(`[Google Forms Debug] ${label} status:`, response.status);
  console.log(`[Google Forms Debug] ${label} response:`, parsedBody);

  if (!response.ok) {
    throw new Error(
      `Google API request failed (${label}): ${response.status} ${rawBody}`
    );
  }

  return parsedBody as T;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const config = getGoogleOAuthConfigStatus();
  if (!config.configured) {
    return googleNotConfiguredResponse();
  }

  try {
    const { id: selectedFormId } = await context.params;
    const url = new URL(request.url);
    const formName = url.searchParams.get("formName") ?? selectedFormId;

    console.log("[Google Forms Debug] 1. Selected Form ID:", selectedFormId);

    const storedTokens = await readGoogleTokensFromCookies();
    if (!storedTokens) {
      return googleUnauthorizedResponse();
    }

    const { accessToken, tokens } =
      await getValidGoogleAccessToken(storedTokens);

    const configuredScopes = getGoogleOAuthConfig().scopes;
    const tokenInfo = await fetchTokenScopes(accessToken);
    const hasFormsResponsesScope = tokenInfo.scopes.includes(
      FORMS_RESPONSES_SCOPE
    );

    console.log("[Google Forms Debug] OAuth configured scopes:", configuredScopes);
    console.log("[Google Forms Debug] OAuth token scopes:", tokenInfo.scopes);
    console.log(
      "[Google Forms Debug] token has forms.responses.readonly:",
      hasFormsResponsesScope
    );

    const formGetUrl = `https://forms.googleapis.com/v1/forms/${selectedFormId}`;
    const form = await googleFormsFetch<GoogleFormPayload & { linkedSheetId?: string }>(
      accessToken,
      formGetUrl,
      "forms.get()"
    );

    console.log("[Google Forms Debug] 2. forms.get() response:", form);

    const resolvedFormId = form.formId ?? selectedFormId;
    const formIdMatches = resolvedFormId === selectedFormId;

    console.log("[Google Forms Debug] forms.get().formId:", resolvedFormId);
    console.log(
      "[Google Forms Debug] selected Form ID matches forms.get().formId:",
      formIdMatches
    );

    if (form.linkedSheetId) {
      console.log(
        "[Google Forms Debug] form.linkedSheetId:",
        form.linkedSheetId
      );
    }

    const responsesListUrl = `https://forms.googleapis.com/v1/forms/${resolvedFormId}/responses?pageSize=5000`;
    console.log(
      "[Google Forms Debug] 3. forms.responses.list() request URL:",
      responsesListUrl
    );

    const responsesPayload = await googleFormsFetch<FormResponsesPayload>(
      accessToken,
      responsesListUrl,
      "forms.responses.list()"
    );

    const responses = responsesPayload.responses ?? [];
    const responsesLength = responses.length;

    console.log(
      "[Google Forms Debug] 4. forms.responses.list() response:",
      responsesPayload
    );
    console.log("[Google Forms Debug] 5. responses.length:", responsesLength);

    if (responsesLength === 0) {
      console.warn("[Google Forms Debug] responses.length is 0. Verification:", {
        selectedFormId,
        resolvedFormId,
        formIdMatches,
        responsesListCalled: true,
        responsesListUrl,
        hasFormsResponsesScope,
        tokenScopeCount: tokenInfo.scopes.length,
        linkedSheetId: form.linkedSheetId ?? null,
        formItemCount: form.items?.length ?? 0,
      });

      if (!hasFormsResponsesScope) {
        console.warn(
          "[Google Forms Debug] Missing scope:",
          FORMS_RESPONSES_SCOPE,
          "Reconnect Google OAuth with consent to grant Forms response access."
        );
      }
    }

    const data = parseGoogleFormResponses(
      form,
      responsesPayload,
      resolvedFormId,
      formName
    );

    console.log("[Google Forms Debug] parsed rawRows:", data.rows.length);

    const response = NextResponse.json({
      data,
      _debug: {
        selectedFormId,
        resolvedFormId,
        formIdMatches,
        formGetUrl,
        responsesListUrl,
        responsesLength,
        hasFormsResponsesScope,
        tokenScopes: tokenInfo.scopes,
        configuredScopes,
        linkedSheetId: form.linkedSheetId ?? null,
        parsedRawRows: data.rows.length,
        formItemCount: form.items?.length ?? 0,
      },
    });

    if (tokens.accessToken !== storedTokens.accessToken) {
      writeGoogleTokensCookie(response, tokens);
    }

    return response;
  } catch (error) {
    console.error("[Google Forms Debug] request failed:", error);
    return googleApiErrorResponse(error, "Failed to load Google Form responses.");
  }
}
