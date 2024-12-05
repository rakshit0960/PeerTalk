import { Server } from "socket.io";
import { handleConnection } from "./events";
import { handleSocketError } from "./errorHandlers";
import { authenticateSocket } from "./middlewares";

export const socketHandler = (io: Server) => {
  io.use(authenticateSocket);

  // Handle the connection event
  io.on("connection", (socket) => handleConnection(io, socket));

  // Global error handling
  io.on("connect_error", (err) => handleSocketError(err));
};
