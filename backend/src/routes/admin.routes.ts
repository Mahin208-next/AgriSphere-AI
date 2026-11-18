import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { dataStore } from "../models/db";

const router = Router();

router.get("/overview", AdminController.getOverview);
router.get("/alerts/oversupply", AdminController.getAlerts);

// POST /api/v1/admin/prices/import
router.post("/prices/import", (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: "Missing csvData" });
    }
    const lines = csvData.trim().split("\n");
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 7) {
        const [cropId, cropNameEn, marketId, marketNameEn, district, wholesalePrice, retailPrice] = parts;
        const recordId = `rec_${marketId}_${cropId}`;
        dataStore.marketPrices.set(recordId, {
          id: recordId,
          cropId: cropId.trim(),
          cropNameEn: cropNameEn.trim(),
          cropNameBn: cropNameEn.trim(),
          marketId: marketId.trim(),
          marketNameEn: marketNameEn.trim(),
          marketNameBn: marketNameEn.trim(),
          district: district.trim(),
          wholesalePrice: Number(wholesalePrice) || 0,
          retailPrice: Number(retailPrice) || 0,
          minPrice: Number(wholesalePrice) * 0.95,
          maxPrice: Number(retailPrice) * 1.05,
          priceUnit: "BDT/kg",
          date: new Date().toISOString().split("T")[0],
          priceSource: "DAM",
          verificationStatus: "verified",
          dataFreshnessDays: 0,
        });
        imported++;
      }
    }
    res.json({ success: true, count: imported, message: `Successfully imported ${imported} records.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to import CSV" });
  }
});

export default router;

