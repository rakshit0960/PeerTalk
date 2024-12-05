import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { searchUsers } from "../controllers/users.controller";

const router = express.Router();

router.get("/search/:query?", verifyToken, searchUsers);

export default router;