import { Request, Response, NextFunction } from "express";
import { priceService } from "../services/price.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { dataStore } from "../models/db";

export class PriceController {
  public static async getPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const cropId = req.query.cropId as string | undefined;
      const district = req.query.district as string | undefined;
      const marketId = req.query.marketId as string | undefined;
      const onlyToday = req.query.onlyToday !== "false";

      const data = priceService.getPrices(cropId, district, marketId, onlyToday);
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public static async comparePrices(req: Request, res: Response, next: NextFunction) {
    try {
      const cropId = (req.query.cropId as string) || "green_chilli";
      const data = priceService.compareMarketPrices(cropId);
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const cropId = (req.query.cropId as string) || "green_chilli";
      const days = Number(req.query.days) || 30;
      const data = priceService.getPriceTrends(cropId, days);
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public static async importCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { csvText } = req.body;
      if (!csvText) {
        return res.status(400).json({ success: false, error: "csvText is required" });
      }

      const userId = req.user?.id || dataStore.currentUserId;
      const records = priceService.importCsvPrices(csvText, userId);
      res.json({ success: true, importedCount: records.length, records });
    } catch (err) {
      next(err);
    }
  }
}

