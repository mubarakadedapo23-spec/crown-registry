"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Heart, ShoppingBag, MessageSquare, Bell,
  Settings, Search, Eye, Users, BarChart3, Package,
  FileText, CreditCard, MapPin, Shield, Star, Plus,
  ChevronLeft, ChevronRight, Store, TrendingUp, UserCheck,
  Megaphone, DollarSign, Tags, AlertCircle, Database,
  Globe, Layers,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const BUYER_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
  { label: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
  { label: "Watchlist", href: "/dashboard/buyer/watchlist", icon: Eye },
  { label: "My Orders", href: "/dashboard/buyer/orders", icon: ShoppingBag },
  { label: "Offers Made", href: "/dashboard/buyer/offers", icon: Tags },
  { label: "Messages", href: "/dashboard/buyer/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/buyer/notifications", icon: Bell },
  { label: "Saved Searches", href: "/dashboard/buyer/searches", icon: Search },
  { label: "Payment Methods", href: "/dashboard/buyer/payments", icon: CreditCard },
  { label: "Addresses", href: "/dashboard/buyer/addresses", icon: MapPin },
  { label: "Settings", href: "/dashboard/buyer/settings", icon: Settings },
];

const SELLER_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/seller", icon: LayoutDashboard },
  { label: "My Listings", href: "/dashboard/seller/listings", icon: Package },
  { label: "Analytics", href: "/dashboard/seller/analytics", icon: BarChart3 },
  { label: "Orders", href: "/dashboard/seller/orders", icon: ShoppingBag },
  { label: "Offers", href: "/dashboard/seller/offers", icon: Tags },
  { label: "Messages", href: "/dashboard/seller/messages", icon: MessageSquare },
  { label: "Reviews", href: "/dashboard/seller/reviews", icon: Star },
  { label: "Payouts", href: "/dashboard/seller/payouts", icon: DollarSign },
  { label: "Subscription", href: "/dashboard/seller/subscription", icon: Layers },
  { label: "Advertising", href: "/dashboard/seller/advertising", icon: Megaphone },
  { label: "Verification", href: "/dashboard/seller/verification", icon: UserCheck },
  { label: "Settings", href: "/dashboard/seller/settings", icon: Settings },
];

const DEALER_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/dealer", icon: LayoutDashboard },
  { label: "Inventory", href: "/dashboard/dealer/inventory", icon: Package },
  { label: "CRM / Leads", href: "/dashboard/dealer/leads", icon: Users },
  { label: "Analytics", href: "/dashboard/dealer/analytics", icon: BarChart3 },
  { label: "Sales", href: "/dashboard/dealer/sales", icon: TrendingUp },
  { label: "Messages", href: "/dashboard/dealer/messages", icon: MessageSquare },
  { label: "Team", href: "/dashboard/dealer/team", icon: Users },
  { label: "Marketing", href: "/dashboard/dealer/marketing", icon: Megaphone },
  { label: "Payouts", href: "/dashboard/dealer/payouts", icon: DollarSign },
  { label: "Subscription", href: "/dashboard/dealer/subscription", icon: Layers },
  { label: "Verification", href: "/dashboard/dealer/verification", icon: UserCheck },
  { label: "Settings", href: "/dashboard/dealer/settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Listings", href: "/dashboard/admin/listings", icon: Package },
  { label: "Orders", href: "/dashboard/admin/orders", icon: ShoppingBag },
  { label: "Payments", href: "/dashboard/admin/payments", icon: DollarSign },
  { label: "Subscriptions", href: "/dashboard/admin/subscriptions", icon: Layers },
  { label: "Categories", href: "/dashboard/admin/categories", icon: Database },
  { label: "Brands", href: "/dashboard/admin/brands", icon: Tags },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { label: "Moderation", href: "/dashboard/admin/moderation", icon: AlertCircle },
  { label: "Advertising", href: "/dashboard/admin/advertising", icon: Megaphone },
  { label: "SEO", href: "/dashboard/admin/seo", icon: Globe },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  { label: "Audit Logs", href: "/dashboard/admin/audit", icon: FileText },
];

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  BUYER: BUYER_NAV,
  SELLER: SELLER_NAV,
  DEALER: DEALER_NAV,
  AGENCY: DEALER_NAV,
  MODERATOR: ADMIN_NAV,
  ADMIN: ADMIN_NAV,
  SUPER_ADMIN: ADMIN_NAV,
};

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_BY_ROLE[role] ?? BUYER_NAV;

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#030303] border-r border-crown-gold/8 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-crown-gold/8 shrink-0",
        collapsed ? "justify-center px-2" : "px-5 gap-3"
      )}>
        <div className="w-7 h-7 border border-crown-gold flex items-center justify-center
                        text-crown-gold text-sm shrink-0">
          ♛
        </div>
        {!collapsed && (
          <span className="font-serif text-sm font-semibold tracking-[0.2em] uppercase text-crown-ivory">
            Crown Registry
          </span>
        )}
      </div>

      {/* Quick action */}
      {!collapsed && (role === "SELLER" || role === "DEALER" || role === "AGENCY") && (
        <div className="px-4 py-3 border-b border-crown-gold/8">
          <Link href="/listings/new">
            <button className="w-full flex items-center justify-center gap-2 py-2.5
                               bg-gold-gradient text-white font-sans text-[9px]
                               tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
              <Plus className="w-3 h-3" />
              New Listing
            </button>
          </Link>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard/" + role && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "sidebar-item relative",
                active && "active",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-crown-gold" : "")} />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="w-5 h-5 rounded-full bg-crown-gold/20 text-crown-gold
                                 font-sans text-[8px] flex items-center justify-center ml-auto">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crown-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-crown-gold/8 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-crown-ash
                     hover:text-crown-gold hover:bg-crown-gold/5 transition-all rounded-sm"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </div>
    </aside>
  );
}
