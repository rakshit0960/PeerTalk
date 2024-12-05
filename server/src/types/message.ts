import { z } from "zod";

export const messageSchema = z.object({
  id: z.number(),
  content: z.string(),
  senderId: z.number(),
  receiverId: z.number(),
  conversationId: z.number(),
  createdAt: z.string().optional(),
  sender: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  receiver: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
});

export type Message = z.infer<typeof messageSchema>;