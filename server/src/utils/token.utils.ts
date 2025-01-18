import jwt from "jsonwebtoken";
import { z } from "zod";

export const jwt_secret = process.env.JWT_SECRET_KEY || "temp1"

export const tokenPayloadSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
  bio: z.string(),
  profilePicture: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;


export const decodeToken = (token: string, jwtSecret: string) => {
  const decoded = jwt.verify(token, jwtSecret);
  const parsedToken = tokenPayloadSchema.parse(decoded);

  return parsedToken;
};

export const generateToken = (userId: number, name: string, email: string, bio: string, profilePicture: string) => {
  return jwt.sign({ userId, name, email, bio, profilePicture }, jwt_secret);
};