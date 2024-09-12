import { Server, Socket } from "socket.io";
import { authenticateSocket } from "./socket.utils";

export const socketHandler = (io: Server) => {
  // Handle connection with authentication
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Handle specific events
    socket.on("message", (message: string) => {
      console.log(`User ${socket.data.userId} sent message: ${message}`);
      // Broadcast the message to other clients
      io.emit("message", { userId: socket.data.userId, message });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.data.userId} disconnected`);
    });
  });
};
