import { Response, NextFunction } from "express";
import { CustomRequest } from "../types/auth.type";
import { z } from "zod";
import db from "../config/prisma";
import { generateToken } from "../utils/token.utils";
import { AppError } from "../middleware/error.middleware";

const updateNameSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

const updateBioSchema = z.object({
  bio: z.string().max(150, "Bio must not exceed 150 characters"),
});

export const updateName = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const validation = updateNameSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name } = validation.data;
    const updatedUser = await updateUserAndGenerateToken(req.userId, { name });
    res.json({ token: updatedUser });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateBio = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const validation = updateBioSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { bio } = validation.data;
    const updatedUser = await updateUserAndGenerateToken(req.userId, { bio });
    res.json({ token: updatedUser });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateProfilePicture = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    }

    if (!req.file) {
      const error: AppError = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await updateUserAndGenerateToken(req.userId, {
      profilePicture: req.file.path
    });
    res.json({ token: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const updateUserAndGenerateToken = async (userId: number, data: any) => {
  const user = await db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      profilePicture: true,
    },
  });

  return generateToken(
    user.id,
    user.name,
    user.email,
    user.bio,
    user.profilePicture
  );
};

const handleError = (error: any, res: Response) => {
  console.error("Update error:", error);
  res.status(500).json({ error: "Failed to update profile" });
};