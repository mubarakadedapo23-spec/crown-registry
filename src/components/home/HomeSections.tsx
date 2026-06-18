// ── StatsBar ──────────────────────────────────

export function StatsBar({ stats }: { stats: any }) {
  const items = [
    { value: `${stats.listings?.toLocaleString() ?? "140K"}+`, label: "Active Listings" },
    { value: "$2.4B+", label: "Annual GMV" },
    { value: `${stats.countries ?? 190}+`, label: "Countries" },
    { value: "98%", label: "Verified Sellers" },
  ];

  return (
    <section className="border-y border-crown-gold/10 bg-gradient-to-r from-[#0a0803] via-[#050505] to-[#080600]">
      <div className="container-luxury px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.label}
                 className={`py-8 text-center ${i < 3 ? "lg:border-r border-crown-gold/10" : ""}`}>
              <p className="font-serif text-3xl lg:text-4xl text-gold-shimmer mb-1">{item.value}</p>
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-crown-ash/60">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CategoryGrid ──────────────────────────────

const CATEGORIES = [
  { value: "LUXURY_CARS", label: "Luxury Cars", icon: "🏎", slug: "cars", count: "12,847" },
  { value: "PRIVATE_JETS", label: "Private Jets", icon: "✈", slug: "aviation", count: "2,341" },
  { value: "YACHTS", label: "Yachts", icon: "⛵", slug: "yachts", count: "4,209" },
  { value: "REAL_ESTATE", label: "Real Estate", icon: "🏛", slug: "real-estate", count: "31,502" },
  { value: "WATCHES", label: "Watches", icon: "⌚", slug: "watches", count: "18,903" },
  { value: "FASHION", label: "Fashion", icon: "👗", slug: "fashion", count: "54,211" },
  { value: "FINE_ART", label: "Fine Art", icon: "🖼", slug: "art", count: "7,842" },
  { value: "JEWELRY", label: "Jewelry", icon: "💎", slug: "jewelry", count: "23,601" },
];

export function CategoryGrid() {
  return (
    <section className="section-pad bg-crown-obsidian">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-crown-gold mb-3">
            Explore Categories
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-crown-ivory">
            Every Luxury Asset,<br />
            <em className="text-gold-shimmer">One Marketplace</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-crown-gold/8">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={`/marketplace/${cat.slug}`}
              className="cat-card bg-crown-obsidian-mid p-8 flex flex-col gap-3
                         border border-crown-gold/8 hover:border-crown-gold/40
                         hover:bg-crown-gold/[0.03] transition-all duration-300 group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <p className="font-serif text-crown-ivory text-lg group-hover:text-crown-gold
                               transition-colors duration-200">
                  {cat.label}
                </p>
                <p className="font-sans text-[10px] text-crown-ash/60 mt-1">
                  {cat.count} listings
                </p>
              </div>
              <span className="text-crown-ash/30 group-hover:text-crown-gold
                               transition-colors text-sm self-start mt-auto">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── LuxuryCollections ─────────────────────────

const COLLECTIONS = [
  {
    title: "Hypercar Collection",
    subtitle: "Beyond 300mph",
    bg: "from-[#1a0500] to-[#050505]",
    href: "/marketplace/cars/hypercars",
    count: "127 assets",
  },
  {
    title: "Superyacht Season",
    subtitle: "Mediterranean & Caribbean",
    bg: "from-[#00081a] to-[#050505]",
    href: "/marketplace/yachts",
    count: "89 vessels",
  },
  {
    title: "Watches of Distinction",
    subtitle: "Patek · Richard Mille · AP",
    bg: "from-[#0d0d0d] to-[#050505]",
    href: "/marketplace/watches",
    count: "2,400+ pieces",
  },
];

export function LuxuryCollections() {
  return (
    <section className="section-pad bg-[#030303]">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-crown-gold mb-3">
            Curated Collections
          </p>
          <h2 className="font-serif text-4xl font-light text-crown-ivory">
            Featured Collections
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {COLLECTIONS.map((col) => (
            <a key={col.title} href={col.href}
               className={`relative p-10 bg-gradient-to-br ${col.bg}
                           border border-crown-gold/10 hover:border-crown-gold/40
                           transition-all duration-300 group overflow-hidden min-h-[240px]
                           flex flex-col justify-end`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                   style={{ background: "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.04), transparent 70%)" }} />
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-crown-gold/70 mb-2">
                {col.subtitle}
              </p>
              <h3 className="font-serif text-2xl text-crown-ivory mb-1">{col.title}</h3>
              <p className="font-sans text-[9px] text-crown-ash/50 tracking-widest uppercase">
                {col.count}
              </p>
              <span className="absolute top-6 right-6 text-crown-ash/20 group-hover:text-crown-gold
                               text-2xl transition-all duration-300 group-hover:translate-x-1">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TrustSection ──────────────────────────────

export function TrustSection() {
  return (
    <section className="section-pad">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-crown-gold mb-3">
            Why Crown Registry
          </p>
          <h2 className="font-serif text-4xl font-light text-crown-ivory">
            Built for the World's Most<br />
            <em>Discerning</em> Buyers
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              icon: "✦",
              title: "White-Glove Verification",
              body: "Every seller, dealer, and listing undergoes rigorous KYC verification. Physical inspections, title checks, and authentication certificates for all major categories.",
            },
            {
              num: "02",
              icon: "◈",
              title: "Escrow Protection",
              body: "All transactions are secured through our FCA-regulated escrow system. Funds are only released upon confirmed delivery and buyer satisfaction.",
            },
            {
              num: "03",
              icon: "◆",
              title: "Global Concierge",
              body: "Our dedicated team of luxury asset specialists are available 24/7 to facilitate viewings, inspections, transport, and bespoke arrangements worldwide.",
            },
          ].map((item) => (
            <div key={item.num}
                 className="p-10 border border-crown-gold/12 bg-crown-gold/[0.015]
                            hover:border-crown-gold/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-6 right-8 font-serif text-7xl font-light
                              text-crown-gold/4 leading-none select-none">
                {item.num}
              </div>
              <p className="text-crown-gold text-2xl mb-5">{item.icon}</p>
              <h3 className="font-serif text-xl text-crown-ivory mb-3 leading-snug">{item.title}</h3>
              <p className="font-sans text-sm text-crown-ash leading-[1.8]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TopDealers ────────────────────────────────

export function TopDealers({ dealers }: { dealers: any[] }) {
  if (dealers.length === 0) return null;
  return (
    <section className="section-pad bg-[#030303]">
      <div className="container-luxury">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-crown-gold mb-2">
              Trusted Partners
            </p>
            <h2 className="font-serif text-4xl font-light text-crown-ivory">
              Premier Dealers & Agencies
            </h2>
          </div>
          <a href="/dealers"
             className="hidden md:block font-sans text-[9px] tracking-widest uppercase
                        text-crown-gold border border-crown-gold/30 px-5 py-2.5
                        hover:border-crown-gold/60 transition-colors">
            All Dealers
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dealers.map((dealer) => (
            <a key={dealer.id}
               href={`/dealers/${dealer.userId}`}
               className="luxury-card p-5 text-center group">
              <div className="w-12 h-12 bg-crown-gold/10 flex items-center justify-center
                              mx-auto mb-3 border border-crown-gold/20 group-hover:border-crown-gold/50
                              transition-colors text-crown-gold font-serif text-xl">
                {dealer.dealerName[0]}
              </div>
              <p className="font-serif text-crown-ivory text-sm leading-snug line-clamp-2">
                {dealer.dealerName}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-crown-gold text-xs">★</span>
                <span className="font-sans text-[9px] text-crown-ash">{dealer.rating.toFixed(1)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CtaBand ───────────────────────────────────

export function CtaBand() {
  return (
    <section className="px-6 md:px-10 py-10">
      <div className="container-luxury">
        <div className="border border-crown-gold/20 bg-gradient-to-br from-[#0d0900] to-[#050505]
                        p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.05), transparent 65%)" }} />
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-crown-gold mb-4 relative z-10">
            Start Today · Free Account
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-crown-ivory mb-4 relative z-10">
            List Your Asset.<br />
            <em className="text-gold-shimmer">Reach the World.</em>
          </h2>
          <p className="font-sans text-crown-ash text-sm max-w-md mx-auto mb-10 relative z-10 leading-relaxed">
            Join Crown Registry today and be among the first to list with us.
          </p>
          <div className="flex gap-4 justify-center relative z-10">
            <a href="/auth/register">
              <button className="px-10 py-4 bg-gold-gradient text-white font-sans text-[10px]
                                 tracking-[0.25em] uppercase hover:opacity-90 transition-opacity">
                Create Free Account
              </button>
            </a>
            <a href="/pricing">
              <button className="px-10 py-4 border border-crown-gold/35 text-crown-gold font-sans
                                 text-[10px] tracking-[0.25em] uppercase hover:border-crown-gold/70
                                 transition-colors">
                View Pricing
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
