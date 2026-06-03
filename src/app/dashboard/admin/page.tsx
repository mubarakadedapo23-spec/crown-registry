import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Package, DollarSign, TrendingUp, AlertCircle,
  ArrowRight, Shield, Eye, Clock,
} from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const [
    totalUsers, newUsersToday, totalListings, pendingReview,
    activeListings, totalOrders, weekRevenue, flaggedContent,
    recentUsers, pendingListings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: weekAgo } },
      _sum: { commissionAmount: true },
    }),
    prisma.listing.count({ where: { status: "SUSPENDED" } }),
    prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.listing.findMany({
      where: { status: "PENDING_REVIEW" },
      take: 5,
      orderBy: { createdAt: "asc" },
      select: {
        id: true, title: true, category: true, price: true, currency: true, createdAt: true,
        seller: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    totalUsers, newUsersToday, totalListings, pendingReview, activeListings,
    totalOrders, weekRevenue: Number(weekRevenue._sum.commissionAmount ?? 0),
    flaggedContent, recentUsers, pendingListings,
  };
}

const ROLE_BADGE: Record<string, string> = {
  BUYER: "text-blue-400 bg-blue-400/10",
  SELLER: "text-emerald-400 bg-emerald-400/10",
  DEALER: "text-purple-400 bg-purple-400/10",
  ADMIN: "text-crown-gold bg-crown-gold/10",
  SUPER_ADMIN: "text-red-400 bg-red-400/10",
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const role = (session.user as any).role;
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) redirect("/dashboard/buyer");

  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: `+${stats.newUsersToday} today`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/dashboard/admin/users",
    },
    {
      label: "Active Listings",
      value: stats.activeListings.toLocaleString(),
      sub: `${stats.pendingReview} pending review`,
      icon: Package,
      color: "text-crown-gold",
      bg: "bg-crown-gold/10",
      href: "/dashboard/admin/listings",
    },
    {
      label: "Weekly Commission",
      value: formatPrice(stats.weekRevenue, "USD"),
      sub: `${stats.totalOrders} total orders`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/dashboard/admin/payments",
    },
    {
      label: "Flagged Content",
      value: stats.flaggedContent.toString(),
      sub: "requires action",
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      href: "/dashboard/admin/moderation",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-crown-gold" />
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold">
              Admin Control Panel
            </p>
          </div>
          <h1 className="font-serif text-3xl text-crown-ivory">Platform Overview</h1>
        </div>
        <div className="text-right">
          <p className="font-sans text-[9px] text-crown-ash/50 uppercase tracking-widest">
            Logged in as
          </p>
          <p className="font-serif text-crown-gold text-sm">{session.user.name}</p>
        </div>
      </div>

      {/* Alerts */}
      {stats.pendingReview > 0 && (
        <div className="flex items-center gap-3 p-4 border border-amber-400/20 bg-amber-400/5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="font-sans text-xs text-amber-400">
            <strong>{stats.pendingReview}</strong> listings are waiting for moderation review.{" "}
            <Link href="/dashboard/admin/moderation" className="underline">
              Review now →
            </Link>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="luxury-card p-5 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-crown-ash/30 group-hover:text-crown-gold
                                     group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className={`font-serif text-2xl font-semibold ${card.color}`}>{card.value}</p>
            <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mt-0.5">{card.label}</p>
            <p className="font-sans text-[9px] text-crown-ash/40 mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending listings */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg text-crown-ivory">Pending Review</h2>
            <Link href="/dashboard/admin/moderation"
                  className="font-sans text-[9px] uppercase tracking-widest text-crown-gold hover:opacity-70">
              All →
            </Link>
          </div>
          {stats.pendingListings.length === 0 ? (
            <div className="py-8 text-center">
              <Shield className="w-6 h-6 text-crown-ash/20 mx-auto mb-2" />
              <p className="font-sans text-[10px] text-crown-ash/40">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.pendingListings.map((listing) => (
                <div key={listing.id}
                     className="flex items-start gap-3 p-3 border border-amber-400/10 bg-amber-400/[0.02]">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-crown-ivory text-sm truncate">{listing.title}</p>
                    <p className="font-sans text-[9px] text-crown-ash/50 mt-0.5">
                      {listing.seller?.name ?? listing.seller?.email} ·{" "}
                      {formatRelativeTime(listing.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/30
                                       text-emerald-400 font-sans text-[8px] tracking-widest uppercase
                                       hover:bg-emerald-400/20 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-400/10 border border-red-400/30
                                       text-red-400 font-sans text-[8px] tracking-widest uppercase
                                       hover:bg-red-400/20 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg text-crown-ivory">New Users</h2>
            <Link href="/dashboard/admin/users"
                  className="font-sans text-[9px] uppercase tracking-widest text-crown-gold hover:opacity-70">
              All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id}
                   className="flex items-center gap-3 p-3 border border-crown-gold/8 hover:border-crown-gold/20 transition-colors">
                <div className="w-7 h-7 bg-crown-gold/10 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-crown-gold/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-crown-ivory text-sm truncate">{user.name ?? "Unnamed"}</p>
                  <p className="font-sans text-[9px] text-crown-ash/50 truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 font-sans text-[8px] tracking-widest
                                   uppercase rounded-sm ${ROLE_BADGE[user.role] ?? ""}`}>
                    {user.role.replace("_", " ")}
                  </span>
                  <p className="font-sans text-[8px] text-crown-ash/40 mt-0.5">
                    {formatRelativeTime(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin quick nav */}
      <div className="luxury-card p-6">
        <h2 className="font-serif text-lg text-crown-ivory mb-5">Admin Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "User Management", href: "/dashboard/admin/users", icon: Users },
            { label: "Listing Moderation", href: "/dashboard/admin/moderation", icon: Eye },
            { label: "Payment Reports", href: "/dashboard/admin/payments", icon: DollarSign },
            { label: "Platform Analytics", href: "/dashboard/admin/analytics", icon: TrendingUp },
          ].map((tool) => (
            <Link key={tool.label} href={tool.href}
                  className="flex flex-col items-center gap-2 p-4 border border-crown-gold/10
                             hover:border-crown-gold/30 hover:bg-crown-gold/5 transition-all group">
              <tool.icon className="w-5 h-5 text-crown-gold/60 group-hover:text-crown-gold transition-colors" />
              <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash
                               group-hover:text-crown-ivory transition-colors text-center">
                {tool.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
