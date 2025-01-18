import { Response } from "express";
import { CustomRequest } from "../types/auth.type";
import db from "../config/prisma";
import { z } from "zod";

export const getConversations = async (req: CustomRequest, res: Response) => {
  const user = await db.user.findUnique({
    where: {
      id: req.userId,
    },
    select: {
      conversations: {
        select: {
          id: true,
          name: true,
          isGroup: true,
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User dose not exists" });
  }

  res.json(user.conversations);
};

export const startConversation = async (req: CustomRequest, res: Response) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: "Participant ID is required" });
    }

    // Verify both users exist
    const [currentUser, participant] = await Promise.all([
      db.user.findUnique({ where: { id: req.userId } }),
      db.user.findUnique({ where: { id: participantId } })
    ]);

    if (!currentUser || !participant) {
      return res.status(404).json({ error: "One or both users not found" });
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: req.userId } } },
          { participants: { some: { id: participantId } } },
          { isGroup: false },
        ],
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        participants: {
          connect: [
            { id: req.userId },
            { id: participantId }
          ],
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

async function findExistingConversation(userIdA: number, userIdB: number) {
  const conversation = await db.conversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        every: {
          id: {
            in: [userIdA, userIdB],
          },
        },
      },
    },
  });

  return conversation;
}

export const getMessages = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  try {
    const conversation = await db.conversation.findFirst({
      where: {
        id: parseInt(id),
        participants: {
          some: {
            id: req.userId,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "conversation dose not exists" });
    }

    const messages = await db.message.findMany({
      where: {
        conversationId: parseInt(id),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: { name: true },
        },
      },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});

export const sendMessage = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const validationResult = sendMessageSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: "Invalid data",
      issues: validationResult.error.format(),
    });
  }

  const { content } = validationResult.data;

  try {
    // First get the conversation to find the receiver
    const conversation = await db.conversation.findFirst({
      where: {
        id: parseInt(id),
        participants: {
          some: {
            id: req.userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const receiver = conversation.participants.find(p => p.id !== req.userId);

    if (!receiver) {
      return res.status(400).json({ error: "Receiver not found" });
    }

    const newMessage = await db.message.create({
      data: {
        senderId: req.userId!,
        receiverId: receiver.id,
        conversationId: parseInt(id),
        content: content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const markMessagesAsRead = async (req: CustomRequest, res: Response) => {
  const { conversationId } = req.params;

  try {
    await db.message.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        receiverId: req.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
