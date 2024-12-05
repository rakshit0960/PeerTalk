import { NextFunction, Response } from "express";
import { CustomRequest } from '../types/auth.type';
import { decodeToken, jwt_secret } from '../utils/token.utils';
import db from "../config/prisma";

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decodedToken = decodeToken(token, jwt_secret);
    db.user.findUniqueOrThrow({
      where: {
        id: decodedToken.userId,
        name: decodedToken.name,
        email: decodedToken.email
      }
    })
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
