import { Router } from "express";
import { ExportController } from "../controllers/export.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/rfqs", ExportController.getRfqs);
router.post("/rfqs", authMiddleware, ExportController.createRfq);
router.get("/rfqs/:id/offers", ExportController.getQuotations);
router.post("/rfqs/:id/offers", authMiddleware, ExportController.submitQuotation);

export default router;

