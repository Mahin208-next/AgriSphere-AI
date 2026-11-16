import { Router } from "express";
import { PriceController } from "../controllers/price.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", PriceController.getPrices);
router.get("/compare", PriceController.comparePrices);
router.get("/trends", PriceController.getTrends);
router.post("/import", authMiddleware, requireRole(["admin"]), PriceController.importCsv);

export default router;

