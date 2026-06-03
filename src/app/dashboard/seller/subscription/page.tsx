import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Zap } from "lucide-react";
import { createSubscriptionCheckout } from "@/lib/actions/payments";

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: [
      "Up to 5 listings",
      "Standard search placement",
      "Basic analytics",
      "Email support",
    ],
    limits: ["No featured listings", "No AI tools", "No verified badge"],
    cta: "Current Plan",
    highlight: false,
  },
  {
    key: "PROFESSIONAL",
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For serious individual sellers",
    features: [
      "Up to 25 listings",
      "2 featured listings/month",
      "Priority search placement",
      "Advanced analytics",
      "Verified seller badge",
      "Priority support",
    ],
    limits: [],
    cta: "Upgrade",
    highlight: false,
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: "$299",
    period: "/month",
    description: "For high-volume sellers",
    features: [
      "Up to 100 listings",
      "10 featured listings/month",
      "Premium search placement",
      "Full analytics suite",
      "AI listing tools",
      "Verified badge",
      "Dedicated support",
      "Custom store page",
    ],
    limits: [],
    cta: "Upgrade",
    highlight: true,
  },
  {
    key: "DEALER",
    name: "Dealer",
    price: "$599",
    period: "/month",
    description: "For professional dealers & agencies",
    features: [
      "Up to 500 listings",
      "20 featured listings/month",
      "Top search placement",
      "Full analytics + CRM",
      "AI tools + pricing",
      "Team members (5)",
      "Lead management",
      "White-glove onboarding",
      "API access",
    ],
    limits: [],
    cta: "Upgrade",
    highlight: false,
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large agencies & institutions",
    features: [
      "Unlimited listings",
      "50+ featured listings",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited team members",
      "White-label options",
    ],
    limits: [],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const currentPlan = subscription?.plan ?? "FREE";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">
          Seller Dashboard
        </p>
        <h1 className="font-serif text-2xl text-crown-ivory">Subscription Plans</h1>
        <p className="font-sans text-crown-ash text-xs mt-1">
          Current plan: <span className="text-crown-gold">{currentPlan.replace("_", " ")}</span>
          {subscription?.currentPeriodEnd && (
            <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
          )}
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col p-5 border transition-all duration-200 ${
                plan.highlight
                  ? "border-crown-gold bg-crown-gold/5"
                  : isActive
                  ? "border-emerald-400/40 bg-emerald-400/5"
                  : "border-crown-gold/15 hover:border-crown-gold/35"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1
                                bg-gold-gradient text-black font-sans text-[8px] tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              {isActive && (
                <div className="flex items-center gap-1 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-sans text-[8px] tracking-widest uppercase text-emerald-400">
                    Active
                  </span>
                </div>
              )}
              <p className="font-sans text-[9px] tracking-widest uppercase text-crown-gold mb-1">
                {plan.name}
              </p>
              <div className="mb-1">
                <span className="font-serif text-3xl text-crown-ivory">{plan.price}</span>
                <span className="font-sans text-xs text-crown-ash">{plan.period}</span>
              </div>
              <p className="font-sans text-[10px] text-crown-ash/60 mb-4">{plan.description}</p>

              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-crown-gold/60 shrink-0 mt-0.5" />
                    <span className="font-sans text-[10px] text-crown-ash">{f}</span>
                  </li>
                ))}
              </ul>

              <form action={async () => {
                "use server";
                if (plan.key === "ENTERPRISE") return;
                const result = await createSubscriptionCheckout(plan.key);
                if ("checkoutUrl" in result && result.checkoutUrl) {
                  // redirect to checkout
                }
              }}>
                <button
                  type="submit"
                  disabled={isActive || plan.key === "FREE"}
                  className={`w-full py-2.5 font-sans text-[9px] tracking-[0.15em] uppercase
                               transition-all ${
                    isActive
                      ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 cursor-default"
                      : plan.highlight
                      ? "bg-gold-gradient text-white hover:opacity-90"
                      : plan.key === "FREE"
                      ? "border border-crown-gold/15 text-crown-ash/40 cursor-default"
                      : "border border-crown-gold/30 text-crown-gold hover:border-crown-gold/60 hover:bg-crown-gold/5"
                  }`}
                >
                  {isActive ? "Current Plan" : plan.cta}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {/* Feature comparison note */}
      <div className="luxury-card p-6 flex items-start gap-4">
        <Zap className="w-5 h-5 text-crown-gold shrink-0 mt-0.5" />
        <div>
          <p className="font-serif text-crown-ivory mb-1">All plans include</p>
          <p className="font-sans text-crown-ash text-sm leading-relaxed">
            Free listing creation · Global marketplace access · Secure messaging · Offer system ·
            5% commission only on sales (no upfront fees) · GDPR-compliant data handling ·
            SSL-encrypted transactions · 24/7 platform availability.
          </p>
        </div>
      </div>
    </div>
  );
}
