import { Router } from "express";
import { ProcurementController } from "../controllers/procurement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, ProcurementController.getRequests);
router.post("/", authMiddleware, ProcurementController.createRequest);
router.get("/:id", authMiddleware, ProcurementController.getRequestById);
router.get("/:id/offers", ProcurementController.getOffers);
router.post("/:id/offers", authMiddleware, ProcurementController.submitOffer);
router.post("/offers/:id/accept", authMiddleware, ProcurementController.acceptOffer);

export default router;

