import express from "express";
import { register, login } from "../controllers/auth.controller";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;