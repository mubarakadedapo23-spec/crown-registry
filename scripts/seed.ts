import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Crown Registry database...");

  // ── Users ─────────────────────────────────────
  const adminPw = await hash("Admin123!", 12);
  const userPw = await hash("User1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@crownregistry.com" },
    update: {},
    create: {
      email: "admin@crownregistry.com",
      name: "Crown Admin",
      firstName: "Crown",
      lastName: "Admin",
      passwordHash: adminPw,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      verificationStatus: "VERIFIED",
      subscription: { create: { plan: "ENTERPRISE", status: "active", maxListings: 999, analyticsEnabled: true, aiToolsEnabled: true, verifiedBadge: true } },
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: "monaco@crownregistry.com" },
    update: {},
    create: {
      email: "monaco@crownregistry.com",
      name: "Monaco Auto Prestige",
      firstName: "Monaco",
      lastName: "Auto",
      passwordHash: userPw,
      role: "DEALER",
      status: "ACTIVE",
      emailVerified: new Date(),
      verificationStatus: "VERIFIED",
      country: "Monaco",
      city: "Monte Carlo",
      reputationScore: 4.9,
      totalListings: 24,
      dealerProfile: {
        create: {
          dealerName: "Monaco Auto Prestige",
          dealerType: "car",
          licenseNumber: "MC-DEALER-2891",
          establishedYear: 2001,
          description: "The premier source for hypercars and ultra-luxury vehicles on the Côte d'Azur.",
          isVerified: true,
          isPremium: true,
          rating: 4.9,
          reviewCount: 83,
        },
      },
      subscription: { create: { plan: "DEALER", status: "active", maxListings: 500, featuredListings: 20, analyticsEnabled: true, verifiedBadge: true } },
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "eliteaviation@crownregistry.com" },
    update: {},
    create: {
      email: "eliteaviation@crownregistry.com",
      name: "Elite Aviation Group",
      firstName: "Elite",
      lastName: "Aviation",
      passwordHash: userPw,
      role: "DEALER",
      status: "ACTIVE",
      emailVerified: new Date(),
      verificationStatus: "VERIFIED",
      country: "Switzerland",
      city: "Geneva",
      reputationScore: 4.8,
      totalListings: 12,
      dealerProfile: {
        create: {
          dealerName: "Elite Aviation Group",
          dealerType: "aircraft",
          licenseNumber: "CH-AIRCRAFT-4421",
          establishedYear: 1998,
          description: "Specialists in pre-owned business jets, turboprops and helicopter acquisitions worldwide.",
          isVerified: true,
          isPremium: true,
          rating: 4.8,
          reviewCount: 47,
        },
      },
      subscription: { create: { plan: "DEALER", status: "active", maxListings: 500, featuredListings: 20, analyticsEnabled: true, verifiedBadge: true } },
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: "james.sterling@example.com" },
    update: {},
    create: {
      email: "james.sterling@example.com",
      name: "James Sterling",
      firstName: "James",
      lastName: "Sterling",
      passwordHash: userPw,
      role: "BUYER",
      status: "ACTIVE",
      emailVerified: new Date(),
      verificationStatus: "VERIFIED",
      country: "United Kingdom",
      city: "London",
      subscription: { create: { plan: "FREE", status: "active", maxListings: 5 } },
    },
  });

  console.log("✅ Users created");

  // ── Brands ─────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: "bugatti" }, update: {}, create: { name: "Bugatti", slug: "bugatti", country: "France", isLuxury: true, isVerified: true } }),
    prisma.brand.upsert({ where: { slug: "ferrari" }, update: {}, create: { name: "Ferrari", slug: "ferrari", country: "Italy", isLuxury: true, isVerified: true } }),
    prisma.brand.upsert({ where: { slug: "rolls-royce" }, update: {}, create: { name: "Rolls-Royce", slug: "rolls-royce", country: "United Kingdom", isLuxury: true, isVerified: true } }),
    prisma.brand.upsert({ where: { slug: "gulfstream" }, update: {}, create: { name: "Gulfstream", slug: "gulfstream", country: "United States", isLuxury: true, isVerified: true } }),
    prisma.brand.upsert({ where: { slug: "patek-philippe" }, update: {}, create: { name: "Patek Philippe", slug: "patek-philippe", country: "Switzerland", isLuxury: true, isVerified: true } }),
    prisma.brand.upsert({ where: { slug: "lurssen" }, update: {}, create: { name: "Lürssen", slug: "lurssen", country: "Germany", isLuxury: true, isVerified: true } }),
  ]);

  console.log("✅ Brands created");

  // ── Listings ───────────────────────────────────
  const listings = [
    {
      title: "Bugatti Chiron Super Sport 300+",
      slug: "bugatti-chiron-super-sport-300-plus-mc2024",
      description: "One of the most exclusive hypercars ever created. This Bugatti Chiron Super Sport 300+ is a testament to automotive engineering at its absolute zenith. Originally a limited edition of just 30 units, commemorating the historic 300 mph barrier broken by the Chiron in 2019, this example has covered just 1,247 km from new.\n\nThe car is finished in a bespoke Nocturne Black over Mimosa Yellow combination — a unique two-tone scheme specified by the original owner through the Bugatti Sur Mesure programme. The interior features hand-stitched quilted leather throughout, with gold anodised accents matching the exterior brightwork.\n\nSupplied with full Bugatti service history, both keys, full documentation, and a certificate of authenticity. Offered by Monaco Auto Prestige, Bugatti's authorised partner in Monaco.",
      shortDescription: "Limited to 30 units worldwide. 1,247km from new. Bespoke Sur Mesure specification.",
      category: "HYPERCARS",
      status: "ACTIVE",
      condition: "EXCELLENT",
      price: 3900000,
      currency: "USD",
      country: "Monaco",
      city: "Monte Carlo",
      isFeatured: true,
      isPremium: true,
      isVerified: true,
      viewCount: 8420,
      wishlistCount: 342,
      sellerId: seller1.id,
      brandId: brands[0].id,
      publishedAt: new Date(),
      vehicleSpecs: {
        create: {
          make: "Bugatti",
          model: "Chiron Super Sport 300+",
          year: 2022,
          mileage: 1247,
          mileageUnit: "km",
          transmission: "automatic",
          fuelType: "petrol",
          engineCC: 7993,
          horsepower: 1578,
          torqueNm: 1600,
          acceleration0to100: 2.4,
          topSpeedKmh: 490,
          color: "Nocturne Black / Mimosa Yellow",
          interiorColor: "Mimosa Yellow Leather",
          driveType: "AWD",
          doors: 2,
          seats: 2,
          hasWarranty: true,
          warrantyMonths: 12,
          hasServiceHistory: true,
          importStatus: "local",
          additionalFeatures: ["Carbon fibre bodywork", "Titanium exhaust", "Bugatti Sur Mesure specification", "Full documentation"],
        },
      },
      tags: { create: [{ tag: "hypercar" }, { tag: "limited-edition" }, { tag: "bugatti" }] },
    },
    {
      title: "Gulfstream G700 Ultra Long Range",
      slug: "gulfstream-g700-ultra-long-range-gen2024",
      description: "The Gulfstream G700 represents the pinnacle of business aviation. This delivery-fresh 2023 example features the extended cabin with 20 passenger seats in a five-zone configuration, the most spacious interior in Gulfstream history.\n\nEquipped with the Symmetry Flight Deck featuring the industry's most comprehensive advanced avionics package. The aircraft offers an ultra-long range of 7,500 nm at Mach 0.85, connecting any two cities on earth non-stop.\n\nCabin features a forward lounge, main conference area, aft stateroom with queen bed, shower and dedicated crew rest. Entertainment by Honeywell GoGo Avance. Operated under EASA certification.\n\nCurrently based at Geneva International Airport. Available for immediate transfer.",
      shortDescription: "2023 delivery. 5-zone cabin. 7,500nm range. Shower equipped. EASA certified.",
      category: "PRIVATE_JETS",
      status: "ACTIVE",
      condition: "NEW",
      price: 75000000,
      currency: "USD",
      country: "Switzerland",
      city: "Geneva",
      isFeatured: true,
      isPremium: true,
      isVerified: true,
      viewCount: 4230,
      wishlistCount: 187,
      sellerId: seller2.id,
      brandId: brands[3].id,
      publishedAt: new Date(),
      aircraftSpecs: {
        create: {
          aircraftType: "jet",
          make: "Gulfstream",
          model: "G700",
          year: 2023,
          tailNumber: "HB-JET7",
          totalHours: 312,
          rangeKm: 13890,
          passengerCapacity: 20,
          crewCapacity: 4,
          cruiseSpeedKts: 488,
          fuelCapacityL: 29300,
          hangared: true,
          currentLocation: "Geneva",
          cabinConfiguration: "5-zone: Lounge / Conference / Dining / Stateroom / Crew",
          wifiEquipped: true,
          certifications: ["EASA", "FAA", "TCCA"],
        },
      },
      tags: { create: [{ tag: "private-jet" }, { tag: "gulfstream" }, { tag: "ultra-long-range" }] },
    },
    {
      title: "Penthouse Duplex — One Hyde Park, London",
      slug: "penthouse-one-hyde-park-london-re2024",
      description: "One of London's most celebrated addresses. This extraordinary duplex penthouse occupies the upper floors of One Hyde Park — widely regarded as the world's most exclusive residential development.\n\nDesigned by Richard Rogers Partnership with interiors by Candy & Candy, the property offers breathtaking views over Hyde Park and the London skyline. The principal floor features a magnificent reception room, formal dining room, fully equipped professional kitchen, and library.\n\nThe upper level hosts the master suite with dressing room and marble bathroom, three further en-suite bedrooms, and a private terrace. The property is offered fully furnished to the highest possible standard.\n\nResident services include 24-hour concierge, underground parking, valet, spa, 21m swimming pool, cinema, and direct access to Mandarin Oriental hotel services.",
      shortDescription: "Duplex penthouse. Hyde Park views. Candy & Candy interiors. Full Mandarin Oriental services.",
      category: "REAL_ESTATE",
      status: "ACTIVE",
      condition: "EXCELLENT",
      price: 185000000,
      currency: "GBP",
      country: "United Kingdom",
      city: "London",
      isFeatured: true,
      isPremium: true,
      isVerified: true,
      viewCount: 6100,
      wishlistCount: 291,
      sellerId: seller1.id,
      publishedAt: new Date(),
      realEstateSpecs: {
        create: {
          propertyType: "penthouse",
          bedrooms: 4,
          bathrooms: 5,
          parkingSpaces: 3,
          floorArea: 850,
          yearBuilt: 2011,
          furnished: true,
          furnishingLevel: "fully",
          viewType: "park",
          amenities: ["Pool", "Spa", "Cinema", "Concierge", "Valet parking", "24-hour security"],
          titleType: "leasehold",
        },
      },
      tags: { create: [{ tag: "london" }, { tag: "penthouse" }, { tag: "one-hyde-park" }] },
    },
    {
      title: "Patek Philippe Grandmaster Chime Ref. 6300A",
      slug: "patek-philippe-grandmaster-chime-6300a-w2024",
      description: "The most complicated watch Patek Philippe has ever created for sale. The Grandmaster Chime Ref. 6300A in stainless steel is arguably the most collectible timepiece in existence — the reference that sold for CHF 31 million at Only Watch 2019.\n\nThis example is the standard production version in stainless steel, featuring 20 complications including five chiming modes. The reversible case presents two different dials: a grand feu champleve enamel dial in midnight blue on the main side, and an embossed gold date dial on the reverse.\n\nSupplied complete with original Patek Philippe box, all papers, hang tags, and certificate of authenticity. Previously owned by a prominent European collector. Authenticated by an independent specialist.",
      shortDescription: "20 complications. 5 chiming modes. Steel case. Box and papers. Single previous owner.",
      category: "WATCHES",
      status: "ACTIVE",
      condition: "EXCELLENT",
      price: 3200000,
      currency: "CHF",
      priceNegotiable: true,
      country: "Switzerland",
      city: "Geneva",
      isFeatured: true,
      isVerified: true,
      viewCount: 9840,
      wishlistCount: 512,
      sellerId: seller1.id,
      brandId: brands[4].id,
      publishedAt: new Date(),
      watchSpecs: {
        create: {
          brand: "Patek Philippe",
          model: "Grandmaster Chime",
          referenceNumber: "6300A-010",
          year: 2020,
          caseMaterial: "Stainless Steel",
          caseSizeMm: 47.7,
          dialColor: "Midnight Blue / Gold",
          movementType: "manual",
          powerReserveHours: 72,
          waterResistanceM: 30,
          braceletType: "strap",
          braceletMaterial: "Alligator leather",
          complications: ["Tourbillon", "Perpetual calendar", "5 chiming modes", "Date", "Day", "Month", "Year", "Leap year"],
          hasBoxAndPapers: true,
          isAuthenticated: true,
          authenticator: "Independent specialist",
        },
      },
      tags: { create: [{ tag: "patek" }, { tag: "watch" }, { tag: "tourbillon" }, { tag: "complicated" }] },
    },
  ];

  for (const listingData of listings) {
    const { vehicleSpecs, realEstateSpecs, aircraftSpecs, watchSpecs, tags, ...data } = listingData as any;
    await prisma.listing.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        vehicleSpecs: vehicleSpecs ? { create: vehicleSpecs.create } : undefined,
        realEstateSpecs: realEstateSpecs ? { create: realEstateSpecs.create } : undefined,
        aircraftSpecs: aircraftSpecs ? { create: aircraftSpecs.create } : undefined,
        watchSpecs: watchSpecs ? { create: watchSpecs.create } : undefined,
        tags: { create: tags.create },
      },
    });
  }

  console.log("✅ Listings created");

  // ── Notifications (demo) ───────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: seller1.id,
        type: "order",
        title: "New Inquiry Received",
        body: "A buyer has enquired about your Bugatti Chiron listing.",
        data: {},
        isRead: false,
      },
      {
        userId: buyer1.id,
        type: "system",
        title: "Welcome to Crown Registry",
        body: "Your account is active. Start exploring extraordinary assets.",
        data: {},
        isRead: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Notifications created");
  console.log("\n✨ Seed complete!\n");
  console.log("  Admin:  admin@crownregistry.com / Admin123!");
  console.log("  Dealer: monaco@crownregistry.com / User1234!");
  console.log("  Buyer:  james.sterling@example.com / User1234!\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
