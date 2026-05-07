import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

const GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId) {
      console.error("[Google Auth] Missing GOOGLE_CLIENT_ID in environment");
      return NextResponse.json(
        { error: "Configuração do Google vinculada ao GOOGLE_CLIENT_ID não encontrada no .env" },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(16).toString("hex");

    const authUrl = new URL(GOOGLE_AUTH_BASE_URL);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid profile email"); // não precisa encodeURIComponent aqui
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");

    // Salva o state em cookie httpOnly para validar no callback
    const response = NextResponse.json({ authUrl: authUrl.toString() });
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutos
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Google Auth] Error generating auth URL:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GOOGLE_AUTH.FAILED_TO_INITIALIZE },
      { status: 500 }
    );
  }
}