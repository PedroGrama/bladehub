import { NextResponse } from "next/server";
import { runLoyaltySealForAppointment } from "@/server/loyalty/processLoyaltySeal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bookingId = body.bookingId as string | undefined;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId obrigatório" }, { status: 400 });
    }

    const res = await runLoyaltySealForAppointment(bookingId);
    if (!res.ok) {
      return NextResponse.json({ error: res.reason }, { status: 400 });
    }

    return NextResponse.json({
      sealNumber: res.sealNumber,
      txSignature: res.txSignature,
      total: res.total,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "erro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
