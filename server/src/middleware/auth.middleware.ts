import { NextFunction, Response } from "express";
import { CustomRequest } from '../types/auth.type';
import { decodeToken, jwt_secret } from '../utils/token.utils';
import db from "../config/prisma";

export const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decodedToken = decodeToken(token, jwt_secret);
    const user = await db.user.findUnique({
      where: {
        id: decodedToken.userId,
        name: decodedToken.name,
        email: decodedToken.email
      }
    })
    if (!user) return res.status(401).json({ error: "Invalid token" });
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
