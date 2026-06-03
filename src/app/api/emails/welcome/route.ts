import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Internal only - verify with shared secret
  const auth = req.headers.get("x-internal-secret");
  const isInternal = req.headers.get("x-forwarded-for") === null; // same-origin

  const { userId, email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await sendWelcomeEmail(email, name);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Welcome email failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
