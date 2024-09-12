import jwt from "jsonwebtoken";
import { z } from "zod";

export const jwt_secret = process.env.JWT_SECRET_KEY || "temp"

export const tokenPayloadSchema = z.object({
  userId: z.number(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;


export const decodeToken = (token: string, jwtSecret: string) => {
  const decoded = jwt.verify(token, jwtSecret);
  const parsedToken = tokenPayloadSchema.parse(decoded);

  return parsedToken;
};

export const generateToken = (userId: number, name: string, email: string) => {
  return jwt.sign({ userId, name, email }, jwt_secret, { expiresIn: "1d" });
};