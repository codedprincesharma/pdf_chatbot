import prisma from "../database/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};

export const signup = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    email: user.email,
  };
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Update refresh token in DB (token rotation)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
