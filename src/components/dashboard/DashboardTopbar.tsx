"use client";

import { Bell, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function DashboardTopbar({ user }: { user: any }) {
  return (
    <header className="h-16 bg-[#030303] border-b border-crown-gold/8 flex items-center
                       justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="flex items-center gap-2 flex-1 border border-crown-gold/10
                        bg-crown-obsidian-light px-3 py-2 focus-within:border-crown-gold/40
                        transition-colors">
          <Search className="w-3.5 h-3.5 text-crown-ash" />
          <input
            placeholder="Search marketplace..."
            className="bg-transparent border-none outline-none text-crown-ivory
                       font-sans text-xs placeholder:text-crown-ash flex-1"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/buyer/notifications"
              className="relative w-8 h-8 flex items-center justify-center
                         text-crown-ash hover:text-crown-gold transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-crown-gold rounded-full" />
        </Link>

        <div className="flex items-center gap-2.5">
          {user?.image ? (
            <Image src={user.image} alt={user.name ?? ""} width={28} height={28}
                   className="rounded-full" />
          ) : (
            <div className="w-7 h-7 bg-crown-gold/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-crown-gold" />
            </div>
          )}
          <div className="hidden sm:block">
            <p className="font-sans text-[10px] text-crown-ivory truncate max-w-[120px]">
              {user?.name ?? "User"}
            </p>
            <p className="font-sans text-[8px] tracking-widest uppercase text-crown-ash/60">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
