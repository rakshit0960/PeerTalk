import express from "express";
import { getConversations, getMessages, sendMessage, startConversation, markMessagesAsRead, sendImageMessage } from "../controllers/chat.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const chatRoutes = express.Router();

chatRoutes.get("/conversations", verifyToken, getConversations);
chatRoutes.get("/:id/messages", verifyToken, getMessages);
chatRoutes.post("/:id/messages", verifyToken, sendMessage);
chatRoutes.post("/:id/messages/image", verifyToken, upload.single('image'), sendImageMessage);
chatRoutes.post("/start", verifyToken, startConversation);
chatRoutes.post("/:conversationId/read", verifyToken, markMessagesAsRead);

export default chatRoutes;