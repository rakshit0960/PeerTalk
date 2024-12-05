import { z } from "zod";

export const conversationSchema = z.object({
  id: z.number(),
  isGroup: z.boolean(),
  name: z.string().nullable(),
  participants: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    })
  ),
});
