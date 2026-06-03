import { NextRequest, NextResponse } from "next/server";
import { searchListings, getSearchSuggestions } from "@/lib/search";
import { rateLimit, cacheGet, cacheSet } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await rateLimit(`search:${ip}`, 60, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  // Autocomplete suggestions
  if (type === "suggest") {
    const q = searchParams.get("q") ?? "";
    if (q.length < 2) return NextResponse.json([]);

    const cacheKey = `search:suggest:${q.toLowerCase()}`;
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const suggestions = await getSearchSuggestions(q, 8);
    await cacheSet(cacheKey, suggestions, 120);
    return NextResponse.json(suggestions);
  }

  // Full search
  const params = {
    query: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    condition: searchParams.get("condition") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    verified: searchParams.get("verified") === "true",
    featured: searchParams.get("featured") === "true",
    sortBy: (searchParams.get("sort") as any) ?? "relevance",
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lon: searchParams.get("lon") ? Number(searchParams.get("lon")) : undefined,
    radiusKm: searchParams.get("radius") ? Number(searchParams.get("radius")) : 50,
    page: Number(searchParams.get("page") ?? 1),
    limit: Math.min(Number(searchParams.get("limit") ?? 24), 100),
    minYear: searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined,
    maxYear: searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined,
    minBedrooms: searchParams.get("minBedrooms") ? Number(searchParams.get("minBedrooms")) : undefined,
    minBathrooms: searchParams.get("minBathrooms") ? Number(searchParams.get("minBathrooms")) : undefined,
  };

  try {
    const results = await searchListings(params);
    return NextResponse.json(results);
  } catch (err) {
    // Fallback to Prisma if Elasticsearch is unavailable
    const { getListings } = await import("@/lib/actions/listings");
    const fallback = await getListings({
      category: params.category,
      country: params.country,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      condition: params.condition,
      brand: params.brand,
      sortBy: params.sortBy === "relevance" ? "newest" : params.sortBy,
      page: params.page,
      limit: params.limit,
    });
    return NextResponse.json({ ...fallback, fallback: true });
  }
}
