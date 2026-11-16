import { Request, Response, NextFunction } from "express";
import { exportService } from "../services/export.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { dataStore } from "../models/db";

export class ExportController {
  public static async getRfqs(req: Request, res: Response, next: NextFunction) {
    try {
      const rfqs = exportService.getAllRfqs();
      res.json({
        success: true,
        rfqs,
        complianceDisclaimer: "International trade contracts are subject to destination import regulations, official plant quarantine certification (Phytosanitary Inspection), and bank LC terms.",
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createRfq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const rfq = exportService.createRfq(user, req.body);
      res.status(201).json({ success: true, rfq });
    } catch (err) {
      next(err);
    }
  }

  public static async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quotations = exportService.getQuotationsByRfq(id);
      res.json({ success: true, quotations });
    } catch (err) {
      next(err);
    }
  }

  public static async submitQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // rfqId
      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const quotation = exportService.submitQuotation(user, id, req.body);
      res.status(201).json({ success: true, quotation });
    } catch (err) {
      next(err);
    }
  }
}

