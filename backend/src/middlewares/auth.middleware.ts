import { Request, Response, NextFunction } from "express";
import { dataStore } from "../models/db";
import { UserRole } from "../@types";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check header or fallback to currentUserId in session/store
  const authHeader = req.headers.authorization;
  let userId = dataStore.currentUserId;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.substring(7);
  }

  const user = dataStore.users.get(userId);
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized access" });
  }

  req.user = user;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' lacks permissions for this resource.`,
      });
    }

    next();
  };
}

