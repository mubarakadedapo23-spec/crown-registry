"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronRight, ChevronLeft, Upload, X, Plus,
  Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { createListing } from "@/lib/actions/listings";

const CATEGORIES = [
  { value: "LUXURY_CARS", label: "Luxury Cars", icon: "🏎" },
  { value: "HYPERCARS", label: "Hypercars", icon: "🏎" },
  { value: "CLASSIC_CARS", label: "Classic Cars", icon: "🚗" },
  { value: "MOTORCYCLES", label: "Motorcycles", icon: "🏍" },
  { value: "PRIVATE_JETS", label: "Private Jets", icon: "✈" },
  { value: "HELICOPTERS", label: "Helicopters", icon: "🚁" },
  { value: "YACHTS", label: "Yachts", icon: "⛵" },
  { value: "SUPERYACHTS", label: "Superyachts", icon: "⛴" },
  { value: "REAL_ESTATE", label: "Real Estate", icon: "🏛" },
  { value: "WATCHES", label: "Watches", icon: "⌚" },
  { value: "JEWELRY", label: "Jewelry", icon: "💎" },
  { value: "FASHION", label: "Fashion", icon: "👗" },
  { value: "FINE_ART", label: "Fine Art", icon: "🖼" },
  { value: "COLLECTIBLES", label: "Collectibles", icon: "🏺" },
  { value: "SNEAKERS", label: "Sneakers", icon: "👟" },
  { value: "ELECTRONICS", label: "Electronics", icon: "📱" },
  { value: "EXPERIENCES", label: "Experiences", icon: "✨" },
  { value: "TRAVEL", label: "Travel", icon: "🌍" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "AED", "JPY", "HKD", "SGD"];
const CONDITIONS = ["NEW", "EXCELLENT", "VERY_GOOD", "GOOD", "FAIR"];
const LISTING_TYPES = ["SALE", "AUCTION", "CHARTER", "LEASE", "RENT"];

const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Details" },
  { id: 3, label: "Pricing" },
  { id: 4, label: "Location" },
  { id: 5, label: "Media" },
  { id: 6, label: "Review" },
];

type FormState = {
  category: string;
  listingType: string;
  condition: string;
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  currency: string;
  priceNegotiable: boolean;
  priceOnRequest: boolean;
  country: string;
  city: string;
  region: string;
  images: string[];
  tags: string[];
};

const INITIAL: FormState = {
  category: "", listingType: "SALE", condition: "EXCELLENT",
  title: "", description: "", shortDescription: "",
  price: "", currency: "USD", priceNegotiable: false, priceOnRequest: false,
  country: "", city: "", region: "",
  images: [], tags: [],
};

export default function NewListingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const update = (field: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1 && !form.category) errs.category = "Please select a category";
    if (step === 2) {
      if (!form.title || form.title.length < 10) errs.title = "Title must be at least 10 characters";
      if (!form.description || form.description.length < 50) errs.description = "Description must be at least 50 characters";
    }
    if (step === 3) {
      if (!form.priceOnRequest && (!form.price || isNaN(Number(form.price)))) {
        errs.price = "Please enter a valid price";
      }
    }
    if (step === 5 && form.images.length === 0) {
      errs.images = "Please upload at least one image";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const res = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, fileSize: file.size }),
        });
        const { uploadUrl, publicUrl } = await res.json();
        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        update("images", [...form.images, publicUrl]);
      } catch {
        setErrors((e) => ({ ...e, images: "Upload failed. Please try again." }));
      }
    }
    setUploading(false);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      update("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => update("tags", form.tags.filter((t) => t !== tag));
  const removeImage = (url: string) => update("images", form.images.filter((i) => i !== url));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError("");

    const result = await createListing({
      ...form,
      price: Number(form.price) || 0,
      category: form.category as any,
      listingType: form.listingType as any,
      condition: form.condition as any,
      currency: form.currency as any,
      images: form.images.length > 0 ? form.images : ["https://placehold.co/800x600"],
    });

    if ("error" in result) {
      setSubmitError(result.error as string);
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard/seller/listings?created=${result.listingId}`);
  };

  return (
    <div className="min-h-screen bg-crown-obsidian py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-2">
            New Listing
          </p>
          <h1 className="font-serif text-3xl text-crown-ivory">List Your Asset</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-3.5 left-0 right-0 h-px bg-crown-gold/10" />
          {STEPS.map((s) => (
            <div key={s.id} className="relative flex flex-col items-center gap-1.5 z-10">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-sans
                               font-medium transition-all ${
                step > s.id
                  ? "bg-crown-gold text-black"
                  : step === s.id
                  ? "bg-crown-gold/20 border border-crown-gold text-crown-gold"
                  : "bg-crown-obsidian border border-crown-gold/20 text-crown-ash"
              }`}>
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
              </div>
              <span className={`font-sans text-[8px] tracking-widest uppercase hidden sm:block
                               ${step === s.id ? "text-crown-gold" : "text-crown-ash/40"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form panel */}
        <div className="glass-card p-8">
          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-xl text-crown-ivory mb-1">What are you listing?</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">Select the category that best describes your asset.</p>
              {errors.category && (
                <p className="text-red-400 font-sans text-xs mb-4">{errors.category}</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update("category", cat.value)}
                    className={`p-3 border text-center transition-all ${
                      form.category === cat.value
                        ? "border-crown-gold bg-crown-gold/10"
                        : "border-crown-gold/15 hover:border-crown-gold/40"
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="font-sans text-[9px] tracking-widest text-crown-ash uppercase leading-tight">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Listing Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update("listingType", t)}
                      className={`px-4 py-2 border font-sans text-[9px] tracking-widest uppercase
                                  transition-all ${
                        form.listingType === t
                          ? "border-crown-gold bg-crown-gold/10 text-crown-gold"
                          : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-crown-ivory mb-1">Asset Details</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">Provide compelling details to attract serious buyers.</p>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Listing Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. 2023 Bugatti Chiron Super Sport 300+"
                  className={`crown-input ${errors.title ? "border-red-400/60" : ""}`}
                  maxLength={200}
                />
                {errors.title && <p className="text-red-400 font-sans text-[9px] mt-1">{errors.title}</p>}
                <p className="font-sans text-[9px] text-crown-ash/40 mt-1">{form.title.length}/200</p>
              </div>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Short Description
                </label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                  placeholder="Brief one-line summary (shown in listings)"
                  className="crown-input"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Full Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Provide a detailed description of the asset, including history, condition, provenance, and any notable features..."
                  rows={8}
                  className={`crown-input resize-none ${errors.description ? "border-red-400/60" : ""}`}
                  maxLength={10000}
                />
                {errors.description && <p className="text-red-400 font-sans text-[9px] mt-1">{errors.description}</p>}
                <p className="font-sans text-[9px] text-crown-ash/40 mt-1">{form.description.length}/10,000</p>
              </div>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Condition
                </label>
                <div className="flex gap-2 flex-wrap">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => update("condition", c)}
                      className={`px-4 py-2 border font-sans text-[9px] tracking-widest uppercase
                                  transition-all ${
                        form.condition === c
                          ? "border-crown-gold bg-crown-gold/10 text-crown-gold"
                          : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
                      }`}
                    >
                      {c.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Tags (optional)
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {form.tags.map((tag) => (
                    <span key={tag}
                          className="flex items-center gap-1.5 px-3 py-1 bg-crown-gold/10
                                     border border-crown-gold/30 text-crown-gold font-sans text-[9px]">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag and press Enter"
                    className="crown-input flex-1"
                  />
                  <button onClick={addTag} type="button"
                          className="px-4 border border-crown-gold/30 text-crown-gold hover:bg-crown-gold/10">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-crown-ivory mb-1">Pricing</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">Set your asking price in your preferred currency.</p>

              <div className="flex items-center gap-3 p-4 border border-crown-gold/15">
                <input
                  type="checkbox"
                  id="por"
                  checked={form.priceOnRequest}
                  onChange={(e) => update("priceOnRequest", e.target.checked)}
                  className="accent-crown-gold"
                />
                <label htmlFor="por" className="font-sans text-sm text-crown-ash cursor-pointer">
                  Price on Request (hide price from listing)
                </label>
              </div>

              {!form.priceOnRequest && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                        Asking Price *
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => update("price", e.target.value)}
                        placeholder="0"
                        className={`crown-input ${errors.price ? "border-red-400/60" : ""}`}
                        min={0}
                      />
                      {errors.price && <p className="text-red-400 font-sans text-[9px] mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                        Currency
                      </label>
                      <select
                        value={form.currency}
                        onChange={(e) => update("currency", e.target.value)}
                        className="crown-input"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border border-crown-gold/15">
                    <input
                      type="checkbox"
                      id="negotiable"
                      checked={form.priceNegotiable}
                      onChange={(e) => update("priceNegotiable", e.target.checked)}
                      className="accent-crown-gold"
                    />
                    <label htmlFor="negotiable" className="font-sans text-sm text-crown-ash cursor-pointer">
                      Price negotiable (accept offers)
                    </label>
                  </div>
                </>
              )}

              {form.price && !form.priceOnRequest && (
                <div className="p-5 border border-crown-gold/20 bg-crown-gold/5">
                  <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash mb-1">
                    Estimated Listing Price
                  </p>
                  <p className="font-serif text-2xl text-crown-gold">
                    {form.currency} {Number(form.price).toLocaleString()}
                  </p>
                  <p className="font-sans text-[9px] text-crown-ash/50 mt-1">
                    5% commission applies on successful sale. No upfront fees.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-crown-ivory mb-1">Location</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">Where is the asset currently located?</p>

              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="e.g. Monaco"
                  className="crown-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="e.g. Monte Carlo"
                    className="crown-input"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                    Region / State
                  </label>
                  <input
                    value={form.region}
                    onChange={(e) => update("region", e.target.value)}
                    placeholder="Optional"
                    className="crown-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-crown-ivory mb-1">Photos & Media</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">
                Upload high-resolution images. First image will be the cover. Max 30 images, 50MB each.
              </p>

              {errors.images && (
                <div className="flex items-center gap-2 p-3 border border-red-400/30 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="font-sans text-xs">{errors.images}</p>
                </div>
              )}

              {/* Upload zone */}
              <label className="flex flex-col items-center justify-center h-40 border-2
                                border-dashed border-crown-gold/20 hover:border-crown-gold/50
                                transition-colors cursor-pointer bg-crown-gold/[0.02]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-crown-gold animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-crown-ash/40 mb-2" />
                )}
                <p className="font-sans text-[10px] tracking-widest uppercase text-crown-ash/60">
                  {uploading ? "Uploading..." : "Click or drag files here"}
                </p>
                <p className="font-sans text-[9px] text-crown-ash/30 mt-1">JPG, PNG, WEBP up to 50MB</p>
              </label>

              {/* Image previews */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {form.images.map((url, i) => (
                    <div key={url} className="relative aspect-square bg-crown-obsidian-light overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-crown-gold text-black
                                         font-sans text-[7px] tracking-widest uppercase px-1.5 py-0.5">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 flex items-center
                                   justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-crown-ivory mb-1">Review & Submit</h2>
              <p className="font-sans text-crown-ash text-sm mb-6">
                Your listing will be reviewed by our team before going live.
              </p>

              {submitError && (
                <div className="flex items-center gap-2 p-3 border border-red-400/30 bg-red-400/5 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="font-sans text-xs">{submitError}</p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: "Category", value: form.category.replace("_", " ") },
                  { label: "Title", value: form.title },
                  { label: "Listing Type", value: form.listingType },
                  { label: "Condition", value: form.condition?.replace("_", " ") },
                  { label: "Price", value: form.priceOnRequest ? "Price on Request" : `${form.currency} ${Number(form.price).toLocaleString()}` },
                  { label: "Location", value: [form.city, form.country].filter(Boolean).join(", ") || "Not specified" },
                  { label: "Images", value: `${form.images.length} uploaded` },
                  { label: "Tags", value: form.tags.length > 0 ? form.tags.join(", ") : "None" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3 border-b border-crown-gold/8">
                    <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60 w-28 shrink-0">
                      {label}
                    </span>
                    <span className="font-sans text-sm text-crown-ivory">{value}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 border border-crown-gold/15 bg-crown-gold/5">
                <p className="font-sans text-[10px] text-crown-ash leading-relaxed">
                  By submitting, you confirm this listing is accurate and you have the legal right to sell this asset.
                  Our team reviews all listings within 24 hours. You will be notified by email upon approval.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-crown-gold/10">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-crown-gold/20
                         text-crown-ash font-sans text-[10px] tracking-[0.15em] uppercase
                         hover:border-crown-gold/50 hover:text-crown-ivory transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold-gradient text-white
                           font-sans text-[10px] tracking-[0.15em] uppercase
                           hover:opacity-90 transition-opacity"
              >
                Continue
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-gold-gradient text-white
                           font-sans text-[10px] tracking-[0.15em] uppercase
                           hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit for Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
