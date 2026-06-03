import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/home/FeaturedListings";

export async function SimilarListings({
  category,
  excludeId,
  limit = 4,
}: {
  category: string;
  excludeId: string;
  limit?: number;
}) {
  const listings = await prisma.listing.findMany({
    where: {
      category: category as any,
      status: "ACTIVE",
      id: { not: excludeId },
      deletedAt: null,
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      seller: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
      brand: { select: { name: true, logoUrl: true } },
      _count: { select: { wishlisted: true } },
    },
  });

  if (listings.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
            You May Also Like
          </p>
          <h2 className="font-serif text-2xl text-crown-ivory">Similar Listings</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
      </div>
    </div>
  );
}
