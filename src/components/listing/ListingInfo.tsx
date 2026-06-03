"use client";

import { useState } from "react";
import { FileText, Download, Tag } from "lucide-react";

const TABS = ["Description", "Specifications", "Documents"] as const;
type Tab = (typeof TABS)[number];

export function ListingInfo({ listing, isOwner }: { listing: any; isOwner: boolean }) {
  const [tab, setTab] = useState<Tab>("Description");

  const specs = listing.vehicleSpecs ?? listing.realEstateSpecs ??
    listing.aircraftSpecs ?? listing.watercraftSpecs ??
    listing.watchSpecs ?? listing.fashionSpecs;

  const SPEC_LABELS: Record<string, Record<string, string>> = {
    vehicleSpecs: {
      make: "Make", model: "Model", year: "Year", mileage: "Mileage",
      transmission: "Transmission", fuelType: "Fuel Type", engineCC: "Engine (cc)",
      horsepower: "Horsepower", torqueNm: "Torque (Nm)", acceleration0to100: "0–100 km/h",
      topSpeedKmh: "Top Speed", color: "Exterior Color", interiorColor: "Interior Color",
      driveType: "Drive Type", doors: "Doors", seats: "Seats", vin: "VIN",
      registrationNo: "Registration", hasWarranty: "Warranty", hasServiceHistory: "Service History",
    },
    realEstateSpecs: {
      propertyType: "Property Type", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
      floorArea: "Floor Area (m²)", landArea: "Land Area (m²)", yearBuilt: "Year Built",
      furnished: "Furnished", viewType: "View", titleType: "Title",
      parkingSpaces: "Parking", floorNumber: "Floor",
    },
    aircraftSpecs: {
      aircraftType: "Aircraft Type", make: "Make", model: "Model", year: "Year",
      tailNumber: "Tail Number", totalHours: "Total Hours", rangeKm: "Range (km)",
      passengerCapacity: "Passengers", cruiseSpeedKts: "Cruise Speed (kts)",
      cabinConfiguration: "Cabin Config", wifiEquipped: "WiFi",
    },
    watercraftSpecs: {
      vesselType: "Type", make: "Make", model: "Model", year: "Year",
      lengthM: "Length (m)", beamM: "Beam (m)", grossTonnage: "Gross Tonnage",
      hullMaterial: "Hull Material", maxSpeedKts: "Max Speed (kts)",
      rangeNm: "Range (nm)", cabins: "Cabins", guests: "Guests", crew: "Crew",
      flag: "Flag", hasCharterLicense: "Charter License",
    },
    watchSpecs: {
      brand: "Brand", model: "Model", referenceNumber: "Reference",
      serialNumber: "Serial Number", year: "Year", caseMaterial: "Case Material",
      caseSizeMm: "Case Size (mm)", dialColor: "Dial Color", movementType: "Movement",
      complications: "Complications", hasBoxAndPapers: "Box & Papers", isAuthenticated: "Authenticated",
    },
  };

  const specKey = listing.vehicleSpecs ? "vehicleSpecs"
    : listing.realEstateSpecs ? "realEstateSpecs"
    : listing.aircraftSpecs ? "aircraftSpecs"
    : listing.watercraftSpecs ? "watercraftSpecs"
    : listing.watchSpecs ? "watchSpecs"
    : null;

  const specLabels = specKey ? SPEC_LABELS[specKey] : {};

  return (
    <div className="luxury-card">
      {/* Tabs */}
      <div className="flex border-b border-crown-gold/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 font-sans text-[10px] tracking-[0.15em] uppercase
                        border-b-2 transition-all ${
              tab === t
                ? "text-crown-gold border-crown-gold"
                : "text-crown-ash border-transparent hover:text-crown-ivory"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Description */}
        {tab === "Description" && (
          <div>
            {listing.shortDescription && (
              <p className="font-serif text-lg text-crown-ivory/80 italic mb-5 leading-relaxed
                             border-l-2 border-crown-gold pl-4">
                {listing.shortDescription}
              </p>
            )}
            <div className="font-sans text-sm text-crown-ash leading-[1.9] whitespace-pre-line">
              {listing.description}
            </div>
            {listing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-crown-gold/10">
                <Tag className="w-3.5 h-3.5 text-crown-ash/50 self-center" />
                {listing.tags.map((t: any) => (
                  <span key={t.tag}
                        className="px-2.5 py-1 border border-crown-gold/15 text-crown-ash
                                   font-sans text-[9px] tracking-widest uppercase hover:border-crown-gold/40
                                   hover:text-crown-gold transition-colors cursor-pointer">
                    {t.tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Specifications */}
        {tab === "Specifications" && (
          <div>
            {!specs ? (
              <p className="text-crown-ash font-sans text-sm py-6 text-center">
                No detailed specifications available for this listing.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-8">
                {Object.entries(specs)
                  .filter(([key, val]) => val !== null && val !== undefined && key !== "id" && key !== "listingId")
                  .map(([key, val]) => {
                    const label = specLabels[key] ?? key.replace(/([A-Z])/g, " $1").trim();
                    const display = typeof val === "boolean" ? (val ? "Yes" : "No")
                      : Array.isArray(val) ? val.join(", ")
                      : String(val);

                    return (
                      <div key={key} className="flex justify-between py-3 border-b border-crown-gold/6">
                        <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60">
                          {label}
                        </span>
                        <span className="font-sans text-xs text-crown-ivory text-right max-w-[55%]">
                          {display}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {tab === "Documents" && (
          <div>
            {(!listing.documents || listing.documents.length === 0) ? (
              <p className="text-crown-ash font-sans text-sm py-6 text-center">
                No documents uploaded for this listing.
              </p>
            ) : (
              <div className="space-y-3">
                {listing.documents.map((doc: any) => (
                  <div key={doc.id}
                       className="flex items-center gap-4 p-4 border border-crown-gold/10
                                  hover:border-crown-gold/30 transition-colors">
                    <FileText className="w-5 h-5 text-crown-gold/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-crown-ivory truncate">{doc.name}</p>
                      <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/50 mt-0.5">
                        {doc.type} {doc.fileSize ? `· ${(doc.fileSize / 1024).toFixed(0)}KB` : ""}
                      </p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 border border-crown-gold/20 flex items-center justify-center
                                  text-crown-ash hover:text-crown-gold hover:border-crown-gold/50
                                  transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
