import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

const GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/**
 * GET /api/auth/google
 * Retorna a URL de consentimento do Google
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GOOGLE_AUTH.NOT_CONFIGURED },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(16).toString("hex");
    const scope = encodeURIComponent("openid profile email");

    const authUrl = new URL(GOOGLE_AUTH_BASE_URL);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");

    return NextResponse.json({
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    console.error("[Google Auth] Error generating auth URL:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GOOGLE_AUTH.FAILED_TO_INITIALIZE },
      { status: 500 }
    );
  }
}
