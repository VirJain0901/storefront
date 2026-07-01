import { NextRequest, NextResponse } from "next/server";
import { runIntakeTurn, type IntakeTurn } from "../../../../../packages/agents/src/intakeAgent";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { merchantId, history }: { merchantId: string; history: IntakeTurn[] } = await req.json();

  if (!merchantId || !history?.length) {
    return NextResponse.json({ error: "merchantId and history are required" }, { status: 400 });
  }

  const { reply, extractedFields } = await runIntakeTurn(history);

  if (extractedFields) {
    const { intakeComplete, ...fields } = extractedFields as Record<string, unknown> & {
      intakeComplete?: boolean;
    };

    await db.merchantContext.upsert({
      where: { merchantId },
      create: { merchantId, ...fields, intakeComplete: !!intakeComplete },
      update: { ...fields, ...(intakeComplete ? { intakeComplete: true } : {}) },
    });
  }

  return NextResponse.json({ reply, extractedFields });
}
