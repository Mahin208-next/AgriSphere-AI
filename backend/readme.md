# AgriSphere MarketLink AI - Backend

> **A Two-Way AI-Powered Agricultural Trading & Market Intelligence Platform**  
> FarmMarket Challenge | International Builder Hackathon 2026

---

## 🌾 Overview

AgriSphere MarketLink AI Backend is a production-minded Node.js, Express, and Prisma service providing real-time bidding, reverse procurement with split fulfillment, DAM 64-district market intelligence, and Haversine AI logistics calculations.

---

## 📁 Directory Structure

```
backend/
├── node_modules/
├── prisma/
│   └── schema.prisma        # Complete database schema (User, Listing, Auction, Bid, etc.)
├── src/
│   ├── @types/              # Shared TypeScript definitions
│   ├── config/              # Environment configurations (Port 8000, JWT, CORS)
│   ├── controllers/         # HTTP Controller handlers
│   ├── helpers/             # Geo Haversine matrix, transport tariffs, matching logic
│   ├── middlewares/         # JWT Auth, Zod validation, error handler, request logger
│   ├── models/              # Prisma client and in-memory ACID fallback store
│   ├── routes/              # Express API versioned routes (/api/v1/...)
│   ├── services/            # Core business logic (Auctions, Procurement, Prices)
│   └── validators/          # Zod schema validators
├── server.ts                # Express server entry point (Port 8000)
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── biome.json               # Biome linter/formatter config
├── package.json             # Scripts & dependencies
└── readme.md                # Backend documentation
```

---

## 🚀 Running the Server on Port 8000

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The server starts by default on **`http://localhost:8000`**.

- **Web App / Unified UI:** `http://localhost:8000/`
- **Health check:** `http://localhost:8000/health`
- **API Base:** `http://localhost:8000/api/v1/`
- **Real-Time SSE:** `http://localhost:8000/api/v1/realtime`
