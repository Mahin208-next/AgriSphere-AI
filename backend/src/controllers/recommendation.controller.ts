import { Request, Response, NextFunction } from "express";
import { recommendationService } from "../services/recommendation.service";

export class RecommendationController {
  public static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { cropId, originDistrict, quantityKg, grade } = req.body;
      const recommendations = recommendationService.getMarketRecommendations({
        cropId: cropId || "green_chilli",
        originDistrict: originDistrict || "Bogura",
        quantityKg: Number(quantityKg) || 1000,
        grade: grade || "Grade A",
      });

      res.json({
        success: true,
        recommendations,
        formula: "Net Return = (Market Price * Quantity) - Transport Cost - Handling/Market Costs",
        disclaimer: "Calibrated freight estimates based on Bangladesh freight haulage models.",
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMatchesForListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const matches = recommendationService.getMatchesForListing(id);
      res.json({
        success: true,
        matches,
        algorithm: "Match Score = 0.35 * Quantity + 0.30 * Location + 0.20 * Price + 0.15 * Timing",
      });
    } catch (err) {
      next(err);
    }
  }
}

