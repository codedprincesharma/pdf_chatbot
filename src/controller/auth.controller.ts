import { Request, Response } from "express";
import * as authService from "../service/auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signup(email, password);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
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
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false, // Set to true if running on HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid email or password",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const result = await authService.refresh(token);

    // Set rotated refresh token in httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid refresh token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // If request has access token, we can clear refresh token in database
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token);
        await authService.logout(decoded.userId);
      } catch (err) {
        // Access token might be expired, check refresh token
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
          try {
            const decoded = authService.verifyRefreshToken(refreshToken);
            await authService.logout(decoded.userId);
          } catch (rErr) {
            // Ignore if both are invalid
          }
        }
      }
    } else {
      // Just try to clear database record if refresh token cookie exists
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        try {
          const decoded = authService.verifyRefreshToken(refreshToken);
          await authService.logout(decoded.userId);
        } catch (err) {}
      }
    }

    // Always clear the cookie on logout
    res.clearCookie("refreshToken", {
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
