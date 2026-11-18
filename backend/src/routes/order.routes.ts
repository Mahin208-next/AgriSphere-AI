import { Router } from "express";
import { dataStore } from "../models/db";

const router = Router();

// GET /api/v1/orders
router.get("/", (req, res) => {
  const orders = Array.from(dataStore.orders.values());
  res.json({ orders });
});

export default router;
