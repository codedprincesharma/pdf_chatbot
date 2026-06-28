import { Request, Response, NextFunction } from "express";
import * as authService from "../service/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: authService.TokenPayload;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required in Bearer format",
      });
    }
    const decoded = await authService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid access token",
    });
  }
};
