import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "test@example.com";
  
  try {
    console.log("[API Test Email] Tentando enviar email para:", email);
    await sendVerificationEmail(email, "test-token-123");
    return NextResponse.json({ success: true, message: `Email enviado para ${email}. Verifique os logs do servidor.` });
  } catch (error: any) {
    console.error("[API Test Email] Erro no envio:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
