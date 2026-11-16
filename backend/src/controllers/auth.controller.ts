import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { registerSchema, switchUserSchema } from "../validators/auth.validator";

export class AuthController {
  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = authService.getCurrentUser();
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public static async handleAuthAction(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      if (body.switchUserId) {
        const validated = switchUserSchema.parse(body);
        const user = authService.switchUser(validated.switchUserId);
        return res.json({ success: true, user });
      }

      if (body.action === "register") {
        const validated = registerSchema.parse(body);
        const user = authService.register(validated);
        return res.json({ success: true, user });
      }

      res.status(400).json({ success: false, error: "Invalid auth action" });
    } catch (err) {
      next(err);
    }
  }
}

