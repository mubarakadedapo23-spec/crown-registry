import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (amount >= 1_000_000_000) {
    return formatter.format(amount / 1_000_000_000).replace(/\D+$/, "") + "B";
  }
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000;
    return formatter.format(Math.floor(v)).replace(/,\d{3}$/, "") + (Number.isInteger(v) ? "M" : `.${Math.round((v % 1) * 10)}M`);
  }
  return formatter.format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getCategorySlug(category: string): string {
  const map: Record<string, string> = {
    LUXURY_CARS: "cars",
    HYPERCARS: "cars/hypercars",
    CLASSIC_CARS: "cars/classic",
    MOTORCYCLES: "motorcycles",
    PRIVATE_JETS: "aviation/jets",
    HELICOPTERS: "aviation/helicopters",
    YACHTS: "yachts",
    SUPERYACHTS: "yachts/super",
    REAL_ESTATE: "real-estate",
    FASHION: "fashion",
    WATCHES: "watches",
    JEWELRY: "jewelry",
    FINE_ART: "art",
    COLLECTIBLES: "collectibles",
    SNEAKERS: "fashion/sneakers",
    ELECTRONICS: "electronics",
    EXPERIENCES: "experiences",
    TRAVEL: "travel",
  };
  return map[category] ?? category.toLowerCase().replace(/_/g, "-");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user[0]}${"*".repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "CR-" + Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CHF: "CHF", AED: "AED",
  JPY: "¥", HKD: "HK$", SGD: "S$", CAD: "C$", AUD: "A$",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export const CATEGORY_LABELS: Record<string, string> = {
  LUXURY_CARS: "Luxury Cars",
  HYPERCARS: "Hypercars",
  CLASSIC_CARS: "Classic Cars",
  MOTORCYCLES: "Motorcycles",
  PRIVATE_JETS: "Private Jets",
  HELICOPTERS: "Helicopters",
  YACHTS: "Yachts",
  SUPERYACHTS: "Superyachts",
  REAL_ESTATE: "Real Estate",
  FASHION: "Fashion",
  WATCHES: "Watches",
  JEWELRY: "Jewelry",
  FINE_ART: "Fine Art",
  COLLECTIBLES: "Collectibles",
  SNEAKERS: "Sneakers",
  ELECTRONICS: "Electronics",
  EXPERIENCES: "Experiences",
  TRAVEL: "Travel",
};
