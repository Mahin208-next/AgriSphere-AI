import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { config } from "./src/config";
import apiRouter from "./src/routes";
import { errorHandler } from "./src/middlewares/error.middleware";
import { requestLogger } from "./src/middlewares/logger.middleware";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AgriSphere MarketLink AI Platform",
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Mount versioned API routes
app.use("/api/v1", apiRouter);

// Frontend static distribution directory (Serves full React UI on Port 8000)
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  // Helpful guide if static dist is not built yet
  app.get("/", (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8" />
          <title>AgriSphere MarketLink AI - Port 8000</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fbfbf9; color: #1c1917; text-align: center; padding: 48px 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 16px; border: 1px solid #e7e5e4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            h1 { color: #15803d; margin-bottom: 8px; }
            .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-weight: bold; border-radius: 9999px; font-size: 12px; }
            .links { margin: 24px 0; display: flex; justify-content: center; gap: 12px; }
            a { color: #15803d; font-weight: bold; text-decoration: none; padding: 8px 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; }
            a:hover { background: #dcfce7; }
            code { background: #f5f5f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Port 8000 Active</span>
            <h1>🌾 AgriSphere MarketLink AI</h1>
            <p>সম্পূর্ণ প্ল্যাটফর্ম ও ব্যাকএন্ড পোর্ট <strong>8000</strong>-এ সফলভাবে চলছে।</p>
            <div class="links">
              <a href="/api/v1/prices" target="_blank">DAM লাইভ বাজারদর API</a>
              <a href="/api/v1/auctions" target="_blank">লাইভ নিলাম API</a>
              <a href="/health" target="_blank">Health Check</a>
            </div>
            <p style="font-size: 13px; color: #78716c;">
              ফ্রন্টএন্ড UI পোর্ট 8000-এ সরাসরি দেখতে <code>cd frontend && npm run build</code> সম্পন্ন করুন অথবা <code>npm run dev</code> চালু করুন।
            </p>
          </div>
        </body>
      </html>
    `);
  });
}

// Global Error Handler
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`🚀 AgriSphere Unified Platform running on port ${config.port}`);
  console.log(`🌐 Full Application available at http://localhost:${config.port}`);
  console.log(`📡 Healthcheck available at http://localhost:${config.port}/health`);
  console.log(`🌾 API endpoints mounted under http://localhost:${config.port}/api/v1/`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

export default app;
