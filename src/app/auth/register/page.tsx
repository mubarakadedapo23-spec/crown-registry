"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["BUYER", "SELLER", "DEALER"]),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

const ROLES = [
  { value: "BUYER", label: "Buyer", desc: "Browse and purchase luxury assets" },
  { value: "SELLER", label: "Seller", desc: "List and sell individual assets" },
  { value: "DEALER", label: "Dealer / Agency", desc: "Manage inventory and team" },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}
               className={`h-0.5 flex-1 transition-colors ${i <= score ? colors[score] : "bg-crown-gold/10"}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <span key={c.label}
                  className={`flex items-center gap-1 font-sans text-[9px] ${c.ok ? "text-emerald-400" : "text-crown-ash/40"}`}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {c.label}
            </span>
          ))}
        </div>
        <span className={`font-sans text-[9px] tracking-widest uppercase
                         ${score > 0 ? colors[score].replace("bg-", "text-") : ""}`}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    role: "BUYER" as "BUYER" | "SELLER" | "DEALER",
    terms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const parsed = schema.safeParse({ ...form, terms: form.terms || undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push("/auth/register/success");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crown-obsidian flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-7 h-7 border border-crown-gold flex items-center justify-center text-crown-gold text-sm">♛</div>
          <span className="font-serif text-lg font-semibold tracking-[0.25em] uppercase text-crown-ivory">Crown Registry</span>
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-crown-ivory mb-2">Create Your Account</h1>
            <p className="font-sans text-crown-ash text-sm">Join the world's finest luxury marketplace</p>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 p-3 border border-red-400/30 bg-red-400/5 text-red-400 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-sans text-xs">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                I am a
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update("role", r.value)}
                    className={`p-3 border text-left transition-all ${
                      form.role === r.value
                        ? "border-crown-gold bg-crown-gold/10 text-crown-ivory"
                        : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
                    }`}
                  >
                    <p className="font-sans text-[10px] tracking-widest uppercase font-medium">
                      {r.label}
                    </p>
                    <p className="font-sans text-[8px] text-crown-ash/60 mt-0.5 leading-tight">
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="James"
                  className={`crown-input ${errors.firstName ? "border-red-400/60" : ""}`}
                />
                {errors.firstName && (
                  <p className="font-sans text-[9px] text-red-400 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Sterling"
                  className={`crown-input ${errors.lastName ? "border-red-400/60" : ""}`}
                />
                {errors.lastName && (
                  <p className="font-sans text-[9px] text-red-400 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="james@example.com"
                className={`crown-input ${errors.email ? "border-red-400/60" : ""}`}
              />
              {errors.email && <p className="font-sans text-[9px] text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-crown-ash mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  className={`crown-input pr-12 ${errors.password ? "border-red-400/60" : ""}`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-crown-ash hover:text-crown-ivory">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && <p className="font-sans text-[9px] text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <div
                onClick={() => update("terms", !form.terms)}
                className={`w-4 h-4 mt-0.5 border flex items-center justify-center shrink-0 cursor-pointer
                            transition-all ${form.terms ? "border-crown-gold bg-crown-gold" : "border-crown-gold/30"}`}
              >
                {form.terms && <span className="text-black text-[8px] font-bold">✓</span>}
              </div>
              <p className="font-sans text-[10px] text-crown-ash leading-relaxed">
                I agree to Crown Registry's{" "}
                <Link href="/legal/terms" className="text-crown-gold hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/legal/privacy" className="text-crown-gold hover:underline">Privacy Policy</Link>
              </p>
            </div>
            {errors.terms && <p className="font-sans text-[9px] text-red-400 -mt-3">{errors.terms}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold-gradient text-white font-sans text-[10px]
                         tracking-[0.2em] uppercase hover:opacity-90 transition-opacity
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center font-sans text-xs text-crown-ash/60 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-crown-gold hover:text-crown-gold/70">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
