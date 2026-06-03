import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/actions/payments";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const result = await handleStripeWebhook(body, signature);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

export const config = { api: { bodyParser: false } };
