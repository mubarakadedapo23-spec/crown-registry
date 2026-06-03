import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package, Eye, DollarSign, TrendingUp, ArrowRight,
  Plus, Star, MessageSquare, AlertCircle,
} from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

async function getSellerStats(userId: string) {
  const [
    totalListings, activeListings, totalOrders, pendingOffers,
    revenue, unreadMessages, avgRating, recentListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { sellerId: userId } }),
    prisma.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
    prisma.order.count({ where: { sellerId: userId, status: { in: ["COMPLETED"] } } }),
    prisma.offer.count({ where: { sellerId: userId, status: "PENDING" } }),
    prisma.order.aggregate({
      where: { sellerId: userId, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.conversation.count({
      where: {
        participants: { some: { userId, unreadCount: { gt: 0 } } },
      },
    }),
    prisma.review.aggregate({
      where: { targetId: userId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.listing.findMany({
      where: { sellerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, status: true, price: true,
        currency: true, viewCount: true, wishlistCount: true, createdAt: true,
        images: { take: 1 },
      },
    }),
  ]);

  return {
    totalListings, activeListings, totalOrders, pendingOffers,
    revenue: Number(revenue._sum.amount ?? 0),
    unreadMessages,
    avgRating: avgRating._avg.rating ?? 0,
    reviewCount: avgRating._count,
    recentListings,
  };
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING_REVIEW: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DRAFT: "text-crown-ash bg-crown-ash/10 border-crown-ash/20",
  SOLD: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
  EXPIRED: "text-crown-ash bg-crown-ash/10 border-crown-ash/20",
};

export default async function SellerDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const role = (session.user as any).role;
  if (!["SELLER", "DEALER", "AGENCY", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    redirect("/dashboard/buyer");
  }

  const stats = await getSellerStats(session.user.id);

  const statCards = [
    {
      label: "Active Listings",
      value: stats.activeListings.toString(),
      total: `of ${stats.totalListings} total`,
      icon: Package,
      color: "text-crown-gold",
      bg: "bg-crown-gold/10",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.revenue, "USD"),
      total: `${stats.totalOrders} completed orders`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Pending Offers",
      value: stats.pendingOffers.toString(),
      total: "awaiting response",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      href: "/dashboard/seller/offers",
    },
    {
      label: "Seller Rating",
      value: stats.avgRating.toFixed(1),
      total: `${stats.reviewCount} reviews`,
      icon: Star,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
            Seller Dashboard
          </p>
          <h1 className="font-serif text-3xl text-crown-ivory">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-white
                             font-sans text-[10px] tracking-[0.15em] uppercase
                             hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" />
            New Listing
          </button>
        </Link>
      </div>

      {/* Alerts */}
      {stats.pendingOffers > 0 && (
        <div className="flex items-center gap-3 p-4 border border-amber-400/20
                        bg-amber-400/5 text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-sans text-xs">
            You have <strong>{stats.pendingOffers}</strong> pending offer{stats.pendingOffers !== 1 ? "s" : ""} waiting for your response.{" "}
            <Link href="/dashboard/seller/offers" className="underline">
              Review now →
            </Link>
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={(card as any).href ?? "#"}
            className="luxury-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-crown-ash/30" />
            </div>
            <div>
              <p className={`font-serif text-2xl font-semibold ${card.color}`}>
                {card.value}
              </p>
              <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mt-0.5">
                {card.label}
              </p>
              <p className="font-sans text-[9px] text-crown-ash/40 mt-1">
                {card.total}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent listings */}
        <div className="lg:col-span-2 luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg text-crown-ivory">Recent Listings</h2>
            <Link href="/dashboard/seller/listings"
                  className="font-sans text-[9px] tracking-widest uppercase text-crown-gold
                             hover:text-crown-gold/70 transition-colors">
              View All →
            </Link>
          </div>

          {stats.recentListings.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="w-8 h-8 text-crown-ash/20 mx-auto mb-3" />
              <p className="font-serif text-crown-ash text-lg">No listings yet</p>
              <p className="font-sans text-[10px] text-crown-ash/40 mt-1">
                Create your first listing to get started
              </p>
              <Link href="/listings/new">
                <button className="mt-4 px-5 py-2 bg-gold-gradient text-white font-sans
                                   text-[9px] tracking-widest uppercase">
                  Create Listing
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentListings.map((listing) => (
                <div key={listing.id}
                     className="flex items-center gap-4 p-3 border border-crown-gold/8
                                hover:border-crown-gold/20 transition-colors">
                  <div className="w-12 h-10 bg-crown-obsidian-light flex items-center
                                  justify-center text-crown-ash/20 shrink-0 text-xs">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-crown-ivory text-sm truncate">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`inline-flex px-1.5 py-0.5 text-[8px] tracking-widest
                                       uppercase font-sans border ${STATUS_STYLES[listing.status] ?? ""}`}>
                        {listing.status.replace("_", " ")}
                      </span>
                      <span className="font-sans text-[9px] text-crown-ash/50">
                        {formatRelativeTime(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-crown-gold text-sm">
                      {formatPrice(Number(listing.price), listing.currency)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-crown-ash/40">
                      <Eye className="w-3 h-3" />
                      <span className="font-sans text-[9px]">{listing.viewCount}</span>
                    </div>
                  </div>
                  <Link href={`/listing/${listing.slug}`}>
                    <ArrowRight className="w-4 h-4 text-crown-ash/30 hover:text-crown-gold
                                          transition-colors shrink-0" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + messages */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="luxury-card p-5">
            <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: "Create New Listing", href: "/listings/new", icon: Plus },
                { label: "View Analytics", href: "/dashboard/seller/analytics", icon: TrendingUp },
                { label: "Manage Subscription", href: "/dashboard/seller/subscription", icon: Package },
                { label: "Setup Payouts", href: "/dashboard/seller/payouts", icon: DollarSign },
                { label: "Get Verified", href: "/dashboard/seller/verification", icon: Star },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 text-crown-ash hover:text-crown-ivory
                             hover:bg-crown-gold/5 border border-transparent
                             hover:border-crown-gold/15 transition-all"
                >
                  <action.icon className="w-3.5 h-3.5 text-crown-gold/60" />
                  <span className="font-sans text-[10px] tracking-widest uppercase">{action.label}</span>
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          {/* Messages preview */}
          <div className="luxury-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold">
                Messages
              </h3>
              {stats.unreadMessages > 0 && (
                <span className="px-2 py-0.5 bg-crown-gold/20 text-crown-gold
                                 font-sans text-[8px] tracking-widest">
                  {stats.unreadMessages} unread
                </span>
              )}
            </div>
            <Link href="/dashboard/seller/messages"
                  className="flex items-center gap-3 p-3 border border-crown-gold/10
                             hover:border-crown-gold/30 text-crown-ash hover:text-crown-gold
                             transition-all">
              <MessageSquare className="w-4 h-4" />
              <span className="font-sans text-[10px] tracking-widest uppercase">
                Open Inbox
              </span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
