import { z } from "zod";

export const participantSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

export const conversationSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  isGroup: z.boolean(),
  participants: z.array(participantSchema),
});