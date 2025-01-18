import { z } from "zod";

export const userSearchSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  profilePicture: z.string().nullable(),
});
