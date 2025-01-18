import { z } from "zod";

export const messageSchema = z.object({
  id: z.number(),
  content: z.string(),
  image: z.string().nullable().optional(),
  senderId: z.number(),
  receiverId: z.number(),
  conversationId: z.number(),
  createdAt: z.string().optional(),
  read: z.boolean().optional(),
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