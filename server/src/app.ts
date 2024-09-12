import express, { Response } from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "./middleware/auth.middleware";
import { socketHandler } from "./sockets/socket.handler";
import { CustomRequest } from "./types/auth.type";
import authRoutes from "./routers/auth.routes";
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/protected", verifyToken, (req: CustomRequest, res: Response) => {
  res.json({ message: `Welcome, user ${req.userId}` });
});

app.get("/", (req, res) => res.json({ message: "server is running!" }));

socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
