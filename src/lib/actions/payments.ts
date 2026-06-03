"use server";

import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

// ── Checkout ───────────────────────────────────

export async function createCheckoutSession(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: "ACTIVE" },
    include: { seller: true, images: { take: 1 } },
  });

  if (!listing) return { error: "Listing not found" };
  if (listing.sellerId === session.user.id) return { error: "Cannot buy your own listing" };

  const buyer = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!buyer) return { error: "User not found" };

  const commissionRate = 0.05; // 5%
  const commissionAmount = Number(listing.price) * commissionRate;
  const totalAmount = Number(listing.price) + commissionAmount;

  const orderNumber = `CR-${nanoid(10).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      status: "PENDING",
      amount: listing.price,
      currency: listing.currency,
      commissionAmount,
      commissionRate,
      totalAmount,
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    client_reference_id: order.id,
    customer_email: buyer.email!,
    line_items: [
      {
        price_data: {
          currency: listing.currency.toLowerCase(),
          product_data: {
            name: listing.title,
            description: listing.shortDescription ?? undefined,
            images: listing.images[0] ? [listing.images[0].url] : [],
            metadata: {
              listingId,
              sellerId: listing.sellerId,
              category: listing.category,
            },
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listing.slug}?status=cancelled`,
    payment_intent_data: {
      metadata: { orderId: order.id },
      capture_method: "automatic",
    },
  });

  return { checkoutUrl: stripeSession.url, orderId: order.id };
}

// ── Subscription plans ─────────────────────────

const PLAN_PRICES: Record<string, string> = {
  PROFESSIONAL: "price_professional_monthly",
  BUSINESS: "price_business_monthly",
  ENTERPRISE: "price_enterprise_monthly",
  DEALER: "price_dealer_monthly",
  AGENCY: "price_agency_monthly",
};

export async function createSubscriptionCheckout(plan: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const priceId = PLAN_PRICES[plan];
  if (!priceId) return { error: "Invalid plan" };

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const customer = await stripe.customers.create({
      email: user?.email!,
      name: user?.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: session.user.id,
        plan: "FREE",
        stripeCustomerId: customerId,
      },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: session.user.id, plan },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return { checkoutUrl: checkoutSession.url };
}

// ── Seller payout setup ────────────────────────

export async function createConnectOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  let accountId = sellerProfile?.stripeAccountId;

  if (!accountId) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const account = await stripe.accounts.create({
      type: "express",
      email: user?.email!,
      metadata: { userId: session.user.id },
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    accountId = account.id;

    await prisma.sellerProfile.upsert({
      where: { userId: session.user.id },
      update: { stripeAccountId: accountId },
      create: { userId: session.user.id, stripeAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/payouts?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/payouts?connected=true`,
    type: "account_onboarding",
  });

  return { onboardingUrl: accountLink.url };
}

// ── Webhook handler ────────────────────────────

export async function handleStripeWebhook(body: string, signature: string) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return { error: "Invalid signature" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_HELD",
          escrowHeld: true,
        },
      });

      await prisma.payment.create({
        data: {
          orderId,
          userId: session.metadata!.buyerId,
          type: "PURCHASE",
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency?.toUpperCase() as any ?? "USD",
          status: "succeeded",
          provider: "stripe",
          providerPaymentId: session.payment_intent as string,
        },
      });

      // Notify seller
      await prisma.notification.create({
        data: {
          userId: session.metadata!.sellerId,
          type: "order",
          title: "Payment Received",
          body: "A buyer has completed payment. Funds are held in escrow.",
          data: { orderId },
        },
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const plan = sub.metadata?.plan;
      if (!userId || !plan) break;

      const planFeatures: Record<string, any> = {
        PROFESSIONAL: { maxListings: 25, featuredListings: 2, analyticsEnabled: false, aiToolsEnabled: false },
        BUSINESS: { maxListings: 100, featuredListings: 10, analyticsEnabled: true, aiToolsEnabled: true },
        ENTERPRISE: { maxListings: 999, featuredListings: 30, analyticsEnabled: true, aiToolsEnabled: true, verifiedBadge: true, prioritySupport: true },
        DEALER: { maxListings: 500, featuredListings: 20, analyticsEnabled: true, aiToolsEnabled: true, verifiedBadge: true },
        AGENCY: { maxListings: 999, featuredListings: 50, analyticsEnabled: true, aiToolsEnabled: true, verifiedBadge: true, prioritySupport: true },
      };

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: plan as any,
          status: sub.status,
          stripeSubscriptionId: sub.id,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          ...planFeatures[plan],
        },
        create: {
          userId,
          plan: plan as any,
          status: sub.status,
          stripeSubscriptionId: sub.id,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          ...planFeatures[plan],
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: "FREE",
          status: "cancelled",
          cancelledAt: new Date(),
          maxListings: 5,
          featuredListings: 0,
          analyticsEnabled: false,
          aiToolsEnabled: false,
          verifiedBadge: false,
          prioritySupport: false,
        },
      });
      break;
    }
  }

  return { received: true };
}
