import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const SESSION_COOKIE = "barbersaas_session";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "default_secret_for_dev_only";
  return new TextEncoder().encode(secret);
}

async function readSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);
  const role = session?.user?.role as string | undefined;

  const protectedPrefixes = ["/admin", "/tenant"];
  const publicPrefixes = ["/", "/book", "/api", "/_next", "/favicon.ico", "/assets"];

  let response = NextResponse.next();

  // 1. If at login and already has role, redirect to dashboard
  if (pathname.startsWith("/login")) {
    if (role) {
      const redirectPath = role === "admin_geral" ? "/admin" : "/tenant";
      response = NextResponse.redirect(new URL(redirectPath, req.url));
    }
  } 
  // 2. If at protected route
  else if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      response = NextResponse.redirect(url);
    } else if (pathname.startsWith("/admin") && role !== "admin_geral") {
      response = NextResponse.redirect(new URL("/tenant", req.url));
    } else if (pathname.startsWith("/tenant") && role === "admin_geral") {
      // Permitir se houver impersonação ativa
      const isImpersonating = req.cookies.has("impersonated_tenant_id");
      if (!isImpersonating) {
        response = NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  } 
  // 3. If at unknown route but logged in, redirect to dashboard (avoid 404 for logged users)
  else if (!publicPrefixes.some((p) => pathname.startsWith(p))) {
    if (role) {
      const redirectPath = role === "admin_geral" ? "/admin" : "/tenant";
      response = NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // 4. Renew session if exists (Sliding Session)
  if (session && response.status < 300) {
    try {
      const newToken = await new SignJWT(session)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey());
      
      response.cookies.set({
        name: SESSION_COOKIE,
        value: newToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    } catch (e) {
      console.error("Error renewing session:", e);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/tenant/:path*", 
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
