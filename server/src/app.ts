import express, { Response } from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "./middleware/auth.middleware";
import { socketHandler } from "./sockets/socket.handler";
import { CustomRequest } from "./types/auth.type";
import authRoutes from "./routers/auth.routes";
import cors from "cors";
import chatRoutes from "./routers/chat.routes";
import userRoutes from "./routers/user.routes";
import { errorHandler } from './middleware/error.middleware';
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", verifyToken, chatRoutes);
app.use("/api/user", userRoutes);

app.get("/api/protected", verifyToken, (req: CustomRequest, res: Response) => {
  res.json({ message: `Welcome, user ${req.userId}` });
});

app.get("/api/health", (req, res) => res.json({ message: "API is running!" }));

socketHandler(io);

app.use(errorHandler); // every error in a controller will be handled by this middleware


const _dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  console.log("production mode");
  app.use(express.static(path.join(_dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "../client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`client url: ${process.env.CLIENT_URL}`);
  console.log(`✨ Server is running on localhost:${PORT}`);
});
