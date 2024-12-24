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
  createdAt: z.date(),
  updatedAt: z.date(),
  participants: z.array(participantSchema),
});

export type Participant = z.infer<typeof participantSchema>;
export type ConversationWithParticipants = z.infer<typeof conversationSchema>;