# AgriSphere MarketLink AI — REST API Documentation

All platform endpoints are versioned under `/api/v1`.

---

## 1. Authentication & Profiles
- `GET /api/v1/auth/me`: Returns currently active user session, associated profiles, and all demo user accounts.
- `POST /api/v1/auth/me`: 
  - Switch active role session: `{ "switchUserId": "usr_buyer_mokbul" }`
  - Register new user: `{ "action": "register", "name": "...", "role": "farmer", ... }`

---

## 2. Product Listings
- `GET /api/v1/listings`: Query parameters: `cropId`, `district`, `isAuction`, `farmerId`.
- `POST /api/v1/listings`: Create new listing or initiate a live auction.
- `GET /api/v1/listings/{id}`: Listing details (hides private reserve price unless owner or admin).
- `DELETE /api/v1/listings/{id}`: Delete listing.

---

## 3. Two-Way Trading Engine

### System A: Live Auctions
- `GET /api/v1/auctions`: Returns all auctions. Auto-closes expired auctions server-side.
- `GET /api/v1/auctions/{id}`: Single auction state with immutable bid history and server timestamp.
- `POST /api/v1/auctions/{id}/bids`: Place an atomic bid.
  - Payload: `{ "amount": 145, "isAnonymous": false }`
  - Triggers anti-snipe time extension if placed within 2 minutes of close.
- `POST /api/v1/auctions/{id}/accept-offer`: Farmer accepts highest bid; generates official `Order` record.

### System B: Buyer Bulk Procurement & Reverse Offers
- `GET /api/v1/procurement`: Returns open procurement requests.
- `POST /api/v1/procurement`: Buyer/Factory publishes bulk requirements.
  - Payload: `{ "cropId": "tomato", "requiredQuantity": 15000, "maxBudgetPerUnit": 38, ... }`
- `GET /api/v1/procurement/{id}/offers`: Received farmer reverse offers.
- `POST /api/v1/procurement/{id}/offers`: Farmer submits reverse supply offer.
- `POST /api/v1/offers/{id}/accept`: Buyer accepts offer; updates fulfilled quantity and creates `Order`.

### System C: Direct Contract Proposals
- `GET /api/v1/contracts`: List contracts for current user.
- `POST /api/v1/contracts`: Factory proposes direct forward contract.
- `PATCH /api/v1/contracts/{id}`: Farmer accepts, rejects, or negotiates proposal.

---

## 4. Market Intelligence & Decision Engines
- `GET /api/v1/prices`: Current daily wholesale and retail prices from DAM.
- `GET /api/v1/prices/compare?cropId={id}`: Compares wholesale prices across all markets.
- `GET /api/v1/prices/trends?cropId={id}&days=30`: 7-day and 30-day time-series for Recharts visualization.
- `POST /api/v1/recommendations/markets`: AI Net-Return Selling Engine.
  - Payload: `{ "cropId": "green_chilli", "originDistrict": "Bogura", "quantityKg": 2000 }`
  - Returns ranked markets, transport cost estimates, and net return margins.
- `GET /api/v1/matching/listings/{id}`: Explainable buyer-farmer matching scores.

---

## 5. Global Opportunity Radar
- `GET /api/v1/export/rfqs`: International buyer RFQs with destination port and quality specs.
- `POST /api/v1/export/rfqs`: Importer creates new RFQ.
- `POST /api/v1/export/rfqs/{id}/offers`: Exporter submits formal quotation (FOB Price USD/kg).

---

## 6. AI & Administration
- `POST /api/v1/assistant/chat`: Conversational RAG assistant in Bangla/English.
- `GET /api/v1/admin/overview`: System statistics, audit logs, and oversupply alerts.
- `POST /api/v1/admin/prices/import`: Validates and imports official DAM CSV price records.
- `GET /api/v1/realtime`: Server-Sent Events (SSE) stream for instant bid and trade updates.

