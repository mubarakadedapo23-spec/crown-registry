import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/actions/listings";

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
    page: Number(searchParams.get("page") ?? 1),
    limit: Math.min(Number(searchParams.get("limit") ?? 24), 100),
  };

  const result = await getListings(params);
  return NextResponse.json(result);
}
