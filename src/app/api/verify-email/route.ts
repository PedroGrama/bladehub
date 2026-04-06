import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Token+ausente", request.url));
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (!record) {
      return NextResponse.redirect(new URL("/login?error=Token+invalido", request.url));
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.redirect(new URL("/login?error=Token+expirado", request.url));
    }

    // Update user
    await prisma.user.update({
      where: { email: record.email },
      data: {
        isActive: true,
        emailVerifiedAt: new Date()
      }
    });

    // Delete token
    await prisma.emailVerificationToken.delete({
      where: { id: record.id }
    });

    return NextResponse.redirect(new URL("/login?success=email-confirmado", request.url));

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/login?error=Erro+interno", request.url));
  }
}
