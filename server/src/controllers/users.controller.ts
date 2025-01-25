import { Request, Response } from "express";
import { CustomRequest } from "../types/auth.type";
import db from "../config/prisma";

export const searchUsers = async (req: CustomRequest, res: Response) => {
  try {
    const query = req.params.query || "";

    const users = await db.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            NOT: {
              id: req.userId, // Exclude current user
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        isGuest: true,
      },
      orderBy: [
        {
          isGuest: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
};
