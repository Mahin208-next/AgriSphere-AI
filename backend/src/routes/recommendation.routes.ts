import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller";

const router = Router();

router.post("/markets", RecommendationController.getRecommendations);
router.get("/matching/listings/:id", RecommendationController.getMatchesForListing);

export default router;

