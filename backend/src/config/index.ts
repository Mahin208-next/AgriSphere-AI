import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(",") 
    : ["http://localhost:8000", "http://localhost:5173", "http://localhost:3000"],
  jwtSecret: process.env.JWT_SECRET || "krishisetu_ai_secret_key_2026",
  antiSnipeWindowSeconds: 120, // 2 mins
  autoExtendTimeSeconds: 120, // +2 mins
};
