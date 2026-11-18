import { Router } from "express";
import authRoutes from "./auth.routes";
import auctionRoutes from "./auction.routes";
import listingRoutes from "./listing.routes";
import alertRoutes from "./alert.routes";
import contractRoutes from "./contract.routes";
import orderRoutes from "./order.routes";
import procurementRoutes from "./procurement.routes";
import priceRoutes from "./price.routes";
import recommendationRoutes from "./recommendation.routes";
import assistantRoutes from "./assistant.routes";
import exportRoutes from "./export.routes";
import adminRoutes from "./admin.routes";
import { dataStore, DatabaseEvent } from "../models/db";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/auctions", auctionRoutes);
apiRouter.use("/listings", listingRoutes);
apiRouter.use("/alerts", alertRoutes);
apiRouter.use("/contracts", contractRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/procurement", procurementRoutes);
apiRouter.use("/prices", priceRoutes);
apiRouter.use("/recommendations", recommendationRoutes);
apiRouter.use("/assistant", assistantRoutes);
apiRouter.use("/export", exportRoutes);
apiRouter.use("/admin", adminRoutes);

// Realtime Server-Sent Events (SSE) endpoint
apiRouter.get("/realtime", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`);

  const unsubscribe = dataStore.subscribe((event: DatabaseEvent) => {
    try {
      res.write(`event: ${event.type.toLowerCase()}\ndata: ${JSON.stringify(event)}\n\n`);
    } catch (e) {
      // client disconnected
    }
  });

  req.on("close", () => {
    unsubscribe();
  });
});

export default apiRouter;

