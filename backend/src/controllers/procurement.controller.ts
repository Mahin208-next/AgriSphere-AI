import { Request, Response, NextFunction } from "express";
import { procurementService } from "../services/procurement.service";
import { createProcurementSchema, submitOfferSchema } from "../validators/procurement.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { dataStore } from "../models/db";

export class ProcurementController {
  public static async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cropId = req.query.cropId as string | undefined;
      const district = req.query.district as string | undefined;
      const requests = procurementService.getAllRequests(cropId, district, req.user);
      res.json({ success: true, requests });
    } catch (err) {
      next(err);
    }
  }

  public static async getRequestById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = procurementService.getRequestById(id, req.user);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createProcurementSchema.parse(req.body);
      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const request = procurementService.createRequest(user, validated);
      res.status(201).json({ success: true, request });
    } catch (err) {
      next(err);
    }
  }

  public static async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const offers = dataStore.supplierOffers.get(id) || [];
      res.json({ success: true, offers });
    } catch (err) {
      next(err);
    }
  }

  public static async submitOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = submitOfferSchema.parse(req.body);
      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const result = procurementService.submitSupplierOffer(user, id, validated);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async acceptOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // offerId
      const requestId = req.body?.requestId;
      if (!requestId) {
        return res.status(400).json({ success: false, error: "requestId is required in body" });
      }

      const user = req.user || dataStore.users.get(dataStore.currentUserId);
      const result = procurementService.acceptSupplierOffer(user, requestId, id);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

