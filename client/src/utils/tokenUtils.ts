import { jwtDecode } from "jwt-decode";
import { z } from "zod";

export const tokenPayloadSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
  bio: z.string(),
  profilePicture: z.string(),
});

export type User = z.infer<typeof tokenPayloadSchema>;

export const getDecodedToken = (): User | null => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const parsedToken = tokenPayloadSchema.parse(decodedToken);
      return parsedToken;
    } catch (error) {
      console.error("Invalid token or token payload:", error);
      return null;
    }
  }
  return null;
};
