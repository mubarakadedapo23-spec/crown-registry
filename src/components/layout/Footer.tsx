import Link from "next/link";

const FOOTER_LINKS = {
  Marketplace: [
    { label: "Luxury Cars", href: "/marketplace/cars" },
    { label: "Private Jets", href: "/marketplace/aviation" },
    { label: "Superyachts", href: "/marketplace/yachts" },
    { label: "Real Estate", href: "/marketplace/real-estate" },
    { label: "Watches", href: "/marketplace/watches" },
    { label: "Fine Art", href: "/marketplace/art" },
    { label: "Fashion", href: "/marketplace/fashion" },
  ],
  Sellers: [
    { label: "List an Asset", href: "/listings/new" },
    { label: "Pricing Plans", href: "/pricing" },
    { label: "Dealer Program", href: "/dealers" },
    { label: "Verification", href: "/verify" },
    { label: "Seller Analytics", href: "/dashboard/seller/analytics" },
    { label: "API Access", href: "/developers" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Trust & Safety", href: "/trust" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "Escrow Terms", href: "/legal/escrow" },
    { label: "AML Policy", href: "/legal/aml" },
  ],
};

const SOCIAL_LINKS = [
  { label: "X (Twitter)", href: "https://x.com/crownregistry", icon: "𝕏" },
  { label: "LinkedIn", href: "https://linkedin.com/company/crownregistry", icon: "in" },
  { label: "Instagram", href: "https://instagram.com/crownregistry", icon: "◎" },
];

export function Footer() {
  return (
    <footer className="border-t border-crown-gold/10 bg-[#030303]">
      <div className="container-luxury px-6 lg:px-10 pt-16 pb-8">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-6 border border-crown-gold flex items-center justify-center
                              text-crown-gold text-xs">♛</div>
              <span className="font-serif text-base font-semibold tracking-[0.25em] uppercase text-crown-ivory">
                Crown Registry
              </span>
            </Link>
            <p className="text-crown-ash text-sm leading-relaxed max-w-[240px] mb-6">
              The world's most trusted marketplace for ultra-luxury assets. Serving discerning
              buyers and sellers across 190 countries.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 border border-crown-gold/20 flex items-center justify-center
                             text-crown-ash text-xs hover:text-crown-gold hover:border-crown-gold/50
                             transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-sans text-[9px] tracking-[0.25em] uppercase text-crown-gold mb-5">
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs text-crown-ash hover:text-crown-gold
                                 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border border-crown-gold/10 p-8 mb-10 bg-crown-gold/[0.02]
                        flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-crown-gold mb-1">
              Market Intelligence
            </p>
            <p className="font-serif text-xl text-crown-ivory">
              The Crown Registry Report
            </p>
            <p className="text-crown-ash text-xs mt-1">
              Weekly curation of exceptional listings, market insights, and private sales.
            </p>
          </div>
          <div className="flex gap-0 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="crown-input w-full md:w-64"
            />
            <button className="px-6 py-3 bg-gold-gradient text-white font-sans text-[10px]
                               tracking-[0.15em] uppercase whitespace-nowrap hover:opacity-90
                               transition-opacity shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-crown-gold/8 pt-6 flex flex-col md:flex-row
                        items-center justify-between gap-4">
          <p className="text-crown-ash-darker font-sans text-xs">
            © {new Date().getFullYear()} Crown Registry Ltd. All rights reserved. Registered in England & Wales.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "🔒 256-bit SSL",
              "✦ SOC 2 Type II",
              "◆ FCA Regulated Escrow",
              "⬡ PCI DSS Compliant",
            ].map((badge) => (
              <span
                key={badge}
                className="font-sans text-[9px] text-crown-ash-darker tracking-widest
                           border border-white/5 px-2.5 py-1"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
