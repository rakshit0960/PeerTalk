import { NextFunction, Response } from "express";
import { CustomRequest } from '../types/auth.type';
import { decodeToken, jwt_secret } from '../utils/token.utils';

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decodedToken = decodeToken(token, jwt_secret); 
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
