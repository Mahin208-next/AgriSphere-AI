# AgriSphere MarketLink AI — Relational Database Schema

## Entity-Relationship Overview

The platform uses a fully relational structure with strict foreign-key semantics and ACID transactional guarantees.

### 1. `users`
- `id` (UUID/String, PK)
- `name` (VARCHAR)
- `nameBn` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `phone` (VARCHAR, UNIQUE)
- `role` (ENUM: 'farmer', 'buyer', 'factory', 'retailer', 'exporter', 'importer', 'admin')
- `district` (VARCHAR)
- `upazila` (VARCHAR)
- `verified` (BOOLEAN)
- `companyName` (VARCHAR, NULLABLE)
- `createdAt` (TIMESTAMP)

### 2. `farmer_profiles`
- `userId` (FK -> users.id, PK)
- `farmName` (VARCHAR)
- `totalAcreage` (DECIMAL)
- `primaryCrops` (ARRAY/TEXT)
- `nidVerified` (BOOLEAN)
- `division` (VARCHAR)
- `district` (VARCHAR)
- `upazila` (VARCHAR)

### 3. `business_profiles`
- `userId` (FK -> users.id, PK)
- `companyName` (VARCHAR)
- `businessType` (ENUM: 'mill', 'wholesaler', 'exporter', 'retailer', 'importer')
- `tradeLicenseNumber` (VARCHAR)
- `taxId` (VARCHAR)
- `country` (VARCHAR)
- `district` (VARCHAR)
- `procurementCapacityMonthlyTonnes` (DECIMAL)
- `verified` (BOOLEAN)

### 4. `product_listings`
- `id` (UUID, PK)
- `farmerId` (FK -> users.id)
- `cropId` (VARCHAR)
- `variety` (VARCHAR)
- `quantity` (DECIMAL)
- `unit` (ENUM: 'kg', 'mon', 'tonne')
- `grade` (VARCHAR)
- `district` (VARCHAR)
- `startingPrice` (DECIMAL)
- `expectedPrice` (DECIMAL)
- `privateReservePrice` (DECIMAL) -- Hidden from public bidders
- `isAuction` (BOOLEAN)
- `status` (ENUM: 'active', 'in_auction', 'sold', 'cancelled')
- `images` (ARRAY)
- `harvestDate` (DATE)
- `createdAt` (TIMESTAMP)

### 5. `auctions`
- `id` (UUID, PK)
- `listingId` (FK -> product_listings.id)
- `farmerId` (FK -> users.id)
- `startingPrice` (DECIMAL)
- `minIncrement` (DECIMAL)
- `reservePrice` (DECIMAL) -- Protected server-side
- `currentHighestBid` (DECIMAL)
- `currentHighestBidderId` (FK -> users.id, NULLABLE)
- `status` (ENUM: 'pending', 'live', 'closed', 'accepted', 'rejected')
- `startTime` (TIMESTAMP)
- `endTime` (TIMESTAMP)
- `antiSnipeWindowSeconds` (INT, Default: 120)
- `autoExtendTimeSeconds` (INT, Default: 120)
- `totalBids` (INT)
- `acceptedBidId` (VARCHAR, NULLABLE)

### 6. `bids`
- `id` (UUID, PK)
- `auctionId` (FK -> auctions.id)
- `bidderId` (FK -> users.id)
- `bidderName` (VARCHAR)
- `bidderRole` (VARCHAR)
- `amount` (DECIMAL)
- `timestamp` (TIMESTAMP)
- `isAnonymous` (BOOLEAN)
- `status` (ENUM: 'active', 'outbid', 'accepted', 'rejected')

### 7. `procurement_requests`
- `id` (UUID, PK)
- `buyerId` (FK -> users.id)
- `companyName` (VARCHAR)
- `cropId` (VARCHAR)
- `requiredQuantity` (DECIMAL)
- `unit` (VARCHAR)
- `qualityGrade` (VARCHAR)
- `maxBudgetPerUnit` (DECIMAL)
- `isBudgetPrivate` (BOOLEAN)
- `deliveryLocation` (VARCHAR)
- `deliveryDistrict` (VARCHAR)
- `requiredDeliveryDate` (DATE)
- `allowSplitFulfillment` (BOOLEAN)
- `fulfilledQuantity` (DECIMAL)
- `status` (ENUM: 'open', 'partially_fulfilled', 'fulfilled', 'closed')

### 8. `supplier_offers`
- `id` (UUID, PK)
- `requestId` (FK -> procurement_requests.id)
- `farmerId` (FK -> users.id)
- `offeredQuantity` (DECIMAL)
- `pricePerUnit` (DECIMAL)
- `qualityGrade` (VARCHAR)
- `estimatedDeliveryDate` (DATE)
- `status` (ENUM: 'pending', 'accepted', 'rejected')

### 9. `orders`
- `id` (UUID, PK)
- `referenceType` (ENUM: 'auction', 'procurement', 'direct_contract')
- `referenceId` (VARCHAR)
- `sellerId` (FK -> users.id)
- `buyerId` (FK -> users.id)
- `quantity` (DECIMAL)
- `pricePerUnit` (DECIMAL)
- `totalAmount` (DECIMAL)
- `status` (ENUM: 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled')
- `createdAt` (TIMESTAMP)

### 10. `market_prices`
- `id` (UUID, PK)
- `cropId` (VARCHAR)
- `marketId` (VARCHAR)
- `district` (VARCHAR)
- `wholesalePrice` (DECIMAL)
- `retailPrice` (DECIMAL)
- `priceUnit` (VARCHAR)
- `date` (DATE)
- `priceSource` (ENUM: 'DAM', 'AgriPriceBD', 'Platform', 'Manual', 'Demo')
- `verificationStatus` (ENUM: 'verified', 'unverified', 'disputed')
- `dataFreshnessDays` (INT)

### 11. `audit_logs`
- `id` (UUID, PK)
- `userId` (VARCHAR, NULLABLE)
- `userName` (VARCHAR, NULLABLE)
- `action` (VARCHAR)
- `entityType` (VARCHAR)
- `entityId` (VARCHAR, NULLABLE)
- `details` (TEXT)
- `timestamp` (TIMESTAMP)
