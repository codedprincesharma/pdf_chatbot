import { Request, Response, NextFunction } from "express";
import * as authService from "../service/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: authService.SessionUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Session cookie required",
      });
    }

    const decoded = await authService.verifySession(userId);

    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid session",
    });
  }
};
