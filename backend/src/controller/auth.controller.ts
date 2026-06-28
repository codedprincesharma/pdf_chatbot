import { Request, Response } from "express";
import * as authService from "../service/auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const result = await authService.signup(email, name);
    
    // Set user ID in httpOnly cookie
    res.cookie("userId", result.id, {
      httpOnly: true,
      secure: false, // Set to true if running on HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const result = await authService.login(email, name);

    // Set user ID in httpOnly cookie
    res.cookie("userId", result.id, {
      httpOnly: true,
      secure: false, // Set to true if running on HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: result,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid email or name",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "No session active",
      });
    }

    const user = await authService.verifySession(userId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error: any) {
    console.error("GetMe error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Session expired",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("userId", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};
