import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM ?? "Crown Registry <hello@crownregistry.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "support@crownregistry.com";

// ── Templates ──────────────────────────────────

function baseLayout(content: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Crown Registry</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#080600;border:1px solid rgba(201,168,76,0.2);padding:32px 40px;text-align:center;">
            <span style="display:inline-block;width:32px;height:32px;border:1px solid #C9A84C;
                         text-align:center;line-height:32px;color:#C9A84C;font-size:16px;
                         margin-bottom:12px;">♛</span>
            <p style="margin:0;font-size:14px;letter-spacing:0.3em;color:#F0EAD0;text-transform:uppercase;
                      font-weight:600;">Crown Registry</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="background:#0A0A0A;border:1px solid rgba(201,168,76,0.1);border-top:none;padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;">
            <p style="margin:0;color:#444;font-size:11px;">
              © ${new Date().getFullYear()} Crown Registry Ltd · 
              <a href="https://crownregistry.com/legal/privacy" style="color:#666;">Privacy</a> · 
              <a href="https://crownregistry.com/legal/terms" style="color:#666;">Terms</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function goldButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;
          background:linear-gradient(135deg,#C9A84C,#8B6914);color:#fff;
          text-decoration:none;font-size:11px;letter-spacing:0.2em;
          text-transform:uppercase;margin:20px 0;">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:28px;font-weight:300;color:#F0EAD0;
          font-family:Georgia,serif;line-height:1.2;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:#888;line-height:1.8;">${text}</p>`;
}

// ── Email functions ────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(" ")[0];
  const html = baseLayout(`
    ${h1(`Welcome, ${firstName}`)}
    ${p("Your Crown Registry account is now active. You have access to the world's most exclusive marketplace for ultra-luxury assets.")}
    ${p("Start by exploring extraordinary listings across hypercars, superyachts, private jets, and palatial estates.")}
    ${goldButton("https://crownregistry.com/marketplace", "Explore the Marketplace")}
    ${p("If you have any questions, our concierge team is available 24/7.")}
  `, `Welcome to Crown Registry, ${firstName}`);

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Welcome to Crown Registry, ${firstName}`,
    html,
  });
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const html = baseLayout(`
    ${h1("Verify Your Email")}
    ${p("Please verify your email address to activate all features of your Crown Registry account.")}
    ${goldButton(verifyUrl, "Verify Email Address")}
    ${p("This link expires in 24 hours. If you didn't create an account, please ignore this email.")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: "Verify your Crown Registry email",
    html,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const html = baseLayout(`
    ${h1("Reset Your Password")}
    ${p("We received a request to reset your password. Click the button below to create a new password.")}
    ${goldButton(resetUrl, "Reset Password")}
    ${p("This link expires in 1 hour. If you didn't request a reset, please contact support immediately.")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: "Reset your Crown Registry password",
    html,
  });
}

export async function sendNewOfferEmail(
  to: string,
  sellerName: string,
  listingTitle: string,
  offerAmount: string,
  currency: string,
  offerId: string
) {
  const html = baseLayout(`
    ${h1("New Offer Received")}
    ${p(`You have received an offer on your listing: <strong style="color:#F0EAD0;">${listingTitle}</strong>`)}
    <div style="border:1px solid rgba(201,168,76,0.2);padding:20px;margin:20px 0;background:rgba(201,168,76,0.03);">
      <p style="margin:0;font-size:28px;color:#C9A84C;font-family:Georgia,serif;font-weight:300;">
        ${currency} ${offerAmount}
      </p>
      <p style="margin:4px 0 0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.2em;">
        Offer Amount
      </p>
    </div>
    ${p("This offer expires in 48 hours. Accept, reject, or make a counter-offer in your dashboard.")}
    ${goldButton(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/offers`, "Respond to Offer")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `New offer on "${listingTitle}"`,
    html,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  buyerName: string,
  orderNumber: string,
  listingTitle: string,
  amount: string,
  currency: string
) {
  const html = baseLayout(`
    ${h1("Order Confirmed")}
    ${p(`Thank you for your purchase, ${buyerName.split(" ")[0]}. Your order has been confirmed and payment is held securely in escrow.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(201,168,76,0.15);margin:20px 0;">
      ${[
        ["Order Number", orderNumber],
        ["Asset", listingTitle],
        ["Amount", `${currency} ${amount}`],
        ["Status", "Payment held in escrow"],
      ].map(([label, value]) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(201,168,76,0.08);
                     font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.15em;width:40%;">${label}</td>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(201,168,76,0.08);
                     font-size:13px;color:#F0EAD0;">${value}</td>
        </tr>
      `).join("")}
    </table>
    ${p("Funds will be released to the seller once you confirm delivery. Our concierge team will be in touch to arrange logistics.")}
    ${goldButton(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buyer/orders`, "Track Your Order")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Order confirmed: ${listingTitle}`,
    html,
  });
}

export async function sendListingApprovedEmail(to: string, listingTitle: string, slug: string) {
  const html = baseLayout(`
    ${h1("Listing Approved")}
    ${p(`Your listing <strong style="color:#F0EAD0;">${listingTitle}</strong> has been reviewed and approved. It is now live on Crown Registry.`)}
    ${goldButton(`${process.env.NEXT_PUBLIC_APP_URL}/listing/${slug}`, "View Your Listing")}
    ${p("Consider upgrading to a featured listing to maximise visibility to our global audience of UHNW buyers.")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your listing is live: ${listingTitle}`,
    html,
  });
}

export async function sendListingRejectedEmail(to: string, listingTitle: string, reason: string) {
  const html = baseLayout(`
    ${h1("Listing Requires Changes")}
    ${p(`Your listing <strong style="color:#F0EAD0;">${listingTitle}</strong> requires some changes before it can be published.`)}
    <div style="border-left:2px solid #C9A84C;padding:12px 20px;margin:20px 0;background:rgba(201,168,76,0.03);">
      <p style="margin:0;font-size:13px;color:#888;font-style:italic;">${reason}</p>
    </div>
    ${p("Please update your listing and resubmit for review.")}
    ${goldButton(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/listings`, "Edit Listing")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Action required: ${listingTitle}`,
    html,
  });
}

export async function sendNewMessageEmail(
  to: string,
  recipientName: string,
  senderName: string,
  preview: string,
  conversationId: string
) {
  const html = baseLayout(`
    ${h1("New Message")}
    ${p(`<strong style="color:#F0EAD0;">${senderName}</strong> sent you a message:`)}
    <div style="border:1px solid rgba(201,168,76,0.15);padding:16px 20px;margin:20px 0;background:rgba(201,168,76,0.02);">
      <p style="margin:0;font-size:14px;color:#aaa;font-style:italic;">"${preview.slice(0, 200)}${preview.length > 200 ? "…" : ""}"</p>
    </div>
    ${goldButton(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buyer/messages`, "Reply")}
  `);

  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `New message from ${senderName}`,
    html,
  });
}
