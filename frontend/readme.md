# AgriSphere MarketLink AI - Frontend

> **A Two-Way AI-Powered Agricultural Trading & Market Intelligence Platform**  
> KrishiSetu AI — Connecting Farmers to Every Market

---

## 🌾 Overview

AgriSphere MarketLink AI Frontend is built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts. It provides a real-time, bilingual (Bangla / English) agricultural trading floor designed for both rural farmers and enterprise food factories.

---

## 📁 Directory Structure

```
frontend/
├── node_modules/
├── src/
│   ├── @types/          # Comprehensive TypeScript models & trading contracts
│   ├── api/             # Typed API clients (Auction, Procurement, Price, Export, RAG Assistant)
│   ├── assets/          # SVG logos and media
│   ├── components/      # UI components (Header, Footer, LiveAuctionCard, ProcurementCard, etc.)
│   ├── hooks/           # useAuth, useAuctions, usePrices, useRealtime (SSE)
│   ├── pages/           # Home, Auctions, Procurement, MarketIntelligence, Assistant, ExportRadar, Dashboard
│   ├── routes/          # AppRoutes router
│   ├── templates/       # MainLayout template with floating Bangla AI assistant
│   ├── themes/          # Color palettes, typography and theme tokens
│   ├── utils/           # i18n dictionary, formatters (BDT, Kg, dates), constants
│   └── validators/      # Form input validators
├── app.tsx              # Root App component with AuthProvider and MainLayout
├── main.tsx             # Entry point mounting root DOM
├── vite-env.d.ts        # Vite environment declarations
├── .env                 # Environment variables (VITE_API_URL=/api/v1)
├── .gitignore           # Git ignore rules
├── biome.json           # Biome linter/formatter config
├── index.html           # HTML template with Noto Sans Bengali & Inter fonts
├── package.json         # Package scripts & dependencies (Port 8000)
├── readme.md            # Frontend documentation
└── tailwind.config.ts   # Agricultural & earth color palette configuration
```

---

## 🚀 Running the Frontend on Port 8000

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server on Port 8000
npm run dev
```

The frontend will run at **`http://localhost:8000`**.
Vite is preconfigured to bind directly to port 8000.
