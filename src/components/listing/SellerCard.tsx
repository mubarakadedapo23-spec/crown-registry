"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Shield, Star, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ── Seller Card ────────────────────────────────

export function SellerCard({ seller, listingId }: { seller: any; listingId: string }) {
  return (
    <div className="luxury-card p-5">
      <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold mb-4">
        Listed By
      </h3>
      <div className="flex items-center gap-3 mb-4">
        {seller.avatar ? (
          <Image src={seller.avatar} alt={seller.name ?? ""} width={44} height={44}
                 className="rounded-full border border-crown-gold/20" />
        ) : (
          <div className="w-11 h-11 bg-crown-gold/10 flex items-center justify-center border border-crown-gold/20">
            <span className="text-crown-gold text-lg font-serif">
              {(seller.name ?? "?")[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-serif text-crown-ivory text-base truncate">
              {seller.dealerProfile?.dealerName ?? seller.name}
            </p>
            {seller.verificationStatus === "VERIFIED" && (
              <Shield className="w-3.5 h-3.5 text-crown-gold shrink-0" />
            )}
          </div>
          {seller.dealerProfile?.isVerified && (
            <span className="font-sans text-[8px] tracking-widest uppercase text-crown-gold/70">
              Verified Dealer
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Listings", value: seller.totalListings ?? 0 },
          { label: "Rating", value: seller.dealerProfile?.rating ? `${seller.dealerProfile.rating.toFixed(1)}★` : "New" },
          { label: "Member Since", value: new Date(seller.createdAt).getFullYear() },
        ].map((s) => (
          <div key={s.label} className="text-center py-2 border border-crown-gold/8">
            <p className="font-serif text-crown-gold text-lg">{s.value}</p>
            <p className="font-sans text-[8px] tracking-widest uppercase text-crown-ash/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Link href={`/sellers/${seller.id}`}>
        <button className="w-full py-2.5 border border-crown-gold/25 text-crown-gold font-sans
                           text-[9px] tracking-[0.2em] uppercase hover:border-crown-gold/60
                           hover:bg-crown-gold/5 transition-all">
          View Profile
        </button>
      </Link>
    </div>
  );
}

// ── Contact Form ───────────────────────────────

export function ContactForm({
  listingId,
  sellerId,
  listingTitle,
}: {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState(
    `Hello, I am interested in your listing: ${listingTitle}. Could you please provide more details?`
  );
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/listing/${listingId}`);
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: sellerId, listingId, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-card p-5">
      <h3 className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-gold mb-4">
        Contact Seller
      </h3>

      {sent ? (
        <div className="flex flex-col items-center py-6 text-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <p className="font-serif text-crown-ivory text-lg">Message Sent</p>
          <p className="font-sans text-crown-ash text-xs leading-relaxed">
            Your message has been sent. The seller typically responds within a few hours.
          </p>
          <Link href="/dashboard/buyer/messages">
            <button className="mt-2 px-5 py-2 border border-crown-gold/30 text-crown-gold
                               font-sans text-[9px] tracking-widest uppercase hover:border-crown-gold/60">
              View Messages
            </button>
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <p className="text-red-400 font-sans text-xs mb-3">{error}</p>
          )}
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); setError(""); }}
            rows={5}
            className="crown-input resize-none mb-3"
            placeholder="Write your message..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gold-gradient
                       text-white font-sans text-[10px] tracking-[0.15em] uppercase
                       hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" />
            )}
            {session ? "Send Message" : "Sign In to Contact"}
          </button>
          <p className="font-sans text-[9px] text-crown-ash/40 text-center mt-2">
            Your contact details will be shared with the seller
          </p>
        </>
      )}
    </div>
  );
}
