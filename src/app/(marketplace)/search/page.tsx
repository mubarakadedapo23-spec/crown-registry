import { Suspense } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchHeader } from "@/components/search/SearchHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Luxury Assets | Crown Registry",
};

interface Props {
  searchParams: {
    q?: string;
    category?: string;
    country?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    brand?: string;
    sort?: string;
    page?: string;
    verified?: string;
    minYear?: string;
    maxYear?: string;
    minBedrooms?: string;
  };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q ?? "";
  const page = Number(searchParams.page ?? 1);

  return (
    <div className="min-h-screen bg-crown-obsidian pt-16">
      <SearchHeader query={query} />

      <div className="container-luxury px-6 lg:px-10 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <SearchFilters searchParams={searchParams} />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<ResultsSkeleton />}>
              <SearchResults searchParams={searchParams} page={page} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[4/3] rounded-sm" />
      ))}
    </div>
  );
}
