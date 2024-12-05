import { Server, Socket } from "socket.io";
import { Message, messageSchema } from "../types/message";

// Handle connection
export const handleConnection = (io: Server, socket: Socket) => {
  console.log(
    `User connected: ${JSON.stringify(socket.data)}, socket id: ${socket.id}`
  );

  // Handle message event
  socket.on("join-conversation", async ({id}: {id: string}) => {
    console.log(`Socket ${socket.id} joining conversation ${id}`);
    socket.join(id.toString());
  });

  socket.on("new-message", async (message: Message) => {
    const parseResult = messageSchema.safeParse(message);
    console.log('new-message', parseResult.error, parseResult.data);
    if (parseResult.error) return socket.emit('error', parseResult.error);

    message = parseResult.data;
    // Emit to the conversation room using conversationId instead of message.id
    io.to(message.conversationId.toString()).emit('get-new-message', message);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User ${socket.data.userId} disconnected`);
  });
};
