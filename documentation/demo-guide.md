# AgriSphere MarketLink AI — Hackathon Live Demonstration Guide

Welcome to the AgriSphere MarketLink AI live demonstration walkthrough. This guide walks hackathon judges step-by-step through the 5 core workflows defined in the Acceptance Criteria.

---

## Quick Persona Switcher

Use the **"Active Role / বর্তমান প্রোফাইল"** dropdown at the top right of the navigation bar to switch between user personas with one click:
- **Md. Rafiqul Islam (Farmer)**: Smallholder farmer from Bogura.
- **Haji Mokbul Enterprise (Buyer / Aratdar)**: Karwan Bazar wholesale trader.
- **ACI & Pran Foods Hub (Factory / Mill)**: Agro-industrial food processor.
- **Shwapno Sourcing Hub (Retailer)**: Modern supermarket procurement chain.
- **Bengal Fresh Exports (Exporter)**: International agricultural aggregator.
- **Al-Madina General Trading LLC (Importer)**: Dubai-based international fresh food importer.
- **AgriSphere Administrator (Admin)**: Regulatory authority & DAM auditor.

---

## Workflow A: Farmer Live Auction & Real-Time Bidding (System A)

1. **Farmer Perspective:**
   - Switch role to **Md. Rafiqul Islam (Farmer)**.
   - Navigate to `/dashboard` or `/auctions`.
   - Observe active live auctions (e.g., 1,800 kg Green Chilli).
   - Click **"+ Add Crop / Start Live Auction"** to create a new auction listing (e.g. 2,000 kg Sweet Pumpkin, Starting: BDT 20/kg, Reserve: BDT 22/kg).

2. **Buyer Bidding:**
   - Switch role to **Haji Mokbul Enterprise (Buyer)**.
   - Go to `/auctions`.
   - Submit a bid of **BDT 145/kg** on the Green Chilli auction.
   - Observe instant UI feedback, server-side validation, and the bid appearing in the Immutable Bid History.
   - Notice the anti-snipe clock extension rule: bidding in the final 2 minutes adds 2 minutes to ensure fair competition.

3. **Farmer Acceptance & Order Creation:**
   - Switch back to **Md. Rafiqul Islam (Farmer)**.
   - On the auction card, click **"Accept Offer & Generate Order"**.
   - Verify the auction transitions to **"Sold & Completed"**, and an official `Order` record is generated in `/dashboard`.

---

## Workflow B: Buyer Procurement & Reverse Supply Offers (System B)

1. **Factory Procurement Post:**
   - Switch role to **ACI & Pran Foods Hub (Factory)**.
   - Navigate to `/procurement` or `/dashboard`.
   - Click **"Post Procurement Request"**:
     - Crop: Tomato
     - Quantity: 15,000 kg (Processing Grade)
     - Budget: BDT 38/kg
     - Destination: Gazipur Agro-Processing Mill
     - Toggle: Split Supply Permitted.
   - Submit the request.

2. **Farmer Submits Supply Offer:**
   - Switch role to **Md. Rafiqul Islam (Farmer)**.
   - Navigate to `/procurement`.
   - Find the Pran Foods Tomato procurement card.
   - Click **"Submit Supply Offer"**:
     - Quantity: 2,500 kg
     - Price: BDT 36/kg
     - Delivery: In 3 days from Sherpur, Bogura.
   - Submit the offer.

3. **Factory Accepts Offer:**
   - Switch role back to **ACI & Pran Foods Hub (Factory)**.
   - Click **"Farmer Offers Received"** on the procurement card.
   - Review Rafiqul's offer and click **"Accept Offer"**.
   - Observe the procurement fulfilled quantity updating (e.g., +2,500 kg) and an official `Order` created!

---

## Workflow C: National Market Intelligence & AI Net-Return Engine

1. Navigate to `/market-intelligence`.
2. Select **Green Chilli (কাঁচা মরিচ)**.
3. Review today's wholesale vs. retail benchmark prices from the **Department of Agricultural Marketing (DAMBD)** across Bogura, Dhaka, Gazipur, and Chattogram.
4. Interact with the **Recharts 7-day and 30-day price trend chart** comparing Dhaka Karwan Bazar with Bogura Mahasthangarh.
5. Click the **"AI Net-Return Engine"** tab:
   - Select **Bogura** as Origin District.
   - Enter **2,000 kg** volume.
   - Observe the side-by-side market ranking:
     - **#1 Recommended Market**: Karwan Bazar, Dhaka (Net margin: +87%, factoring in distance and freight haulage).
     - Full calculation breakdown: Gross Revenue - Transport Cost - Handling Fees = Net Return.

---

## Workflow D: Grounded Bangla AI Market Assistant

1. Navigate to `/assistant`.
2. Click any of the quick-prompt chips or type a question in Bangla:
   - *"আজকে কাঁচা মরিচের পাইকারি দাম কত?"*
   - *"আমার ২ টন আলু কোথায় বিক্রি করলে বেশি লাভ হবে?"*
   - *"কোন factory টমেটো কিনতে চাচ্ছে?"*
   - *"বিদেশে আম রপ্তানি করতে কী কী কাগজপত্র প্রয়োজন?"*
3. Verify that the assistant answers with precise, contextual platform data, dates, and DAM source citations without hallucinating fabricated prices.

---

## Workflow E: Global Opportunity Radar (International Export)

1. Switch role to **Al-Madina General Trading LLC (Importer)**.
2. Navigate to `/export`.
3. View existing RFQs from the UAE and UK.
4. Click **"Post International RFQ"** (e.g. 15 Tonnes Green Chilli to Dubai Airport, target FOB $1.85/kg).
5. Switch role to **Bengal Fresh Agro Exports (Exporter)**.
6. Click **"Submit Exporter Quotation"** on the RFQ:
   - Enter FOB Price USD $1.78/kg.
   - Specify lead time: 4 days.
   - Review the required phytosanitary compliance standards.
   - Submit quote.

---

## Workflow F: System Administration & Audit Logs

1. Switch role to **AgriSphere Platform Admin**.
2. Navigate to `/dashboard`.
3. Review:
   - Real-time immutable audit trail showing all placed bids, accepted offers, and RFQ postings.
   - Official DAM Price CSV Importer tool: test importing a batch of prices.
   - Regional Oversupply & Price Risk alerts (e.g. Bogura Green Chilli surplus).
