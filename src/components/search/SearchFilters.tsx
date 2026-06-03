"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";

const CATEGORIES = [
  { value: "LUXURY_CARS", label: "Luxury Cars" },
  { value: "HYPERCARS", label: "Hypercars" },
  { value: "CLASSIC_CARS", label: "Classic Cars" },
  { value: "MOTORCYCLES", label: "Motorcycles" },
  { value: "PRIVATE_JETS", label: "Private Jets" },
  { value: "HELICOPTERS", label: "Helicopters" },
  { value: "YACHTS", label: "Yachts" },
  { value: "SUPERYACHTS", label: "Superyachts" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "WATCHES", label: "Watches" },
  { value: "JEWELRY", label: "Jewelry" },
  { value: "FASHION", label: "Fashion" },
  { value: "FINE_ART", label: "Fine Art" },
  { value: "COLLECTIBLES", label: "Collectibles" },
];

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "VERY_GOOD", label: "Very Good" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const PRICE_RANGES = [
  { label: "Under $100K", min: undefined, max: 100000 },
  { label: "$100K – $500K", min: 100000, max: 500000 },
  { label: "$500K – $1M", min: 500000, max: 1000000 },
  { label: "$1M – $5M", min: 1000000, max: 5000000 },
  { label: "$5M – $25M", min: 5000000, max: 25000000 },
  { label: "$25M+", min: 25000000, max: undefined },
];

export function SearchFilters({ searchParams }: { searchParams: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(currentParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, currentParams]
  );

  const clearAll = () => {
    const params = new URLSearchParams();
    if (currentParams.get("q")) params.set("q", currentParams.get("q")!);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = !!(
    searchParams.category || searchParams.country || searchParams.condition ||
    searchParams.minPrice || searchParams.maxPrice || searchParams.verified
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 font-sans text-[9px] tracking-widest uppercase
                       text-crown-ash/60 hover:text-crown-gold transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Verified only */}
      <div className="flex items-center gap-2 cursor-pointer"
           onClick={() => updateFilter("verified", searchParams.verified ? undefined : "true")}>
        <div className={`w-4 h-4 border transition-all flex items-center justify-center
                        ${searchParams.verified === "true"
                          ? "border-crown-gold bg-crown-gold"
                          : "border-crown-gold/30"}`}>
          {searchParams.verified === "true" && <span className="text-black text-[8px] font-bold">✓</span>}
        </div>
        <span className="font-sans text-[10px] tracking-widest uppercase text-crown-ash">
          Verified Sellers Only
        </span>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        {CATEGORIES.map((cat) => (
          <FilterOption
            key={cat.value}
            label={cat.label}
            active={searchParams.category === cat.value}
            onClick={() => updateFilter("category", searchParams.category === cat.value ? undefined : cat.value)}
          />
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        {PRICE_RANGES.map((range) => {
          const active = String(searchParams.minPrice ?? "") === String(range.min ?? "") &&
                         String(searchParams.maxPrice ?? "") === String(range.max ?? "");
          return (
            <FilterOption
              key={range.label}
              label={range.label}
              active={active}
              onClick={() => {
                if (active) {
                  updateFilter("minPrice", undefined);
                  updateFilter("maxPrice", undefined);
                } else {
                  const p = new URLSearchParams(currentParams.toString());
                  if (range.min) p.set("minPrice", String(range.min));
                  else p.delete("minPrice");
                  if (range.max) p.set("maxPrice", String(range.max));
                  else p.delete("maxPrice");
                  p.delete("page");
                  router.push(`${pathname}?${p.toString()}`);
                }
              }}
            />
          );
        })}
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        {CONDITIONS.map((cond) => (
          <FilterOption
            key={cond.value}
            label={cond.label}
            active={searchParams.condition === cond.value}
            onClick={() => updateFilter("condition", searchParams.condition === cond.value ? undefined : cond.value)}
          />
        ))}
      </FilterSection>

      {/* Country */}
      <FilterSection title="Location">
        <input
          defaultValue={searchParams.country ?? ""}
          onBlur={(e) => updateFilter("country", e.target.value || undefined)}
          placeholder="Country..."
          className="crown-input text-xs py-2"
        />
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash/60 mb-3">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterOption({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 font-sans text-[10px] tracking-widest uppercase
                  transition-all border ${
        active
          ? "border-crown-gold/40 bg-crown-gold/8 text-crown-gold"
          : "border-transparent text-crown-ash hover:text-crown-ivory hover:border-crown-gold/15"
      }`}
    >
      {label}
    </button>
  );
}
