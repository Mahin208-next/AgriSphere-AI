import { Router } from "express";
import { dataStore } from "../models/db";

const router = Router();

// GET /api/v1/alerts/oversupply
router.get("/oversupply", (req, res) => {
  const alerts = Array.from(dataStore.oversupplyAlerts.values());
  res.json({ alerts });
});

export default router;
