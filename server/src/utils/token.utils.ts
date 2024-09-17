import jwt from "jsonwebtoken";
import { emitWarning } from "process";
import { z } from "zod";

export const jwt_secret = process.env.JWT_SECRET_KEY || "temp"

export const tokenPayloadSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;


export const decodeToken = (token: string, jwtSecret: string) => {
  const decoded = jwt.verify(token, jwtSecret);
  const parsedToken = tokenPayloadSchema.parse(decoded);

  return parsedToken;
};

export const generateToken = (userId: number, name: string, email: string) => {
  return jwt.sign({ userId, name, email }, jwt_secret);
};