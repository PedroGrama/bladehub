import { processGoogleAuth } from "@/server/auth-utils";
import { setSessionCookie } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

/**
 * GET /api/auth/google/callback
 * Callback redirect do Google OAuth
 * Google redireciona aqui com ?code=xxx&state=yyy
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Verificar se houve erro no fluxo do Google
    if (error) {
      const errorDescription = searchParams.get("error_description");
      console.error(`[Google Auth] OAuth error: ${error}`, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(ERROR_MESSAGES.GOOGLE_AUTH.NO_AUTHORIZATION_CODE)}`, request.url)
      );
    }

    // Trocar código por token
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
      const error = await tokenResponse.json();
      console.error("[Google Token] Error:", error);
      return NextResponse.redirect(
        new URL(
          "/login?error=" +
            encodeURIComponent(ERROR_MESSAGES.GOOGLE_AUTH.FAILED_TO_EXCHANGE_CODE),
          request.url
        )
      );
    }

    const { id_token } = await tokenResponse.json();

    // Decodificar token ID para extrair informações do usuário
    // Nota: Em produção, validar a assinatura do token
    const payload = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64url").toString()
    );

    const { email, name, picture } = payload;

    // Processar autenticação (criar/validar usuário)
    const authResult = await processGoogleAuth({
      email,
      name,
      picture,
    });

    if (!authResult.success) {
      return NextResponse.redirect(new URL("/auth-denied", request.url));
    }

    // Gerar e configurar session token JWT padrão
    await setSessionCookie({
      id: authResult.user?.id as string,
      role: authResult.user?.role as any,
      tenantId: authResult.user?.tenantId as string | null,
      name: authResult.user?.name as string,
      email: authResult.user?.email as string,
      isBarber: authResult.user?.isBarber as boolean,
    });

    // Redirecionar para dashboard
    const dashboardUrl = authResult.user?.role === "admin_geral" ? "/admin" : "/tenant";
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url));

    return response;

    // Também salvar user info em local session (temporary)
    response.cookies.set(
      "user-id",
      authResult.user?.id || "",
      {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      }
    );

    return response;
  } catch (error) {
    console.error("[Google Auth Callback] Error:", error);
    return NextResponse.redirect(
      new URL(
        "/login?error=" + encodeURIComponent("Authentication failed"),
        request.url
      )
    );
  }
}
