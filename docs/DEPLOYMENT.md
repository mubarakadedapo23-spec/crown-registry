# Crown Registry — Complete Deployment Guide

## Overview

Crown Registry is a production-ready luxury marketplace built with Next.js 15, PostgreSQL, Redis, and Elasticsearch. This guide covers everything from local development to production deployment.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Docker | 24+ |
| Docker Compose | v2+ |
| PostgreSQL | 16+ |
| Redis | 7+ |

---

## 1. Local Development

### Clone and install

```bash
git clone https://github.com/yourorg/crown-registry.git
cd crown-registry
npm install --legacy-peer-deps
```

### Environment setup

```bash
cp .env.example .env.local
# Fill in all required values in .env.local
```

**Minimum required for local dev:**
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=any-random-string-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### Database setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### Start development server

```bash
npm run dev
```

Visit http://localhost:3000

**Demo accounts (after seeding):**
- Admin: `admin@crownregistry.com` / `Admin123!`
- Dealer: `monaco@crownregistry.com` / `User1234!`
- Buyer: `james.sterling@example.com` / `User1234!`

---

## 2. Docker Development Stack

Start the full stack (Postgres, Redis, Elasticsearch) locally:

```bash
# Start infrastructure only
docker compose up postgres redis elasticsearch -d

# Start app
npm run dev
```

Or run everything in Docker:

```bash
docker compose --profile dev up -d
```

Adminer (DB UI): http://localhost:8080

---

## 3. Production Deployment

### Option A: Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel dashboard
3. Add all environment variables from `.env.example`
4. Set build command: `npm run build`
5. Deploy

**Vercel add-ons to configure:**
- Database: Vercel Postgres or Neon
- Redis: Upstash Redis
- Storage: AWS S3 or Cloudflare R2

### Option B: Docker on VPS

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repo
git clone https://github.com/yourorg/crown-registry.git
cd crown-registry

# 3. Create env file
cp .env.example .env.local
nano .env.local  # fill in all values

# 4. Set postgres password
export POSTGRES_PASSWORD=your-secure-password

# 5. Build and start
docker compose up -d --build

# 6. Run migrations
docker compose exec app npx prisma migrate deploy

# 7. Seed database (first time only)
docker compose exec app npx tsx scripts/seed.ts
```

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt install certbot

# Get certificate
certbot certonly --webroot -w /var/www/certbot \
  -d crownregistry.com -d www.crownregistry.com

# Certificates will be at:
# /etc/letsencrypt/live/crownregistry.com/fullchain.pem
# /etc/letsencrypt/live/crownregistry.com/privkey.pem

# Copy to nginx ssl directory
cp /etc/letsencrypt/live/crownregistry.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/crownregistry.com/privkey.pem nginx/ssl/

# Restart nginx
docker compose restart nginx

# Auto-renew (add to crontab)
0 12 * * * certbot renew --quiet
```

---

## 4. Third-Party Service Setup

### Stripe

1. Create account at stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Create webhook endpoint: `https://crownregistry.com/api/payments/webhook`
4. Add events: `checkout.session.completed`, `customer.subscription.*`
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**Create subscription price IDs:**
```bash
stripe prices create --product=prod_xxx --unit-amount=9900 --currency=usd --recurring[interval]=month
```

Update `PLAN_PRICES` in `src/lib/actions/payments.ts` with your price IDs.

### Google OAuth

1. Go to console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://crownregistry.com/api/auth/callback/google`
5. Copy Client ID and Secret

### AWS S3

1. Create S3 bucket (e.g. `crown-registry-media`)
2. Set bucket policy for public read on CDN path
3. Create IAM user with S3 permissions
4. Set CORS on bucket:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["https://crownregistry.com"],
  "ExposeHeaders": ["ETag"]
}]
```

### Elasticsearch

If using Elastic Cloud:
1. Create deployment at cloud.elastic.co
2. Copy Cloud ID and API key
3. Update `ELASTICSEARCH_URL`

Initialize the search index after first boot:
```bash
curl -X POST https://crownregistry.com/api/admin/search/reindex \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Resend (Email)

1. Sign up at resend.com
2. Add and verify your domain
3. Create API key
4. Set `RESEND_API_KEY` and `EMAIL_FROM`

---

## 5. Database Migrations

```bash
# Development: auto-apply
npm run db:migrate

# Production: deploy only
npx prisma migrate deploy

# Reset (danger: drops all data)
npx prisma migrate reset
```

---

## 6. Redis Cache Management

```bash
# Connect to Redis
docker compose exec redis redis-cli

# Clear all cache
FLUSHALL

# View keys
KEYS crown:*

# Check memory
INFO memory
```

---

## 7. CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install
        run: npm ci --legacy-peer-deps

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
```

---

## 8. Monitoring & Observability

### Sentry (Error tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `.env.local`:
```
SENTRY_DSN=https://xxx@sentry.io/yyy
```

### PostHog (Analytics)

Already configured. Add to `.env.local`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

---

## 9. Performance Checklist

- [ ] Enable Redis caching (configured)
- [ ] Configure CDN for static assets (Cloudflare recommended)
- [ ] Enable Next.js ISR for listing pages
- [ ] Configure Elasticsearch index replicas for production
- [ ] Set up database connection pooling (PgBouncer)
- [ ] Enable image optimization via Cloudflare Images or similar
- [ ] Configure Vercel Edge Network or similar CDN

---

## 10. Security Checklist

- [ ] All environment variables set (no defaults in production)
- [ ] `NEXTAUTH_SECRET` is a random 32+ char string
- [ ] Stripe webhook signature verification enabled
- [ ] Rate limiting configured (Redis-backed)
- [ ] CORS configured correctly
- [ ] Database user has minimal permissions
- [ ] SSL certificate installed and auto-renewing
- [ ] Security headers configured (Nginx + Next.js)
- [ ] 2FA enabled for admin accounts

---

## Project Structure

```
crown-registry/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketplace)/      # Public marketplace pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── listing/[slug]/ # Listing detail
│   │   │   └── search/         # Search results
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # User dashboards
│   │   │   ├── buyer/          # Buyer dashboard
│   │   │   ├── seller/         # Seller dashboard
│   │   │   ├── dealer/         # Dealer dashboard
│   │   │   └── admin/          # Admin panel
│   │   ├── listings/new/       # Create listing
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── home/               # Homepage sections
│   │   ├── layout/             # Navbar, Footer
│   │   ├── listing/            # Listing components
│   │   ├── search/             # Search components
│   │   ├── dashboard/          # Dashboard components
│   │   └── providers/          # Context providers
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── prisma.ts           # Database client
│   │   ├── redis.ts            # Redis client + cache
│   │   ├── search.ts           # Elasticsearch client
│   │   ├── email.ts            # Resend email service
│   │   ├── utils.ts            # Utilities
│   │   └── actions/            # Server Actions
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Complete DB schema
├── scripts/
│   └── seed.ts                 # Demo data seed
├── nginx/
│   └── nginx.conf              # Production Nginx config
├── docker-compose.yml          # Full Docker stack
├── Dockerfile                  # Production container
└── .env.example                # All env variables
```

---

## Support

For questions about deployment, contact: engineering@crownregistry.com

© 2026 Crown Registry Ltd.
