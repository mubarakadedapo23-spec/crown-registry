"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard/buyer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-crown-obsidian flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 border border-crown-gold flex items-center justify-center text-crown-gold text-sm">
              ♛
            </div>
            <span className="font-serif text-lg font-semibold tracking-[0.25em] uppercase text-crown-ivory">
              Crown Registry
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-crown-ivory mb-2">Welcome Back</h1>
            <p className="font-sans text-crown-ash text-sm">
              Sign in to access your luxury asset portfolio
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 border border-red-400/30 bg-red-400/5
                            text-red-400 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-sans text-xs">{error}</p>
            </div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { provider: "google", label: "Google", icon: "G" },
              { provider: "apple", label: "Apple", icon: "" },
              { provider: "facebook", label: "Facebook", icon: "f" },
            ].map((p) => (
              <button
                key={p.provider}
                onClick={() => handleOAuth(p.provider)}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 py-3 border border-crown-gold/20
                           text-crown-ash hover:text-crown-ivory hover:border-crown-gold/50
                           font-sans text-[10px] tracking-widest uppercase transition-all
                           disabled:opacity-50"
              >
                {oauthLoading === p.provider ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span className="font-bold">{p.icon}</span>
                )}
                {p.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-crown-gold/10" />
            <span className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/40">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-crown-gold/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block font-sans text-[9px] tracking-[0.2em] uppercase
                                text-crown-ash mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="crown-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash">
                  Password
                </label>
                <Link href="/auth/forgot-password"
                      className="font-sans text-[9px] text-crown-gold hover:text-crown-gold/70">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="crown-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-crown-ash
                             hover:text-crown-ivory transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold-gradient text-white font-sans text-[10px]
                         tracking-[0.2em] uppercase hover:opacity-90 transition-opacity
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-center font-sans text-xs text-crown-ash/60 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-crown-gold hover:text-crown-gold/70">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Luxury visual */}
      <div className="hidden lg:flex flex-1 relative bg-[#070500] items-center justify-center
                      overflow-hidden">
        <div
          className="absolute inset-0 hero-grid bg-[length:60px_60px] opacity-60"
        />
        <div className="absolute inset-0"
             style={{ background: "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)" }}
        />

        {/* Corner ornaments */}
        {["top-8 left-8 border-t border-l", "top-8 right-8 border-t border-r",
          "bottom-8 left-8 border-b border-l", "bottom-8 right-8 border-b border-r"].map((cls) => (
          <div key={cls} className={`absolute ${cls} border-crown-gold/20 w-8 h-8`} />
        ))}

        <div className="relative z-10 text-center p-12">
          <div className="w-16 h-16 border border-crown-gold mx-auto mb-6
                          flex items-center justify-center text-crown-gold text-3xl">
            ♛
          </div>
          <h2 className="font-serif text-3xl text-crown-ivory mb-4">
            The World's Most<br />
            <em className="text-gold-shimmer">Exceptional</em> Assets
          </h2>
          <p className="font-sans text-crown-ash text-sm leading-relaxed max-w-xs mx-auto">
            Join 140,000+ discerning buyers and sellers across 190 countries on the world's
            finest luxury marketplace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "140K+", label: "Users" },
              { value: "190+", label: "Countries" },
              { value: "$2.4B", label: "GMV" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-2xl text-crown-gold">{s.value}</p>
                <p className="font-sans text-[9px] tracking-widest uppercase text-crown-ash/60 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
