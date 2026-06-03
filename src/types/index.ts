import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      emailVerified: Date | null;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    emailVerified: Date | null;
    twoFactorEnabled: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    emailVerified: Date | null;
    twoFactorEnabled: boolean;
  }
}

// Listing types
export type ListingWithDetails = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  category: string;
  status: string;
  condition?: string | null;
  price: number;
  currency: string;
  priceNegotiable: boolean;
  priceOnRequest: boolean;
  country?: string | null;
  city?: string | null;
  isFeatured: boolean;
  isPremium: boolean;
  isVerified: boolean;
  viewCount: number;
  wishlistCount: number;
  createdAt: Date;
  images: { url: string; alt?: string | null }[];
  seller: {
    id: string;
    name: string | null;
    avatar: string | null;
    verificationStatus: string;
  };
  brand?: { name: string; logoUrl?: string | null } | null;
};

export type SearchFilters = {
  query?: string;
  category?: string;
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  verified?: boolean;
  sortBy?: "relevance" | "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };
