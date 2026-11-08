# AgriSphere MarketLink AI — Architecture & Technical Design

## 1. Executive Summary
**AgriSphere MarketLink AI** is an integrated two-way agricultural trading and market intelligence platform designed to eliminate information asymmetry and dismantle exploitative intermediary syndicates across Bangladesh.

### Core Tagline
> **Connecting Every Farmer to Every Market**

---

## 2. Platform Architecture

AgriSphere MarketLink AI follows a unified full-stack architecture built on Next.js 14 (App Router) and TypeScript.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / USER INTERFACE                         │
│  - Farmer Dashboard      - Buyer & Factory Terminal  - Exporter Radar │
│  - Live Auction Arena    - DAM Market Price Hub      - Bangla AI Bot  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / SSE Stream
┌───────────────────────────────────▼────────────────────────────────────┐
│                    API ROUTING & LOGIC LAYER (/api/v1)                 │
│  - /auth & /profiles     - /auctions & /bids (Anti-snipe, atomic)      │
│  - /procurement & offers - /recommendations/markets (Net-return engine)│
│  - /prices & /trends     - /assistant/chat (Grounded RAG)              │
│  - /export/rfqs & quotes - /admin/overview & CSV price import          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  DATA & REAL-TIME EVENT BUS (Singleton)                │
│  - Relational Database Engine with ACID Atomic Operations              │
│  - Anti-snipe time-extension scheduler (Server-time validated)         │
│  - Bangladesh 64-District Geolocation & Road Haulage Tariffs           │
│  - Server-Sent Events (SSE) Broadcast Engine                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Two-Way Trading Innovation

### System A: Farmer-Initiated Live Auctions
- **Seller Empowerment:** Farmers list crops specifying minimum starting price, acceptable bid increment, and private reserve price.
- **Anti-Snipe Protection:** If a valid bid arrives within the last 2 minutes (`antiSnipeWindowSeconds: 120`), the server automatically extends the clock by 2 minutes (`autoExtendTimeSeconds: 120`).
- **Server-Side Validation:** Prevents seller self-bidding, duplicate lower bids, or sub-increment increments.
- **Farmer Final Approval:** Highest bid does not force sale; farmer retains final decision before formal Order generation.

### System B: Buyer-Initiated Procurement & Reverse Offers
- **Institutional Scale:** Factories, rice mills, and supermarkets publish bulk purchasing requirements.
- **Split-Fulfillment Support:** Multiple smallholder farmers can collectively supply a large order.
- **Reverse Supply Offers:** Farmers propose custom price, quantity, and delivery timeline directly.

### System C: Direct Contract Proposals
- Long-term forward delivery agreements with fixed or negotiable pricing and milestone payment terms.

---

## 4. Market Intelligence & Decision Engines

### 1. DAM Bangladesh Market Price Synchronization
- Captures daily wholesale and retail records across terminal markets (Karwan Bazar, Shyambazar, Jatrabari) and production hubs (Mahasthangarh Bogura, Baneswar Rajshahi, Board Bazar Gazipur).
- Time-series tracking for 7-day and 30-day price trends.

### 2. AI Net-Return Selling Recommendation Formula
$$\text{Net Estimated Return} = (\text{Market Price} \times \text{Quantity}) - \text{Transport Cost} - \text{Handling/Mandi Fees}$$
- Incorporates distance ($km$), vehicle freight model, and crop perishability factors.

### 3. Explainable Buyer-Farmer Matcher
$$\text{Match Score} = 0.35 \times Q_{\text{comp}} + 0.30 \times L_{\text{comp}} + 0.20 \times P_{\text{comp}} + 0.15 \times T_{\text{comp}}$$

### 4. Grounded Bangla AI Assistant
- Bilingual conversational assistant supporting Bangla, English, and Banglish.
- RAG architecture citing actual data freshness dates without price hallucinations.
