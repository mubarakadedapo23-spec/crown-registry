import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL!,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME!,
    password: process.env.ELASTICSEARCH_PASSWORD!,
  },
});

const INDEX = `${process.env.ELASTICSEARCH_INDEX_PREFIX ?? "crown_"}listings`;

// ── Index mapping ──────────────────────────────

export async function ensureIndex() {
  const exists = await esClient.indices.exists({ index: INDEX });
  if (exists) return;

  await esClient.indices.create({
    index: INDEX,
    settings: {
      number_of_shards: 3,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          luxury_analyzer: {
            type: "custom",
            tokenizer: "standard",
            filter: ["lowercase", "asciifolding", "stop"],
          },
        },
      },
    },
    mappings: {
      properties: {
        id: { type: "keyword" },
        title: { type: "text", analyzer: "luxury_analyzer", boost: 3 },
        description: { type: "text", analyzer: "luxury_analyzer" },
        shortDescription: { type: "text", analyzer: "luxury_analyzer", boost: 2 },
        category: { type: "keyword" },
        brand: { type: "keyword", fields: { text: { type: "text" } } },
        model: { type: "keyword", fields: { text: { type: "text" } } },
        condition: { type: "keyword" },
        price: { type: "double" },
        currency: { type: "keyword" },
        country: { type: "keyword" },
        city: { type: "keyword" },
        region: { type: "keyword" },
        location: { type: "geo_point" },
        isFeatured: { type: "boolean" },
        isPremium: { type: "boolean" },
        isVerified: { type: "boolean" },
        viewCount: { type: "integer" },
        wishlistCount: { type: "integer" },
        tags: { type: "keyword" },
        sellerVerified: { type: "boolean" },
        status: { type: "keyword" },
        createdAt: { type: "date" },
        publishedAt: { type: "date" },
        // Category-specific fields
        year: { type: "integer" },
        mileage: { type: "integer" },
        horsepower: { type: "integer" },
        bedrooms: { type: "integer" },
        bathrooms: { type: "float" },
        floorArea: { type: "float" },
        lengthM: { type: "float" },
      },
    },
  });
}

// ── Indexing ───────────────────────────────────

export async function indexListing(listing: any) {
  const specs = listing.vehicleSpecs || listing.realEstateSpecs ||
                listing.aircraftSpecs || listing.watercraftSpecs ||
                listing.watchSpecs || listing.fashionSpecs || {};

  await esClient.index({
    index: INDEX,
    id: listing.id,
    document: {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      shortDescription: listing.shortDescription,
      category: listing.category,
      brand: listing.brand?.name,
      model: listing.model?.name,
      condition: listing.condition,
      price: Number(listing.price),
      currency: listing.currency,
      country: listing.country,
      city: listing.city,
      region: listing.region,
      ...(listing.latitude && listing.longitude
        ? { location: { lat: listing.latitude, lon: listing.longitude } }
        : {}),
      isFeatured: listing.isFeatured,
      isPremium: listing.isPremium,
      isVerified: listing.isVerified,
      viewCount: listing.viewCount,
      wishlistCount: listing.wishlistCount,
      tags: listing.tags?.map((t: any) => t.tag) ?? [],
      sellerVerified: listing.seller?.verificationStatus === "VERIFIED",
      status: listing.status,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
      // Flatten common specs
      year: specs.year,
      mileage: specs.mileage,
      horsepower: specs.horsepower,
      bedrooms: specs.bedrooms,
      bathrooms: specs.bathrooms,
      floorArea: specs.floorArea,
      lengthM: specs.lengthM,
    },
  });
}

export async function removeListing(listingId: string) {
  await esClient.delete({ index: INDEX, id: listingId }).catch(() => null);
}

// ── Search ─────────────────────────────────────

export interface SearchParams {
  query?: string;
  category?: string;
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  verified?: boolean;
  featured?: boolean;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "popular";
  lat?: number;
  lon?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
  // Category-specific filters
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  minBedrooms?: number;
  minBathrooms?: number;
}

export async function searchListings(params: SearchParams) {
  const {
    query,
    category,
    country,
    city,
    minPrice,
    maxPrice,
    condition,
    brand,
    verified,
    featured,
    sortBy = "relevance",
    lat,
    lon,
    radiusKm = 50,
    page = 1,
    limit = 24,
    minYear,
    maxYear,
    minBedrooms,
    minBathrooms,
  } = params;

  const must: any[] = [{ term: { status: "ACTIVE" } }];
  const filter: any[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ["title^3", "shortDescription^2", "description", "brand^2", "model^2", "tags^2"],
        type: "best_fields",
        fuzziness: "AUTO",
        operator: "or",
      },
    });
  }

  if (category) filter.push({ term: { category } });
  if (country) filter.push({ term: { country } });
  if (city) filter.push({ term: { city } });
  if (condition) filter.push({ term: { condition } });
  if (brand) filter.push({ term: { brand } });
  if (verified) filter.push({ term: { sellerVerified: true } });
  if (featured) filter.push({ term: { isFeatured: true } });

  if (minPrice || maxPrice) {
    filter.push({ range: { price: { gte: minPrice, lte: maxPrice } } });
  }
  if (minYear || maxYear) {
    filter.push({ range: { year: { gte: minYear, lte: maxYear } } });
  }
  if (minBedrooms) filter.push({ range: { bedrooms: { gte: minBedrooms } } });
  if (minBathrooms) filter.push({ range: { bathrooms: { gte: minBathrooms } } });

  // Geo distance
  if (lat && lon) {
    filter.push({
      geo_distance: {
        distance: `${radiusKm}km`,
        location: { lat, lon },
      },
    });
  }

  const sortOptions: Record<string, any> = {
    relevance: [{ isFeatured: "desc" }, { isPremium: "desc" }, "_score"],
    price_asc: [{ isFeatured: "desc" }, { price: "asc" }],
    price_desc: [{ isFeatured: "desc" }, { price: "desc" }],
    newest: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    popular: [{ isFeatured: "desc" }, { viewCount: "desc" }],
  };

  const response = await esClient.search({
    index: INDEX,
    from: (page - 1) * limit,
    size: limit,
    query: { bool: { must, filter } },
    sort: sortOptions[sortBy],
    highlight: {
      fields: {
        title: {},
        shortDescription: {},
      },
      pre_tags: ["<mark>"],
      post_tags: ["</mark>"],
    },
    aggs: {
      by_category: { terms: { field: "category", size: 20 } },
      by_country: { terms: { field: "country", size: 30 } },
      by_brand: { terms: { field: "brand", size: 20 } },
      price_range: {
        stats: { field: "price" },
      },
    },
  });

  return {
    hits: response.hits.hits.map((h: any) => ({
      ...(h._source as any),
      _score: h._score,
      _highlight: h.highlight,
    })),
    total: (response.hits.total as any).value,
    pages: Math.ceil((response.hits.total as any).value / limit),
    aggregations: response.aggregations,
  };
}

export async function getSearchSuggestions(query: string, limit = 8) {
  if (!query || query.length < 2) return [];

  const response = await esClient.search({
    index: INDEX,
    size: limit,
    query: {
      bool: {
        must: [
          { term: { status: "ACTIVE" } },
          {
            multi_match: {
              query,
              fields: ["title^3", "brand^2", "model^2"],
              type: "bool_prefix",
            },
          },
        ],
      },
    },
    _source: ["id", "title", "category", "price", "currency", "country"],
  });

  return response.hits.hits.map((h: any) => h._source);
}
