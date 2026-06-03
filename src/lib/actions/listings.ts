"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, cacheGet, cacheSet, cacheDel, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { z } from "zod";
import slugify from "slugify";
import { nanoid } from "nanoid";
import type { Category, Currency, ListingType, Condition } from "@prisma/client";

// ── Validation ─────────────────────────────────

const createListingSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(10000),
  shortDescription: z.string().max(500).optional(),
  category: z.enum([
    "LUXURY_CARS", "HYPERCARS", "CLASSIC_CARS", "MOTORCYCLES",
    "PRIVATE_JETS", "HELICOPTERS", "YACHTS", "SUPERYACHTS",
    "REAL_ESTATE", "FASHION", "WATCHES", "JEWELRY", "FINE_ART",
    "COLLECTIBLES", "SNEAKERS", "ELECTRONICS", "EXPERIENCES", "TRAVEL",
  ] as [Category, ...Category[]]),
  listingType: z.enum(["SALE", "AUCTION", "CHARTER", "LEASE", "RENT"] as [ListingType, ...ListingType[]]).default("SALE"),
  condition: z.enum(["NEW", "EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "PARTS_ONLY"] as [Condition, ...Condition[]]).optional(),
  price: z.number().positive().max(1_000_000_000),
  currency: z.enum(["USD", "EUR", "GBP", "CHF", "AED", "JPY", "HKD", "SGD", "CAD", "AUD"] as [Currency, ...Currency[]]).default("USD"),
  priceNegotiable: z.boolean().default(false),
  priceOnRequest: z.boolean().default(false),
  country: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  brandId: z.string().optional(),
  images: z.array(z.string().url()).min(1).max(30),
  tags: z.array(z.string()).max(10).optional(),
});

// ── Actions ────────────────────────────────────

export async function createListing(formData: z.infer<typeof createListingSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check subscription limits
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const activeListing = await prisma.listing.count({
    where: { sellerId: session.user.id, status: { in: ["ACTIVE", "PENDING_REVIEW"] } },
  });

  if (activeListing >= (sub?.maxListings ?? 5)) {
    return { error: "Listing limit reached. Please upgrade your plan." };
  }

  const parsed = createListingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid listing data", details: parsed.error.flatten() };
  }

  const { images, tags, ...data } = parsed.data;

  // Generate unique slug
  const baseSlug = slugify(data.title, { lower: true, strict: true });
  const slug = `${baseSlug}-${nanoid(8)}`;

  try {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        price: data.price,
        sellerId: session.user.id,
        status: "PENDING_REVIEW",
        images: {
          create: images.map((url, i) => ({
            url,
            sortOrder: i,
          })),
        },
        ...(tags && {
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
        }),
      },
      include: { images: true, tags: true },
    });

    // Update user listing count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalListings: { increment: 1 } },
    });

    // Invalidate caches
    await cacheDel(CACHE_KEYS.FEATURED_LISTINGS);

    revalidatePath("/dashboard/seller");
    return { success: true, listingId: listing.id, slug: listing.slug };
  } catch (error) {
    console.error("createListing error:", error);
    return { error: "Failed to create listing" };
  }
}

export async function updateListingStatus(
  listingId: string,
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED"
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  });

  if (!listing) return { error: "Listing not found" };

  const isOwner = listing.sellerId === session.user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

  if (!isOwner && !isAdmin) return { error: "Forbidden" };

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status,
      ...(status === "ACTIVE" ? { publishedAt: new Date() } : {}),
    },
  });

  await cacheDel(CACHE_KEYS.LISTING(listingId));
  revalidatePath(`/listing/${listingId}`);
  return { success: true };
}

export async function getListings(params: {
  category?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  query?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
}) {
  const {
    category,
    country,
    minPrice,
    maxPrice,
    condition,
    brand,
    sortBy = "newest",
    page = 1,
    limit = 24,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {
    status: "ACTIVE",
    deletedAt: null,
    ...(category && { category: category as Category }),
    ...(country && { country }),
    ...(condition && { condition: condition as Condition }),
    ...(minPrice || maxPrice
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(brand && { brand: { name: { contains: brand, mode: "insensitive" } } }),
  };

  const orderBy: any = {
    newest: { createdAt: "desc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    popular: { viewCount: "desc" },
  }[sortBy];

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip,
      take: limit,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        seller: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        brand: { select: { id: true, name: true, logoUrl: true } },
        _count: { select: { wishlisted: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export async function getListingBySlug(slug: string) {
  const cached = await cacheGet<any>(CACHE_KEYS.LISTING(slug));
  if (cached) return cached;

  const listing = await prisma.listing.findUnique({
    where: { slug, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      videos: true,
      documents: true,
      tags: true,
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          verificationStatus: true,
          createdAt: true,
          totalListings: true,
          reputationScore: true,
          sellerProfile: {
            select: {
              businessName: true,
              responseRate: true,
              avgResponseTime: true,
            },
          },
          dealerProfile: {
            select: {
              dealerName: true,
              isVerified: true,
              isPremium: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
      },
      brand: true,
      model: true,
      vehicleSpecs: true,
      realEstateSpecs: true,
      aircraftSpecs: true,
      watercraftSpecs: true,
      watchSpecs: true,
      fashionSpecs: true,
      _count: { select: { wishlisted: true, offers: true } },
    },
  });

  if (!listing) return null;

  // Increment view count (non-blocking)
  prisma.listing
    .update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);

  await cacheSet(CACHE_KEYS.LISTING(slug), listing, CACHE_TTL.MEDIUM);
  return listing;
}

export async function getFeaturedListings(limit = 12) {
  const cached = await cacheGet<any[]>(CACHE_KEYS.FEATURED_LISTINGS);
  if (cached) return cached;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
      deletedAt: null,
    },
    take: limit,
    orderBy: [{ featuredUntil: "desc" }, { viewCount: "desc" }],
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      seller: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
      brand: { select: { name: true, logoUrl: true } },
    },
  });

  await cacheSet(CACHE_KEYS.FEATURED_LISTINGS, listings, CACHE_TTL.MEDIUM);
  return listings;
}

export async function toggleWishlist(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to save listings" };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { wishlistCount: { decrement: 1 } },
    });
    return { saved: false };
  } else {
    await prisma.wishlistItem.create({
      data: { userId: session.user.id, listingId },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { wishlistCount: { increment: 1 } },
    });
    return { saved: true };
  }
}

export async function submitOffer(data: {
  listingId: string;
  amount: number;
  currency: Currency;
  message?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to make an offer" };

  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId, status: "ACTIVE" },
    select: { sellerId: true, price: true, priceNegotiable: true },
  });

  if (!listing) return { error: "Listing not found or no longer available" };
  if (listing.sellerId === session.user.id) return { error: "Cannot make offer on your own listing" };
  if (!listing.priceNegotiable && data.amount >= Number(listing.price)) {
    return { error: "This listing is priced firm. Use Buy Now." };
  }

  const offer = await prisma.offer.create({
    data: {
      listingId: data.listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      amount: data.amount,
      currency: data.currency,
      message: data.message,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    },
  });

  // Notify seller
  await prisma.notification.create({
    data: {
      userId: listing.sellerId,
      type: "offer",
      title: "New Offer Received",
      body: `You have received an offer of ${data.currency} ${data.amount.toLocaleString()}`,
      data: { offerId: offer.id, listingId: data.listingId },
    },
  });

  return { success: true, offerId: offer.id };
}
