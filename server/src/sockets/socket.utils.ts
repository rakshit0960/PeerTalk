import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { jwt_secret } from "../utils/token.utils";

export const authenticateSocket = (socket: Socket, next: any) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, jwt_secret) as { userId: number };
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};
