import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/overview", authMiddleware, requireRole(["admin"]), AdminController.getOverview);
router.get("/alerts/oversupply", AdminController.getAlerts);

export default router;

