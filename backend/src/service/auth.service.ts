import prisma from "../database/db";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  const user = await prisma.user.findUnique({
    where: { id: token },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId: user.id,
    email: user.email,
  };
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  // Since we removed JWT, a refreshToken is just the userId as well
  return {
    userId: token,
    email: "",
  };
};

export const signup = async (email: string, name?: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name || "User",
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken: user.id,
    refreshToken: user.id,
  };
};

export const login = async (email: string, name?: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Auto-create user if they don't exist
    user = await prisma.user.create({
      data: {
        email,
        name: name || "User",
      },
    });
  } else if (name && user.name !== name) {
    // Update name if changed
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken: user.id,
    refreshToken: user.id,
  };
};

export const refresh = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { id: token },
  });

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  return {
    accessToken: user.id,
    refreshToken: user.id,
  };
};

export const logout = async (userId: string) => {
  // No-op since we don't store session tokens in DB anymore
};
