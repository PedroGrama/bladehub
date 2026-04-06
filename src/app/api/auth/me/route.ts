import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    isBarber: user.isBarber,
  });
}