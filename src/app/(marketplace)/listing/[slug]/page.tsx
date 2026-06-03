import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getListingBySlug } from "@/lib/actions/listings";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { ListingInfo } from "@/components/listing/ListingInfo";
import { SellerCard } from "@/components/listing/SellerCard";
import { ContactForm } from "@/components/listing/ContactForm";
import { SimilarListings } from "@/components/listing/SimilarListings";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Listing Not Found" };

  return {
    title: `${listing.title} | Crown Registry`,
    description: listing.shortDescription ?? listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.shortDescription ?? listing.description.slice(0, 160),
      images: listing.images[0] ? [{ url: listing.images[0].url }] : [],
      type: "website",
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const [listing, session] = await Promise.all([
    getListingBySlug(params.slug),
    auth(),
  ]);

  if (!listing || listing.status === "ARCHIVED" || listing.status === "DRAFT") {
    notFound();
  }

  // Track recent view for authenticated users
  if (session?.user?.id && session.user.id !== listing.sellerId) {
    prisma.recentlyViewed.upsert({
      where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
      update: { viewedAt: new Date() },
      create: { userId: session.user.id, listingId: listing.id },
    }).catch(() => null);
  }

  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-crown-obsidian pt-16">
      {/* Breadcrumb */}
      <div className="border-b border-crown-gold/8 bg-[#030303]">
        <div className="container-luxury px-6 py-3 flex items-center gap-2 font-sans text-[9px]
                        tracking-widest uppercase text-crown-ash">
          <a href="/" className="hover:text-crown-gold transition-colors">Home</a>
          <span className="text-crown-gold/30">›</span>
          <a href="/marketplace" className="hover:text-crown-gold transition-colors">Marketplace</a>
          <span className="text-crown-gold/30">›</span>
          <a href={`/marketplace/${listing.category.toLowerCase()}`} className="hover:text-crown-gold transition-colors">
            {listing.category.replace(/_/g, " ")}
          </a>
          <span className="text-crown-gold/30">›</span>
          <span className="text-crown-ivory truncate max-w-[200px]">{listing.title}</span>
        </div>
      </div>

      <div className="container-luxury px-6 lg:px-10 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Gallery + Info */}
          <div className="lg:col-span-2 space-y-8">
            <ListingGallery images={listing.images} title={listing.title} />
            <ListingInfo listing={listing} isOwner={isOwner} />
          </div>

          {/* Right: Price + Contact */}
          <div className="space-y-5 lg:sticky lg:top-24 self-start">
            {/* Price card */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  {listing.priceOnRequest ? (
                    <p className="font-serif text-2xl text-crown-gold">Price on Request</p>
                  ) : (
                    <>
                      <p className="font-serif text-3xl text-crown-gold font-semibold">
                        {formatPrice(Number(listing.price), listing.currency)}
                      </p>
                      {listing.priceNegotiable && (
                        <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mt-1">
                          Price negotiable
                        </p>
                      )}
                    </>
                  )}
                </div>
                {listing.isVerified && (
                  <span className="badge-verified">✦ Verified</span>
                )}
              </div>

              {listing.isFeatured && (
                <span className="badge-featured mt-2 inline-block">◆ Featured</span>
              )}

              <div className="flex gap-3 mt-2 font-sans text-[9px] tracking-widest uppercase text-crown-ash/50">
                <span>👁 {listing.viewCount.toLocaleString()} views</span>
                <span>♡ {listing._count?.wishlisted ?? 0} saved</span>
              </div>

              {!isOwner && listing.status === "ACTIVE" && (
                <div className="mt-5 space-y-3">
                  <a href={`/checkout/${listing.id}`}>
                    <button className="w-full py-4 bg-gold-gradient text-white font-sans
                                       text-[10px] tracking-[0.2em] uppercase hover:opacity-90
                                       transition-opacity">
                      Buy Now
                    </button>
                  </a>
                  {listing.priceNegotiable && (
                    <button className="w-full py-3 border border-crown-gold/30 text-crown-gold
                                       font-sans text-[10px] tracking-[0.2em] uppercase
                                       hover:border-crown-gold/60 transition-colors">
                      Make an Offer
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <a href={`/listings/${listing.id}/edit`}>
                  <button className="w-full mt-4 py-3 border border-crown-gold/30 text-crown-gold
                                     font-sans text-[10px] tracking-[0.2em] uppercase
                                     hover:border-crown-gold/60 transition-colors">
                    Edit Listing
                  </button>
                </a>
              )}
            </div>

            {/* Key details */}
            <div className="luxury-card p-5">
              <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold mb-4">
                Key Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Category", value: listing.category.replace(/_/g, " ") },
                  listing.condition && { label: "Condition", value: listing.condition.replace(/_/g, " ") },
                  listing.country && { label: "Location", value: [listing.city, listing.country].filter(Boolean).join(", ") },
                  listing.vehicleSpecs?.year && { label: "Year", value: listing.vehicleSpecs.year },
                  listing.vehicleSpecs?.mileage && { label: "Mileage", value: `${listing.vehicleSpecs.mileage.toLocaleString()} ${listing.vehicleSpecs.mileageUnit}` },
                  listing.vehicleSpecs?.horsepower && { label: "Power", value: `${listing.vehicleSpecs.horsepower} hp` },
                  listing.realEstateSpecs?.bedrooms && { label: "Bedrooms", value: listing.realEstateSpecs.bedrooms },
                  listing.realEstateSpecs?.floorArea && { label: "Floor Area", value: `${listing.realEstateSpecs.floorArea} m²` },
                  listing.watercraftSpecs?.lengthM && { label: "Length", value: `${listing.watercraftSpecs.lengthM}m` },
                  listing.aircraftSpecs?.totalHours && { label: "Total Hours", value: listing.aircraftSpecs.totalHours.toLocaleString() },
                  listing.watchSpecs?.referenceNumber && { label: "Reference", value: listing.watchSpecs.referenceNumber },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.label} className="flex justify-between items-center py-1.5
                                                    border-b border-crown-gold/6 last:border-0">
                    <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60">
                      {item.label}
                    </span>
                    <span className="font-sans text-xs text-crown-ivory capitalize">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller card */}
            <SellerCard seller={listing.seller} listingId={listing.id} />

            {/* Contact form */}
            {!isOwner && (
              <ContactForm
                listingId={listing.id}
                sellerId={listing.sellerId}
                listingTitle={listing.title}
              />
            )}
          </div>
        </div>

        {/* Similar listings */}
        <div className="mt-16">
          <SimilarListings category={listing.category} excludeId={listing.id} />
        </div>
      </div>
    </div>
  );
}
