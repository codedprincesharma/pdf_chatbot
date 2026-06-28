import prisma from "../database/db";

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
}

export const verifySession = async (userId: string): Promise<SessionUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Session invalid or user not found");
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
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
    id: user.id,
    email: user.email,
    name: user.name,
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
    id: user.id,
    email: user.email,
    name: user.name,
  };
};
