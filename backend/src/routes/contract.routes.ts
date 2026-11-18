import { Router } from "express";
import { dataStore } from "../models/db";

const router = Router();

// GET /api/v1/contracts
router.get("/", (req, res) => {
  const contracts = Array.from(dataStore.directContracts.values());
  res.json({ contracts });
});

// POST /api/v1/contracts
router.post("/", (req, res) => {
  const body = req.body;
  const contractId = `cntr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const currentUser = dataStore.users.get(dataStore.currentUserId);
  const contract: any = {
    id: contractId,
    initiatorId: dataStore.currentUserId,
    initiatorName: currentUser?.name || "Contract Initiator",
    initiatorRole: currentUser?.role || "factory",
    ...body,
    status: "proposed",
    createdAt: new Date().toISOString(),
  };
  dataStore.directContracts.set(contractId, contract);
  res.json({ success: true, contract });
});

export default router;
