import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, AuctionController.getAuctions);
router.post("/listings", authMiddleware, AuctionController.createListing);
router.get("/:id", authMiddleware, AuctionController.getAuctionById);
router.get("/:id/bids", AuctionController.getBids);
router.post("/:id/bids", authMiddleware, AuctionController.submitBid);
router.post("/:id/accept-offer", authMiddleware, AuctionController.acceptAuctionOffer);

export default router;

