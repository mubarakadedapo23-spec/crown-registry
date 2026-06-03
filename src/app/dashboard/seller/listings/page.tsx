import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, Edit, MoreVertical, Package } from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING_REVIEW: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DRAFT: "text-crown-ash bg-crown-ash/10 border-crown-ash/20",
  SOLD: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
  EXPIRED: "text-crown-ash bg-crown-ash/10 border-crown-ash/20",
  ARCHIVED: "text-crown-ash bg-crown-ash/10 border-crown-ash/20",
};

export default async function SellerListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const page = Number(searchParams.page ?? 1);
  const limit = 20;
  const status = searchParams.status as any;

  const where = {
    sellerId: session.user.id,
    ...(status ? { status } : {}),
    deletedAt: null,
  };

  const [listings, total, counts] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        images: { take: 1 },
        _count: { select: { wishlisted: true, offers: true } },
      },
    }),
    prisma.listing.count({ where }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { sellerId: session.user.id, deletedAt: null },
      _count: true,
    }),
  ]);

  const statusCounts = counts.reduce(
    (acc, c) => ({ ...acc, [c.status]: c._count }),
    {} as Record<string, number>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
            Seller Dashboard
          </p>
          <h1 className="font-serif text-2xl text-crown-ivory">My Listings</h1>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-white
                             font-sans text-[10px] tracking-[0.15em] uppercase hover:opacity-90">
            <Plus className="w-3.5 h-3.5" />
            New Listing
          </button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-crown-gold/10 overflow-x-auto no-scrollbar">
        {[
          { label: "All", value: undefined },
          { label: "Active", value: "ACTIVE" },
          { label: "Pending Review", value: "PENDING_REVIEW" },
          { label: "Draft", value: "DRAFT" },
          { label: "Sold", value: "SOLD" },
          { label: "Suspended", value: "SUSPENDED" },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={`/dashboard/seller/listings${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-4 py-3 font-sans text-[9px] tracking-widest uppercase whitespace-nowrap
                        border-b-2 transition-all ${
              status === tab.value || (!status && !tab.value)
                ? "text-crown-gold border-crown-gold"
                : "text-crown-ash border-transparent hover:text-crown-ivory"
            }`}
          >
            {tab.label}
            {tab.value && statusCounts[tab.value] !== undefined && (
              <span className="ml-1.5 text-crown-ash/40">({statusCounts[tab.value]})</span>
            )}
          </Link>
        ))}
      </div>

      {/* Listings table */}
      {listings.length === 0 ? (
        <div className="luxury-card py-20 text-center">
          <Package className="w-8 h-8 text-crown-ash/20 mx-auto mb-3" />
          <p className="font-serif text-crown-ash text-xl mb-2">No listings found</p>
          <p className="font-sans text-[10px] text-crown-ash/40">
            {status ? `No ${status.toLowerCase().replace("_", " ")} listings` : "Create your first listing"}
          </p>
          <Link href="/listings/new">
            <button className="mt-5 px-6 py-2.5 bg-gold-gradient text-white font-sans
                               text-[9px] tracking-widest uppercase hover:opacity-90">
              Create Listing
            </button>
          </Link>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-crown-gold/10">
                  {["Asset", "Status", "Price", "Views", "Saved", "Offers", "Listed", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[8px] tracking-[0.2em]
                                           uppercase text-crown-ash/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}
                      className="border-b border-crown-gold/6 hover:bg-crown-gold/[0.02] transition-colors">
                    {/* Asset */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 bg-crown-obsidian-light shrink-0 overflow-hidden">
                          {listing.images[0] ? (
                            <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-crown-ash/20 text-xs">◆</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-crown-ivory text-sm truncate max-w-[220px]">
                            {listing.title}
                          </p>
                          <p className="font-sans text-[9px] text-crown-ash/40 uppercase tracking-widest">
                            {listing.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 font-sans text-[8px] tracking-widest
                                        uppercase border ${STATUS_STYLES[listing.status] ?? ""}`}>
                        {listing.status.replace("_", " ")}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-4 font-serif text-crown-gold text-sm">
                      {listing.priceOnRequest
                        ? "POR"
                        : formatPrice(Number(listing.price), listing.currency)}
                    </td>
                    {/* Views */}
                    <td className="px-4 py-4 font-sans text-xs text-crown-ash">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-crown-ash/40" />
                        {listing.viewCount.toLocaleString()}
                      </div>
                    </td>
                    {/* Saved */}
                    <td className="px-4 py-4 font-sans text-xs text-crown-ash">
                      {listing._count.wishlisted}
                    </td>
                    {/* Offers */}
                    <td className="px-4 py-4 font-sans text-xs text-crown-ash">
                      {listing._count.offers}
                    </td>
                    {/* Listed */}
                    <td className="px-4 py-4 font-sans text-[9px] text-crown-ash/50">
                      {formatRelativeTime(listing.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/listing/${listing.slug}`}
                              className="w-7 h-7 border border-crown-gold/15 flex items-center justify-center
                                         text-crown-ash hover:text-crown-gold hover:border-crown-gold/40 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/listings/${listing.id}/edit`}
                              className="w-7 h-7 border border-crown-gold/15 flex items-center justify-center
                                         text-crown-ash hover:text-crown-gold hover:border-crown-gold/40 transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-crown-gold/10">
              <p className="font-sans text-[9px] text-crown-ash/50">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/dashboard/seller/listings?page=${p}${status ? `&status=${status}` : ""}`}
                    className={`w-7 h-7 flex items-center justify-center font-sans text-xs
                                border transition-all ${
                      p === page
                        ? "border-crown-gold bg-crown-gold/10 text-crown-gold"
                        : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
