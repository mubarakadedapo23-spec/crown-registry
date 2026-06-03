import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { TrustSection } from "@/components/home/TrustSection";
import { TopDealers } from "@/components/home/TopDealers";
import { LuxuryCollections } from "@/components/home/LuxuryCollections";
import { CtaBand } from "@/components/home/CtaBand";
import { getFeaturedListings } from "@/lib/actions/listings";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crown Registry — The World's Finest Luxury Marketplace",
  description:
    "Discover extraordinary luxury assets: private jets, superyachts, hypercars, palatial estates, and horological masterpieces. Serving 190 countries.",
};

async function getPlatformStats() {
  const cached = await cacheGet<any>(CACHE_KEYS.STATS);
  if (cached) return cached;

  const [listings, users, countries] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.listing.groupBy({ by: ["country"], where: { status: "ACTIVE", country: { not: null } } }),
  ]);

  const stats = {
    listings,
    users,
    countries: countries.length,
    gmv: "$2.4B",
  };

  await cacheSet(CACHE_KEYS.STATS, stats, CACHE_TTL.LONG);
  return stats;
}

async function getTopDealers() {
  return prisma.dealerProfile.findMany({
    where: { isVerified: true },
    take: 6,
    orderBy: { rating: "desc" },
    include: {
      user: { select: { name: true, avatar: true, country: true } },
    },
  });
}

export default async function HomePage() {
  const [featuredListings, stats, dealers] = await Promise.all([
    getFeaturedListings(6),
    getPlatformStats(),
    getTopDealers(),
  ]);

  return (
    <div className="bg-crown-obsidian">
      <HeroSection />
      <StatsBar stats={stats} />
      <CategoryGrid />
      <Suspense fallback={<ListingsSkeleton />}>
        <FeaturedListings listings={featuredListings} />
      </Suspense>
      <LuxuryCollections />
      <TrustSection />
      <TopDealers dealers={dealers} />
      <CtaBand />
    </div>
  );
}

function ListingsSkeleton() {
  return (
    <section className="section-pad">
      <div className="container-luxury">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
