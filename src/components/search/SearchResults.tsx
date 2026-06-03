import { getListings } from "@/lib/actions/listings";
import { ListingCard } from "@/components/home/FeaturedListings";
import { SortDropdown } from "@/components/search/SortDropdown";
import { Pagination } from "@/components/search/Pagination";
import { SearchIcon } from "lucide-react";

export async function SearchResults({
  searchParams,
  page,
}: {
  searchParams: any;
  page: number;
}) {
  const result = await getListings({
    category: searchParams.category,
    country: searchParams.country,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    condition: searchParams.condition,
    brand: searchParams.brand,
    query: searchParams.q,
    sortBy: searchParams.sort ?? "newest",
    page,
    limit: 24,
  });

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-serif text-crown-ivory text-xl">
            {result.total.toLocaleString()} result{result.total !== 1 ? "s" : ""}
          </p>
          {searchParams.q && (
            <p className="font-sans text-crown-ash text-xs mt-0.5">
              for "{searchParams.q}"
            </p>
          )}
        </div>
        <SortDropdown current={searchParams.sort ?? "newest"} />
      </div>

      {result.listings.length === 0 ? (
        <div className="py-24 text-center">
          <SearchIcon className="w-10 h-10 text-crown-ash/20 mx-auto mb-4" />
          <p className="font-serif text-crown-ash text-2xl mb-2">No listings found</p>
          <p className="font-sans text-crown-ash/50 text-sm">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {result.listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>

          <div className="mt-10">
            <Pagination currentPage={page} totalPages={result.pages} searchParams={searchParams} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Sort dropdown ──────────────────────────────
// (SearchHeader, SortDropdown, Pagination also here for brevity)
