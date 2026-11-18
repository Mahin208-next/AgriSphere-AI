# KrishiSetu AI - Standalone Backend API

> **KrishiSetu AI — Connecting Farmers to Every Market**  
> Standalone Node.js + Express + TypeScript + Prisma REST API & Real-time SSE Server

---

## 🌾 Overview

This is the standalone backend service for **KrishiSetu AI**. It can be deployed independently to cloud platforms like **Render**, **Railway**, **Fly.io**, **Heroku**, **AWS**, **DigitalOcean**, or any virtual private server (VPS).

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js (v4.21+) with TypeScript
- **Database/ORM**: Prisma ORM with in-memory ACID fallback store + seed dataset
- **Real-Time Engine**: Server-Sent Events (SSE) on `/api/v1/realtime` for live auctions
- **CORS**: Fully configured for cross-origin access from any frontend domain

---

## 📁 Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma        # Complete database schema (User, Listing, Auction, Bid, etc.)
├── src/
│   ├── @types/              # Shared TypeScript definitions
│   ├── config/              # Environment configurations (Port 5000, JWT, CORS)
│   ├── controllers/         # Express Controller handlers
│   ├── helpers/             # Geo Haversine matrix, transport tariffs, matching logic
│   ├── middlewares/         # Auth, Zod validation, error handler, request logger
│   ├── models/              # Prisma client and in-memory ACID store
│   ├── routes/              # Express API versioned routes (/api/v1/...)
│   │   ├── auth.routes.ts
│   │   ├── auction.routes.ts
│   │   ├── listing.routes.ts
│   │   ├── alert.routes.ts
│   │   ├── contract.routes.ts
│   │   ├── order.routes.ts
│   │   ├── procurement.routes.ts
│   │   ├── price.routes.ts
│   │   ├── recommendation.routes.ts
│   │   ├── assistant.routes.ts
│   │   ├── export.routes.ts
│   │   └── admin.routes.ts
│   ├── services/            # Core business logic (Auctions, Procurement, Prices)
│   └── validators/          # Zod schema validators
├── server.ts                # Express server entry point (Default Port: 5000)
├── .env.example             # Template for production environment variables
└── package.json             # Scripts & dependencies
```

---

## 🚀 Running Standalone Backend Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server on port 5000
npm run dev
```

The server starts by default on **`http://localhost:5000`**.

- **Health check:** `http://localhost:5000/health`
- **API Base:** `http://localhost:5000/api/v1/`
- **Real-Time SSE:** `http://localhost:5000/api/v1/realtime`

---

## 🌐 Deploying to Cloud (Render / Railway / VPS)

### Environment Variables
Set these environment variables on your cloud hosting dashboard:

| Variable | Recommended Value | Description |
|---|---|---|
| `PORT` | `5000` (or host provided) | Server listening port |
| `NODE_ENV` | `production` | Production environment |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Allowed frontend origin(s) |
| `JWT_SECRET` | `your-secure-random-secret` | Authentication token secret |

### Deploy to Render
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository: `https://github.com/Mahin208-next/AgriSphere-AI.git`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install && npm run build` (or `npm install`).
5. Set **Start Command** to `npm start` (or `npx tsx server.ts`).
6. Copy your public service URL (e.g. `https://krishisetu-api.onrender.com`).
7. In your Frontend host (e.g. Vercel), set `NEXT_PUBLIC_API_URL=https://krishisetu-api.onrender.com`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & service status |
| `GET` | `/api/v1/auth/me` | Current authenticated user & demo accounts |
| `POST` | `/api/v1/auth/me` | Switch active role or register user |
| `GET` | `/api/v1/auctions` | List active live auctions |
| `GET` | `/api/v1/auctions/:id/bids` | Get bid history for an auction |
| `POST` | `/api/v1/auctions/:id/bids` | Submit a real-time bid |
| `POST` | `/api/v1/auctions/:id/accept-offer` | Farmer accepts winning bid |
| `GET` | `/api/v1/listings` | Get crop listings |
| `POST` | `/api/v1/listings` | Add new listing / start live auction |
| `GET` | `/api/v1/procurement` | List buyer procurement demands |
| `POST` | `/api/v1/procurement` | Post institutional procurement demand |
| `GET` | `/api/v1/prices` | DAM wholesale and retail prices |
| `POST` | `/api/v1/recommendations/markets` | AI net-return logistics recommendation |
| `POST` | `/api/v1/assistant/chat` | AI agricultural market assistant |
| `GET` | `/api/v1/export/rfqs` | International export RFQ list |
| `GET` | `/api/v1/admin/overview` | Platform oversight & GMV stats |
| `POST` | `/api/v1/admin/prices/import` | Bulk CSV market price override |
| `GET` | `/api/v1/realtime` | Server-Sent Events (SSE) live updates |
