"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, DollarSign } from "lucide-react";

const SEARCH_TABS = ["All Assets", "Cars", "Jets", "Yachts", "Real Estate", "Watches", "Fashion", "Art"];

const HERO_TAGLINES = [
  "Where Extraordinary Assets Find Worthy Owners",
  "The World's Finest Luxury Marketplace",
  "Discover Assets Beyond Compare",
];

const TRENDING = [
  "Bugatti Chiron", "Gulfstream G700", "Monaco Penthouse",
  "Patek Philippe Ref. 5711", "Lurssen 85m", "Ferrari LaFerrari",
];

export function HeroSection() {
  const router = useRouter();
  const [tab, setTab] = useState("All Assets");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((i) => (i + 1) % HERO_TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => setParallax(window.scrollY * 0.25);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tab !== "All Assets") params.set("category", tab.toLowerCase());
    if (country) params.set("country", country);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center
                        overflow-hidden px-6 pt-24 pb-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 hero-grid bg-[length:80px_80px]"
        style={{ transform: `translateY(${parallax}px)` }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[700px] h-[700px] rounded-full
                      bg-radial-gradient pointer-events-none opacity-60"
           style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)" }}
      />

      {/* Corner ornaments */}
      {[
        "top-20 left-6 border-t border-l",
        "top-20 right-6 border-t border-r",
        "bottom-16 left-6 border-b border-l",
        "bottom-16 right-6 border-b border-r",
      ].map((cls) => (
        <div key={cls} className={`absolute ${cls} border-crown-gold/25 w-10 h-10`} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Pre-headline */}
        <div className="flex items-center gap-3 mb-7 animate-fade-up">
          <span className="w-10 h-px bg-crown-gold/50" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-crown-gold">
            Est. 2024 · The World's Finest Marketplace
          </span>
          <span className="w-10 h-px bg-crown-gold/50" />
        </div>

        {/* Main headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light
                       leading-[1.05] mb-6 text-crown-ivory animate-fade-up"
            style={{ animationDelay: "0.1s" }}>
          Where Extraordinary
          <br />
          <em className="text-gold-shimmer font-normal">Assets</em> Find
          <br />
          Worthy Owners
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-crown-ash text-base leading-relaxed max-w-xl mb-10
                      font-light tracking-wide animate-fade-up"
           style={{ animationDelay: "0.2s" }}>
          The global platform for ultra-luxury assets — from hypercars to superyachts,
          private jets to palatial estates, haute couture to horological masterpieces.
        </p>

        {/* Search box */}
        <div className="w-full max-w-3xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="glass-card overflow-hidden shadow-gold">
            {/* Tabs */}
            <div className="flex border-b border-crown-gold/10 overflow-x-auto no-scrollbar">
              {SEARCH_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3.5 font-sans text-[9px] tracking-[0.2em] uppercase
                               whitespace-nowrap shrink-0 transition-all duration-200 border-b-2
                               ${tab === t
                                 ? "text-crown-gold border-crown-gold"
                                 : "text-crown-ash border-transparent hover:text-crown-ivory"
                               }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-center">
              <div className="flex-1 flex items-center gap-3 px-5 border-r border-crown-gold/10">
                <Search className="w-4 h-4 text-crown-ash shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search luxury assets worldwide..."
                  className="flex-1 bg-transparent border-none outline-none text-crown-ivory
                             font-serif text-lg py-5 placeholder:text-crown-ash/50"
                />
              </div>
              <div className="flex items-center gap-3 px-5 border-r border-crown-gold/10">
                <MapPin className="w-4 h-4 text-crown-ash shrink-0" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-transparent border-none outline-none text-crown-ash
                             font-sans text-[10px] tracking-widest uppercase py-5 cursor-pointer
                             min-w-[100px]"
                >
                  <option value="">Any Country</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AE">UAE</option>
                  <option value="CH">Switzerland</option>
                  <option value="MC">Monaco</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="DE">Germany</option>
                  <option value="SG">Singapore</option>
                  <option value="HK">Hong Kong</option>
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-5 bg-gold-gradient text-white font-sans text-[10px]
                           tracking-[0.2em] uppercase hover:opacity-90 transition-opacity
                           whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Trending pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6 animate-fade-up"
             style={{ animationDelay: "0.4s" }}>
          <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60 self-center">
            Trending:
          </span>
          {TRENDING.map((term) => (
            <button
              key={term}
              onClick={() => { setQuery(term); handleSearch(); }}
              className="px-3 py-1.5 border border-crown-gold/15 text-crown-ash font-sans
                         text-[9px] tracking-widest uppercase hover:border-crown-gold/50
                         hover:text-crown-gold transition-all duration-200"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                      items-center gap-2 animate-fade-in opacity-0"
           style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}>
        <div className="w-px h-10 bg-gradient-to-b from-crown-gold to-transparent" />
        <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-crown-ash/50">
          Scroll
        </span>
      </div>
    </section>
  );
}
