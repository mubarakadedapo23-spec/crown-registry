"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, MapPin, Eye, ArrowRight, Shield } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/listings";
import { formatPrice } from "@/lib/utils";

interface ListingCardProps {
  listing: any;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const image = listing.images?.[0]?.url;
  const badgeLabel = listing.isExclusive ? "Exclusive" : listing.isFeatured ? "Featured" : null;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistLoading(true);
    const result = await toggleWishlist(listing.id);
    if (!("error" in result)) setWishlisted(result.saved);
    setWishlistLoading(false);
  };

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="listing-card group block"
      style={{
        animation: `fadeUp 0.6s ease ${index * 0.08}s both`,
      }}
    >
      {/* Image */}
      <div className="relative h-56 bg-crown-obsidian-light overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="listing-card-image object-cover transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">
              {categoryIcon(listing.category)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex gap-2">
            {badgeLabel && (
              <span className={`px-2.5 py-1 font-sans text-[8px] tracking-[0.2em] uppercase
                               ${listing.isExclusive
                                 ? "bg-gold-gradient text-white"
                                 : "glass-card text-crown-gold"}`}>
                {badgeLabel}
              </span>
            )}
            <span className="glass-card px-2.5 py-1 font-sans text-[8px] tracking-[0.2em]
                             uppercase text-crown-ash">
              {formatCategory(listing.category)}
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="w-8 h-8 glass-card flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:border-crown-gold/50"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                wishlisted ? "text-crown-gold fill-crown-gold" : "text-crown-ash"
              }`}
            />
          </button>
        </div>

        {/* Verified badge */}
        {listing.seller?.verificationStatus === "VERIFIED" && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1 glass-card px-2 py-1">
              <Shield className="w-2.5 h-2.5 text-crown-gold" />
              <span className="font-sans text-[8px] tracking-widest uppercase text-crown-gold">
                Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 bg-crown-obsidian-mid border-t border-crown-gold/8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 text-crown-ash/60 shrink-0" />
          <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60">
            {[listing.city, listing.country].filter(Boolean).join(", ")}
          </span>
          {listing.vehicleSpecs?.year && (
            <>
              <span className="text-crown-ash/30">·</span>
              <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60">
                {listing.vehicleSpecs.year}
              </span>
            </>
          )}
        </div>

        <h3 className="font-serif text-crown-ivory text-lg leading-snug mb-3 line-clamp-2
                       group-hover:text-crown-gold/90 transition-colors duration-200">
          {listing.title}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            {listing.priceOnRequest ? (
              <span className="font-serif text-crown-gold text-lg font-medium">
                Price on Request
              </span>
            ) : (
              <span className="font-serif text-crown-gold text-xl font-semibold">
                {formatPrice(Number(listing.price), listing.currency)}
              </span>
            )}
            {listing.seller && (
              <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/50 mt-1">
                {listing.seller.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-crown-ash/40 font-sans text-[9px]">
              <Eye className="w-3 h-3" />
              {listing.viewCount?.toLocaleString() ?? 0}
            </span>
            <ArrowRight className="w-4 h-4 text-crown-gold opacity-0 group-hover:opacity-100
                                   -translate-x-1 group-hover:translate-x-0
                                   transition-all duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedListings({ listings }: { listings: any[] }) {
  return (
    <section className="section-pad">
      <div className="container-luxury">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-3">
              Hand-Curated Selection
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-crown-ivory">
              Featured Listings
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="hidden md:flex items-center gap-2 font-sans text-[10px] tracking-[0.2em]
                       uppercase text-crown-gold border border-crown-gold/30
                       hover:border-crown-gold/70 px-6 py-3 transition-all duration-200"
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-crown-ash text-xl">No featured listings yet.</p>
            <p className="font-sans text-crown-ash/50 text-sm mt-2">
              Be among the first to list an extraordinary asset.
            </p>
            <Link href="/listings/new">
              <button className="mt-6 px-8 py-3 bg-gold-gradient text-white font-sans
                                 text-[10px] tracking-[0.2em] uppercase">
                List Your Asset
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10 md:hidden">
          <Link href="/marketplace">
            <button className="flex items-center gap-2 px-8 py-3 border border-crown-gold/30
                               text-crown-gold font-sans text-[10px] tracking-[0.2em] uppercase
                               hover:border-crown-gold/70 transition-all">
              View All Listings
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Helpers
function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    LUXURY_CARS: "🏎", HYPERCARS: "🏎", CLASSIC_CARS: "🚗", MOTORCYCLES: "🏍",
    PRIVATE_JETS: "✈", HELICOPTERS: "🚁",
    YACHTS: "⛵", SUPERYACHTS: "⛴",
    REAL_ESTATE: "🏛",
    WATCHES: "⌚", JEWELRY: "💎", FASHION: "👗",
    FINE_ART: "🖼", COLLECTIBLES: "🏺",
    SNEAKERS: "👟", ELECTRONICS: "📱",
    EXPERIENCES: "✨", TRAVEL: "🌍",
  };
  return icons[category] ?? "◆";
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
