import { Server, Socket } from "socket.io";
import { Message, messageSchema } from "../types/message";
import { ConversationWithParticipants } from "../types/conversation";

// Handle connection
export const handleConnection = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);
  console.log(`User connected: ${userId}, socket id: ${socket.id}`);

  socket.on("conversation-started", ({ conversation }: { conversation: ConversationWithParticipants }) => {
    console.log("New conversation started:", conversation);

    if (!conversation || !conversation.participants) {
      console.error("Invalid conversation data:", conversation);
      return;
    }

    // Join the conversation room
    socket.join(conversation.id.toString());

    // Notify other participants using UserManager
    conversation.participants.forEach((participant) => {
      io.to(`user:${participant.id}`).emit("conversation-created", conversation);
    });
  });


  // Handle message event
  socket.on("join-conversation", async ({ id }: { id: string }) => {
    console.log(`Socket ${socket.id} joining conversation ${id}`);
    socket.join(id.toString());
  });

  socket.on("new-message", async (message: Message) => {
    const parseResult = messageSchema.safeParse(message);
    console.log('new-message', parseResult.error, parseResult.data);
    if (parseResult.error) return socket.emit('error', parseResult.error);

    message = parseResult.data;
    io.to(message.conversationId.toString()).emit('get-new-message', message);
  });

  // Handle typing events
  socket.on("typing-start", ({ conversationId, userId, userName }: {
    conversationId: number;
    userId: number;
    userName: string;
  }) => {
    socket.to(conversationId.toString()).emit("user-typing", { userId, userName });
  });

  socket.on("typing-stop", ({ conversationId, userId }: {
    conversationId: number;
    userId: number;
  }) => {
    socket.to(conversationId.toString()).emit("user-stop-typing", { userId });
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
  });
};
