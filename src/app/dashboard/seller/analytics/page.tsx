import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Eye, Heart, MessageSquare, DollarSign, Package } from "lucide-react";

async function getAnalytics(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    currentViews, previousViews,
    currentWishlists, previousWishlists,
    currentOrders, revenue,
    topListings, recentOffers,
  ] = await Promise.all([
    // Current 30d views
    prisma.listing.aggregate({
      where: { sellerId: userId, updatedAt: { gte: thirtyDaysAgo } },
      _sum: { viewCount: true },
    }),
    // Previous 30d (rough approximation)
    prisma.listing.aggregate({
      where: { sellerId: userId, updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { viewCount: true },
    }),
    prisma.listing.aggregate({
      where: { sellerId: userId, updatedAt: { gte: thirtyDaysAgo } },
      _sum: { wishlistCount: true },
    }),
    prisma.listing.aggregate({
      where: { sellerId: userId, updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { wishlistCount: true },
    }),
    prisma.order.count({ where: { sellerId: userId, status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.aggregate({
      where: { sellerId: userId, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.listing.findMany({
      where: { sellerId: userId, status: "ACTIVE" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, viewCount: true, wishlistCount: true, price: true, currency: true },
    }),
    prisma.offer.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        listing: { select: { title: true, slug: true } },
        buyer: { select: { name: true } },
      },
    }),
  ]);

  const viewChange = previousViews._sum.viewCount
    ? Math.round(((Number(currentViews._sum.viewCount ?? 0) - Number(previousViews._sum.viewCount ?? 0)) /
        Number(previousViews._sum.viewCount)) * 100)
    : 0;

  return {
    views: Number(currentViews._sum.viewCount ?? 0),
    viewChange,
    wishlists: Number(currentWishlists._sum.wishlistCount ?? 0),
    orders: currentOrders,
    totalRevenue: Number(revenue._sum.amount ?? 0),
    topListings,
    recentOffers,
  };
}

const OFFER_STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-400",
  ACCEPTED: "text-emerald-400",
  REJECTED: "text-red-400",
  COUNTERED: "text-blue-400",
  EXPIRED: "text-crown-ash/40",
};

export default async function SellerAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const data = await getAnalytics(session.user.id);

  const metrics = [
    {
      label: "Listing Views (30d)",
      value: data.views.toLocaleString(),
      change: data.viewChange,
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Wishlisted (30d)",
      value: data.wishlists.toLocaleString(),
      icon: Heart,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
    {
      label: "Orders (30d)",
      value: data.orders.toLocaleString(),
      icon: Package,
      color: "text-crown-gold",
      bg: "bg-crown-gold/10",
    },
    {
      label: "Total Revenue",
      value: formatPrice(data.totalRevenue, "USD"),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
          Seller Dashboard
        </p>
        <h1 className="font-serif text-2xl text-crown-ivory">Analytics</h1>
        <p className="font-sans text-crown-ash text-xs mt-1">Last 30 days performance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="luxury-card p-5">
            <div className={`w-9 h-9 ${m.bg} flex items-center justify-center mb-4`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className={`font-serif text-2xl font-semibold ${m.color}`}>{m.value}</p>
            <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mt-1">{m.label}</p>
            {m.change !== undefined && (
              <p className={`font-sans text-[9px] mt-1 ${m.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.change >= 0 ? "+" : ""}{m.change}% vs last period
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top listings */}
        <div className="luxury-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-crown-gold/60" />
            <h2 className="font-serif text-lg text-crown-ivory">Top Performing Listings</h2>
          </div>
          {data.topListings.length === 0 ? (
            <p className="font-sans text-crown-ash/50 text-xs py-6 text-center">No active listings yet</p>
          ) : (
            <div className="space-y-3">
              {data.topListings.map((listing, i) => (
                <div key={listing.id} className="flex items-center gap-3">
                  <span className="font-serif text-crown-gold/40 text-lg w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <a href={`/listing/${listing.slug}`}
                       className="font-sans text-xs text-crown-ivory hover:text-crown-gold
                                  transition-colors truncate block">
                      {listing.title}
                    </a>
                    <div className="flex gap-3 mt-0.5 text-crown-ash/40 font-sans text-[9px]">
                      <span>👁 {listing.viewCount.toLocaleString()}</span>
                      <span>♡ {listing.wishlistCount}</span>
                    </div>
                  </div>
                  <span className="font-serif text-crown-gold text-sm shrink-0">
                    {formatPrice(Number(listing.price), listing.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent offers */}
        <div className="luxury-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-4 h-4 text-crown-gold/60" />
            <h2 className="font-serif text-lg text-crown-ivory">Recent Offers</h2>
          </div>
          {data.recentOffers.length === 0 ? (
            <p className="font-sans text-crown-ash/50 text-xs py-6 text-center">No offers received yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentOffers.map((offer) => (
                <div key={offer.id}
                     className="flex items-center gap-3 p-3 border border-crown-gold/8">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs text-crown-ivory truncate">
                      {offer.listing?.title}
                    </p>
                    <p className="font-sans text-[9px] text-crown-ash/50 mt-0.5">
                      from {offer.buyer?.name ?? "Anonymous"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-crown-gold text-sm">
                      {formatPrice(Number(offer.amount), offer.currency)}
                    </p>
                    <p className={`font-sans text-[8px] tracking-widest uppercase mt-0.5
                                   ${OFFER_STATUS_STYLES[offer.status] ?? "text-crown-ash"}`}>
                      {offer.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade prompt for analytics */}
      <div className="luxury-card p-8 text-center border-crown-gold/20">
        <TrendingUp className="w-8 h-8 text-crown-gold/30 mx-auto mb-3" />
        <h3 className="font-serif text-xl text-crown-ivory mb-2">Advanced Analytics</h3>
        <p className="font-sans text-crown-ash text-sm mb-5 max-w-sm mx-auto">
          Upgrade to Business or Enterprise for detailed conversion funnels, geographic breakdowns,
          buyer demographics, and real-time data.
        </p>
        <a href="/dashboard/seller/subscription">
          <button className="px-8 py-3 bg-gold-gradient text-white font-sans
                             text-[10px] tracking-[0.2em] uppercase hover:opacity-90">
            Upgrade Plan
          </button>
        </a>
      </div>
    </div>
  );
}
