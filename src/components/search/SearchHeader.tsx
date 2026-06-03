"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

// ── Search Header ──────────────────────────────

export function SearchHeader({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const [q, setQ] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(currentParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#030303] border-b border-crown-gold/10 py-8">
      <div className="container-luxury px-6 lg:px-10">
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-2">
          Search
        </p>
        <h1 className="font-serif text-3xl text-crown-ivory mb-6">
          {query ? `Results for "${query}"` : "Browse All Listings"}
        </h1>
        <form onSubmit={handleSearch} className="flex max-w-2xl">
          <div className="flex-1 flex items-center gap-3 border border-crown-gold/20 bg-crown-obsidian-light
                          px-4 focus-within:border-crown-gold/50 transition-colors">
            <Search className="w-4 h-4 text-crown-ash shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search luxury assets..."
              className="flex-1 bg-transparent border-none outline-none text-crown-ivory
                         font-sans text-sm py-3 placeholder:text-crown-ash/40"
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-gold-gradient text-white font-sans
                                           text-[10px] tracking-[0.2em] uppercase hover:opacity-90">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sort Dropdown ──────────────────────────────

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export function SortDropdown({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/50">
        Sort:
      </span>
      <select
        value={current}
        onChange={(e) => updateSort(e.target.value)}
        className="bg-crown-obsidian-light border border-crown-gold/20 text-crown-ash
                   font-sans text-xs px-3 py-2 outline-none focus:border-crown-gold/50
                   transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Pagination ─────────────────────────────────

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: any;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-crown-gold/15 text-crown-ash font-sans text-xs
                   hover:border-crown-gold/40 hover:text-crown-gold transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goTo(page)}
          className={`w-8 h-8 border font-sans text-xs transition-all ${
            page === currentPage
              ? "border-crown-gold bg-crown-gold/10 text-crown-gold"
              : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40 hover:text-crown-gold"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-crown-gold/15 text-crown-ash font-sans text-xs
                   hover:border-crown-gold/40 hover:text-crown-gold transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  );
}
