import { Server, Socket } from "socket.io";
import { Message, messageSchema } from "../types/message";
import { ConversationWithParticipants, participantSchema } from "../types/conversation";

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
    io.to(`user:${message.receiverId.toString()}`).emit('get-new-message', message);
  });

  // Handle typing events
  socket.on("typing-start", ({ conversationId, userId, userName }: {
    conversationId: number;
    userId: number;
    userName: string;
  }) => {
    console.log("typing-start", conversationId, userId, userName);
    socket.to(conversationId.toString()).emit("user-typing", { userId, userName, conversationId });
  });

  socket.on("typing-stop", ({ conversationId, userId }: {
    conversationId: number;
    userId: number;
  }) => {
    console.log("typing-stop", conversationId, userId);
    socket.to(conversationId.toString()).emit("user-stop-typing", { userId, conversationId });
  });

  // Video call events
  socket.on("video-call-request", ({ targetUserId, conversationId }: {
    targetUserId: number;
    conversationId: number;
  }) => {
    const fromUserId = socket.data.userId;
    io.to(`user:${targetUserId}`).emit("video-call-request", {
      fromUserId,
      fromUserName: socket.data.userName,
      conversationId,
    });
  });

  socket.on("video-call-accepted", ({ targetUserId, conversationId }: {
    targetUserId: number;
    conversationId: number;
  }) => {
    io.to(`user:${targetUserId}`).emit("video-call-accepted", {
      fromUserId: socket.data.userId,
      conversationId,
    });
  });

  socket.on("video-call-ended", ({ targetUserId, conversationId }: {
    targetUserId: number;
    conversationId: number;
  }) => {
    io.to(`user:${targetUserId}`).emit("video-call-ended", {
      fromUserId: socket.data.userId,
      conversationId,
    });
  });

  // WebRTC signaling events
  socket.on("video-offer", ({ offer, targetUserId }: {
    offer: RTCSessionDescriptionInit;
    targetUserId: number;
  }) => {
    io.to(`user:${targetUserId}`).emit("video-offer", {
      offer,
      fromUserId: socket.data.userId,
    });
  });

  socket.on("video-answer", ({ answer, targetUserId }: {
    answer: RTCSessionDescriptionInit;
    targetUserId: number;
  }) => {
    io.to(`user:${targetUserId}`).emit("video-answer", {
      answer,
      fromUserId: socket.data.userId,
    });
  });

  socket.on("ice-candidate", ({ candidate, targetUserId }: {
    candidate: RTCIceCandidateInit;
    targetUserId: number;
  }) => {
    io.to(`user:${targetUserId}`).emit("ice-candidate", {
      candidate,
      fromUserId: socket.data.userId,
    });
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
  });
};
