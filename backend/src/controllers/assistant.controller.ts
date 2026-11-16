import { Request, Response, NextFunction } from "express";
import { assistantService } from "../services/assistant.service";
import { dataStore } from "../models/db";

export class AssistantController {
  public static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ success: false, error: "query string is required" });
      }

      const userId = (req as any).user?.id || dataStore.currentUserId;
      const response = assistantService.answerFarmerQuery(query, userId);
      res.json({ success: true, ...response });
    } catch (err) {
      next(err);
    }
  }
}

