import { Request, Response, NextFunction } from "express";
import { auctionService } from "../services/auction.service";
import { createListingSchema, placeBidSchema } from "../validators/auction.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { dataStore } from "../models/db";

export class AuctionController {
  public static async getAuctions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const auctions = auctionService.getAllAuctions(status, req.user);
      res.json({ success: true, auctions });
    } catch (err) {
      next(err);
    }
  }

  public static async getAuctionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = auctionService.getAuctionById(id, req.user);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async createListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createListingSchema.parse(req.body);
      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const result = auctionService.createListingAndAuction(user, validated);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async getBids(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bids = dataStore.bids.get(id) || [];
      res.json({ success: true, bids });
    } catch (err) {
      next(err);
    }
  }

  public static async submitBid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = placeBidSchema.parse(req.body);
      const bidderId = validated.bidderId || req.user?.id || dataStore.currentUserId;

      const result = auctionService.submitBid({
        auctionId: id,
        bidderId,
        amount: validated.amount,
        isAnonymous: validated.isAnonymous,
      });

      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async acceptAuctionOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const farmerId = req.user?.id || dataStore.currentUserId;
      const result = auctionService.acceptAuctionOffer({
        auctionId: id,
        farmerId,
        bidId: req.body?.bidId,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

