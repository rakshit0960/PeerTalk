import express from "express";
import { register, login, guestLogin, deleteGuestAccount, isTokenValid } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/guest", guestLogin);
authRoutes.delete("/guest", verifyToken, deleteGuestAccount);
authRoutes.post("/is-token-valid", verifyToken, isTokenValid);

export default authRoutes;