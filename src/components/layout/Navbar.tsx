"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Search, Bell, Heart, Menu, X, ChevronDown, User,
  LayoutDashboard, Settings, LogOut, Shield, Plus,
} from "lucide-react";
import Image from "next/image";

const NAV_CATEGORIES = [
  { label: "Cars", href: "/marketplace/cars", sub: ["Luxury Cars", "Hypercars", "Classic Cars", "Motorcycles"] },
  { label: "Aviation", href: "/marketplace/aviation", sub: ["Private Jets", "Helicopters"] },
  { label: "Yachts", href: "/marketplace/yachts", sub: ["Superyachts", "Motor Yachts", "Sailing Yachts"] },
  { label: "Real Estate", href: "/marketplace/real-estate", sub: ["Villas", "Penthouses", "Estates", "Commercial"] },
  { label: "Watches", href: "/marketplace/watches", sub: ["Rolex", "Patek Philippe", "Audemars Piguet", "Richard Mille"] },
  { label: "Fashion", href: "/marketplace/fashion", sub: ["Bags", "Clothing", "Jewelry", "Sneakers"] },
  { label: "Art", href: "/marketplace/art", sub: ["Fine Art", "Collectibles", "Rare Assets"] },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isTransparent = pathname === "/" && !scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const dashboardPath = {
    ADMIN: "/dashboard/admin",
    SUPER_ADMIN: "/dashboard/admin",
    SELLER: "/dashboard/seller",
    DEALER: "/dashboard/dealer",
    AGENCY: "/dashboard/dealer",
    BUYER: "/dashboard/buyer",
  }[(session?.user as any)?.role] ?? "/dashboard/buyer";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-crown-obsidian/96 backdrop-blur-xl border-b border-crown-gold/10"
        }`}
      >
        <div className="container-luxury flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 border border-crown-gold flex items-center justify-center text-crown-gold text-sm">
              ♛
            </div>
            <span className="font-serif text-lg font-semibold tracking-[0.25em] uppercase text-crown-ivory">
              Crown Registry
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={cat.href}
                  className="flex items-center gap-1 px-3 py-2 text-crown-ash hover:text-crown-ivory
                             font-sans text-[10px] tracking-[0.15em] uppercase transition-colors duration-200"
                >
                  {cat.label}
                  <ChevronDown className="w-3 h-3" />
                </Link>

                {activeDropdown === cat.label && (
                  <div className="absolute top-full left-0 pt-1 min-w-[180px]">
                    <div className="glass-card py-2">
                      {cat.sub.map((s) => (
                        <Link
                          key={s}
                          href={`${cat.href}/${s.toLowerCase().replace(/ /g, "-")}`}
                          className="block px-4 py-2 text-crown-ash hover:text-crown-gold
                                     font-sans text-[10px] tracking-widest uppercase
                                     transition-colors duration-150"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden sm:flex w-8 h-8 items-center justify-center text-crown-ash
                         hover:text-crown-gold transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard/buyer/wishlist"
                  className="hidden sm:flex w-8 h-8 items-center justify-center text-crown-ash
                             hover:text-crown-gold transition-colors relative"
                >
                  <Heart className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/buyer/notifications"
                  className="hidden sm:flex w-8 h-8 items-center justify-center text-crown-ash
                             hover:text-crown-gold transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-crown-gold rounded-full" />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-crown-gold/20
                               hover:border-crown-gold/50 transition-all duration-200"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-crown-gold/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-crown-gold" />
                      </div>
                    )}
                    <span className="hidden sm:block font-sans text-[10px] tracking-widest uppercase
                                     text-crown-ash max-w-[100px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-crown-ash" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 glass-card py-2 z-50">
                      <div className="px-4 py-2 border-b border-crown-gold/10 mb-1">
                        <p className="text-crown-ivory font-sans text-xs truncate">{session.user?.email}</p>
                        <p className="text-crown-gold font-sans text-[10px] tracking-widest uppercase mt-0.5">
                          {(session.user as any)?.role?.replace("_", " ")}
                        </p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: "Dashboard", href: dashboardPath },
                        { icon: User, label: "Profile", href: "/profile" },
                        { icon: Settings, label: "Settings", href: "/settings" },
                        ...(["ADMIN", "SUPER_ADMIN"].includes((session.user as any)?.role)
                          ? [{ icon: Shield, label: "Admin Panel", href: "/dashboard/admin" }]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-crown-ash
                                     hover:text-crown-ivory hover:bg-crown-gold/5
                                     font-sans text-[10px] tracking-widest uppercase transition-colors"
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-crown-gold/10 mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-crown-ash
                                     hover:text-red-400 hover:bg-red-900/10
                                     font-sans text-[10px] tracking-widest uppercase transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/listings/new" className="hidden sm:block">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gold-gradient
                                     text-white font-sans text-[10px] tracking-[0.15em] uppercase
                                     hover:opacity-90 transition-opacity">
                    <Plus className="w-3 h-3" />
                    List Asset
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="font-sans text-[10px] tracking-[0.15em] uppercase text-crown-ash
                             hover:text-crown-ivory transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <button className="px-4 py-2 bg-gold-gradient text-white font-sans
                                     text-[10px] tracking-[0.15em] uppercase hover:opacity-90 transition-opacity">
                    Join Free
                  </button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-crown-ash
                         hover:text-crown-ivory transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-crown-obsidian border-t border-crown-gold/10 py-4">
            <div className="container-luxury px-6 flex flex-col gap-1">
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="py-3 font-sans text-[10px] tracking-widest uppercase
                             text-crown-ash hover:text-crown-gold border-b border-crown-gold/5
                             transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {session ? (
                  <Link href="/listings/new">
                    <button className="w-full py-3 bg-gold-gradient text-white font-sans
                                       text-[10px] tracking-[0.15em] uppercase">
                      List Asset
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <button className="w-full py-3 border border-crown-gold/30 text-crown-gold
                                         font-sans text-[10px] tracking-[0.15em] uppercase">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth/register">
                      <button className="w-full py-3 bg-gold-gradient text-white font-sans
                                         text-[10px] tracking-[0.15em] uppercase">
                        Create Account
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdown */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}
