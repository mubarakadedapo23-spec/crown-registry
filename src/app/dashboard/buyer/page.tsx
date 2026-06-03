import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Heart, ShoppingBag, Eye, MessageSquare, ArrowRight,
  Search, Clock, TrendingUp,
} from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

async function getBuyerData(userId: string) {
  const [
    wishlistCount, watchlistCount, orderCount, messageCount,
    recentOrders, recentlyViewed, savedSearches,
  ] = await Promise.all([
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.watchlistItem.count({ where: { userId } }),
    prisma.order.count({ where: { buyerId: userId } }),
    prisma.conversation.count({
      where: { participants: { some: { userId, unreadCount: { gt: 0 } } } },
    }),
    prisma.order.findMany({
      where: { buyerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true, slug: true, images: { take: 1 } } },
      },
    }),
    prisma.recentlyViewed.findMany({
      where: { userId },
      take: 6,
      orderBy: { viewedAt: "desc" },
      include: {
        listing: {
          select: {
            id: true, title: true, slug: true, price: true, currency: true,
            images: { take: 1 },
          },
        },
      },
    }),
    prisma.savedSearch.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    wishlistCount, watchlistCount, orderCount, messageCount,
    recentOrders, recentlyViewed, savedSearches,
  };
}

export default async function BuyerDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const data = await getBuyerData(session.user.id);

  const statCards = [
    { label: "Wishlist", value: data.wishlistCount, icon: Heart, href: "/dashboard/buyer/wishlist", color: "text-pink-400" },
    { label: "Watchlist", value: data.watchlistCount, icon: Eye, href: "/dashboard/buyer/watchlist", color: "text-blue-400" },
    { label: "Orders", value: data.orderCount, icon: ShoppingBag, href: "/dashboard/buyer/orders", color: "text-crown-gold" },
    { label: "Messages", value: data.messageCount, icon: MessageSquare, href: "/dashboard/buyer/messages", color: "text-emerald-400" },
  ];

  const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending",
    PAYMENT_PROCESSING: "Processing",
    PAYMENT_HELD: "Escrow",
    CONFIRMED: "Confirmed",
    SHIPPING: "In Transit",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
          Buyer Dashboard
        </p>
        <h1 className="font-serif text-3xl text-crown-ivory">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="font-sans text-crown-ash text-sm mt-1">
          Your luxury asset portfolio at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="luxury-card p-5 group">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <ArrowRight className="w-3.5 h-3.5 text-crown-ash/30 group-hover:text-crown-gold
                                     group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className={`font-serif text-3xl font-light ${card.color}`}>{card.value}</p>
            <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mt-1">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg text-crown-ivory">Recent Orders</h2>
            <Link href="/dashboard/buyer/orders"
                  className="font-sans text-[9px] tracking-widest uppercase text-crown-gold hover:opacity-70">
              View All →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-8 h-8 text-crown-ash/20 mx-auto mb-3" />
              <p className="font-serif text-crown-ash text-lg">No orders yet</p>
              <p className="font-sans text-[10px] text-crown-ash/40 mt-1">
                Discover extraordinary assets on the marketplace
              </p>
              <Link href="/marketplace">
                <button className="mt-4 px-5 py-2 border border-crown-gold/30 text-crown-gold
                                   font-sans text-[9px] tracking-widest uppercase hover:border-crown-gold/60">
                  Browse Marketplace
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id}
                     className="flex items-center gap-4 p-3 border border-crown-gold/8 hover:border-crown-gold/20 transition-colors">
                  <div className="w-12 h-10 bg-crown-obsidian-light flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-crown-ash/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-crown-ivory text-sm truncate">
                      {order.listing?.title ?? "Listing removed"}
                    </p>
                    <p className="font-sans text-[9px] text-crown-ash/50 mt-0.5">
                      {order.orderNumber} · {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-crown-gold text-sm">
                      {formatPrice(Number(order.totalAmount), order.currency)}
                    </p>
                    <span className="font-sans text-[8px] tracking-widest uppercase text-crown-ash/50">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Saved searches */}
          <div className="luxury-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold">
                Saved Searches
              </h3>
              <Link href="/dashboard/buyer/searches"
                    className="text-crown-ash/50 hover:text-crown-gold text-[9px] font-sans uppercase tracking-widest">
                Manage
              </Link>
            </div>
            {data.savedSearches.length === 0 ? (
              <div className="py-4 text-center">
                <Search className="w-5 h-5 text-crown-ash/20 mx-auto mb-2" />
                <p className="font-sans text-[10px] text-crown-ash/40">No saved searches</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.savedSearches.map((s) => (
                  <Link key={s.id} href={`/search?saved=${s.id}`}
                        className="flex items-center gap-2 p-2.5 border border-crown-gold/8
                                   hover:border-crown-gold/25 transition-colors">
                    <Search className="w-3 h-3 text-crown-ash/50 shrink-0" />
                    <span className="font-sans text-[10px] text-crown-ash truncate">{s.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently viewed */}
          <div className="luxury-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-3.5 h-3.5 text-crown-gold/60" />
              <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold">
                Recently Viewed
              </h3>
            </div>
            {data.recentlyViewed.length === 0 ? (
              <p className="font-sans text-[10px] text-crown-ash/40 text-center py-4">
                Nothing viewed yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentlyViewed.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/listing/${item.listing?.slug}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-8 bg-crown-obsidian-light shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[10px] text-crown-ash truncate">
                        {item.listing?.title}
                      </p>
                      <p className="font-serif text-crown-gold text-xs">
                        {formatPrice(Number(item.listing?.price), item.listing?.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently viewed (full row) */}
      {data.recentlyViewed.length > 0 && (
        <div className="luxury-card p-6">
          <h2 className="font-serif text-lg text-crown-ivory mb-5">Continue Browsing</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.recentlyViewed.map((item) => (
              <Link key={item.id} href={`/listing/${item.listing?.slug}`} className="group">
                <div className="aspect-[4/3] bg-crown-obsidian-light mb-2 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-2xl
                                  text-crown-ash/20 group-hover:scale-105 transition-transform">
                    ◆
                  </div>
                </div>
                <p className="font-sans text-[9px] text-crown-ash group-hover:text-crown-gold
                               transition-colors line-clamp-2">
                  {item.listing?.title}
                </p>
                <p className="font-serif text-crown-gold text-sm mt-0.5">
                  {formatPrice(Number(item.listing?.price), item.listing?.currency)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
