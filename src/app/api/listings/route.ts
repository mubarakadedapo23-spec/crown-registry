import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getListings } from "@/lib/actions/listings";
import { rateLimit } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params = {
    category: searchParams.get("category") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    condition: searchParams.get("condition") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    sortBy: (searchParams.get("sort") as any) ?? "newest",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: Math.min(Number(searchParams.get("limit") ?? 24), 100),
  };

  const result = await getListings(params);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await rateLimit(`create-listing:${session.user.id}`, 10, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const { createListing } = await import("@/lib/actions/listings");
  const result = await createListing(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
