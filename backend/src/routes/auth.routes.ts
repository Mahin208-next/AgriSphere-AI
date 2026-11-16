import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.get("/me", AuthController.getMe);
router.post("/me", AuthController.handleAuthAction);

export default router;

