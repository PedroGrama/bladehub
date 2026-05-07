import { NextRequest, NextResponse } from "next/server";
import { ERROR_MESSAGES } from "@/lib/errorMessages";
import { processGoogleAuth } from "@/server/auth-utils";
import { createSessionToken } from "@/server/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const errorDescription = searchParams.get("error_description");
      console.error(`[Google Auth] OAuth error: ${error}`, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Valida state contra cookie
    const savedState = request.cookies.get("google_oauth_state")?.value;
    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Invalid state")}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(ERROR_MESSAGES.GOOGLE_AUTH.NO_AUTHORIZATION_CODE)}`, request.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.error("[Google Auth] Missing credentials");
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(ERROR_MESSAGES.GOOGLE_AUTH.SERVER_NOT_CONFIGURED)}`, request.url)
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error("[Google Token] Error:", tokenError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(ERROR_MESSAGES.GOOGLE_AUTH.FAILED_TO_EXCHANGE_CODE)}`, request.url)
      );
    }

    const { id_token } = await tokenResponse.json();

    // Valida assinatura do JWT com google-auth-library
    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.name) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Dados insuficientes do Google")}`, request.url)
      );
    }

    const { email, name, picture } = payload;
    const authResult = await processGoogleAuth({ 
      email: email as string, 
      name: name as string, 
      picture: picture as string | undefined 
    });

    if (!authResult.success) {
      return NextResponse.redirect(new URL("/auth-denied", request.url));
    }

    const sessionUser = {
      id: authResult.user!.id,
      role: authResult.user!.role as any,
      tenantId: authResult.user!.tenantId,
      name: authResult.user!.name,
      email: authResult.user!.email,
      isBarber: authResult.user!.isBarber,
    };

    const token = await createSessionToken(sessionUser);
    const dashboardUrl = sessionUser.role === "admin_geral" ? "/admin" : "/tenant";
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url));

    response.cookies.set("barbersaas_session", token, {
      path: "/",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });


    // Limpa o state cookie
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (error) {
    console.error("[Google Auth Callback] Error:", error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, request.url)
    );
  }
}