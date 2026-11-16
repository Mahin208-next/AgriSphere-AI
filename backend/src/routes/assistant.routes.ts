import { Router } from "express";
import { AssistantController } from "../controllers/assistant.controller";

const router = Router();

router.post("/chat", AssistantController.chat);

export default router;

