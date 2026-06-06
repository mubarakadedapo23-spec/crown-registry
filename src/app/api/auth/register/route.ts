import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash,
        role: role || "BUYER",
        status: "ACTIVE",
        subscription: {
          create: {
            plan: "FREE",
            status: "active",
            maxListings: 5,
            featuredListings: 0,
          },
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
