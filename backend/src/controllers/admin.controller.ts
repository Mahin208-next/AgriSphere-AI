import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";

export class AdminController {
  public static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = adminService.getOverview();
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = adminService.getOversupplyAlerts();
      res.json({ success: true, alerts });
    } catch (err) {
      next(err);
    }
  }
}

