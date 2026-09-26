# SimbaSMS - SMS Verification Platform

A complete SMS verification-as-a-service platform where users can buy real phone numbers to receive verification codes from services like Gmail, OpenAI, WhatsApp, Tinder, and more.

## 🦁 Features

- **Real SIM Numbers**: Only carrier-grade SIM numbers (no VoIP)
- **Paystack Integration**: Fund wallet with Momo, debit card, or bank transfer
- **Multi-Provider Support**: VirtualSMS, 5sim, and extensible provider abstraction
- **Real-time Updates**: WebSocket push for SMS codes as they arrive
- **Automatic Failover**: Provider routing with failure tracking and auto-switch
- **Secure**: JWT authentication, idempotent webhooks, kobo-based amounts

## 🏗️ Architecture

```
simba-sms/
├── apps/
│   ├── api/          # NestJS backend (port 4000)
│   └── web/          # Next.js 14 frontend (port 3000)
├── packages/
│   └── shared/       # Shared types and constants
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### 1. Clone and Install

```bash
cd "d:\Arthium Labs LLC\simbasms"
npm install
```

### 2. Start Database and Redis

Using Docker:
```bash
docker-compose up -d
```

Or use existing PostgreSQL and Redis instances.

### 3. Configure Backend

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Random secret for JWT signing
- `PAYSTACK_SECRET_KEY`: Your Paystack secret key
- `VIRTUALSMS_API_KEY`: VirtualSMS API key
- `FIVESIM_API_KEY`: 5sim API key

### 4. Setup Database

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 5. Start Backend

```bash
cd apps/api
npm run dev
```

Backend runs on `http://localhost:4000`

### 6. Start Frontend

```bash
cd apps/web
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📁 Project Structure

### Backend (NestJS)

- `src/auth/` - JWT authentication (register, login, me)
- `src/wallet/` - Wallet balance and transactions
- `src/payments/` - Paystack integration
- `src/orders/` - Order state machine and management
- `src/providers/` - SMS provider abstraction layer
  - `interfaces/` - Provider interface definition
  - `virtualsms/` - VirtualSMS implementation
  - `fivesim/` - 5sim implementation
  - `provider-router.ts` - Provider routing with failover
- `src/websocket/` - Socket.io gateway + BullMQ polling
- `src/webhooks/` - Paystack webhook handler (idempotent)

### Frontend (Next.js 14)

- `app/(auth)/` - Login and register pages
- `app/(dashboard)/dashboard/` - User dashboard
  - `wallet/` - Top-up and transaction history
  - `buy/` - Buy phone numbers
  - `orders/` - Order history and status

### Shared Package

- `packages/shared/src/index.ts` - Types, constants, and enums

## 🔑 Key Implementation Details

### 1. Amount Storage

All amounts stored in **kobo** (1 NGN = 100 kobo) as integers. Never use floats.

```typescript
const amountKobo = 10000; // ₦100.00
```

### 2. Paystack Webhook Idempotency

Webhooks are deduplicated by `paystackRef`:

```typescript
const existing = await prisma.transaction.findUnique({
  where: { paystackRef }
});
if (existing) return; // Already processed
```

### 3. Provider Abstraction

All providers implement the `SmsProvider` interface:

```typescript
interface SmsProvider {
  getPrice(service: string, country: string): Promise<number | null>;
  buyNumber(service: string, country: string): Promise<{...}>;
  checkSms(providerOrderId: string): Promise<{...}>;
  cancelOrder(providerOrderId: string): Promise<boolean>;
  getBalance(): Promise<number>;
}
```

### 4. Order State Machine

```
PURCHASED → WAITING → RECEIVED (charge user, complete)
                   ↓
                EXPIRED (refund user)
                   ↓
                REFUNDED (after provider confirms)
```

### 5. WebSocket Authentication

Socket.io connections require JWT in handshake:

```typescript
const socket = io('http://localhost:4000', {
  auth: { token: 'your-jwt-token' }
});
```

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `GET /auth/me` - Get current user (requires JWT)

### Wallet

- `GET /wallet/balance` - Get wallet balance
- `POST /wallet/deposit` - Initialize Paystack deposit
- `GET /wallet/transactions` - Get transaction history

### Orders

- `GET /orders/services` - List supported services
- `GET /orders/services/:service/price?country=US` - Get price
- `POST /orders` - Buy number
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/cancel` - Cancel order

### Webhooks

- `POST /payments/webhook` - Paystack webhook (idempotent)

## 🔒 Security

- JWT authentication for all protected routes
- Paystack webhook signature verification (HMAC-SHA512)
- Idempotent webhook processing
- Provider API keys never exposed to frontend
- All amounts in kobo (no float precision issues)
- Sensitive logs redacted (phone numbers, SMS content)

## 🌍 Supported Services

- Gmail
- OpenAI
- WhatsApp
- Tinder
- Telegram
- Facebook
- Twitter
- Instagram
- TikTok
- Uber

## 🌍 Supported Countries

- US, UK, NG, GH, KE, ZA, CA, DE, FR, IN

## 🧪 Testing

```bash
# Backend tests
cd apps/api
npm test

# Frontend tests
cd apps/web
npm test
```

## 🚢 Deployment

### Backend (Railway/Render)

1. Set environment variables
2. Connect PostgreSQL and Redis
3. Deploy from Git

### Frontend (Vercel)

1. Connect repository
2. Set root directory: `apps/web`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.simbasms.com`
   - `NEXT_PUBLIC_WS_URL=https://api.simbasms.com`

### Database (Supabase)

1. Create PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`

## 📝 Environment Variables

### Backend (apps/api/.env)

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."
PAYSTACK_WEBHOOK_SECRET="..."
VIRTUALSMS_API_KEY="..."
FIVESIM_API_KEY="..."
APP_BASE_URL="https://api.simbasms.com"
FRONTEND_URL="https://simbasms.com"
PORT=4000
```

### Frontend (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

## 📄 License

Proprietary - SimbaSMS

## 🤝 Support

For support, email support@simbasms.com

---

Built with ❤️ by the SimbaSMS team
