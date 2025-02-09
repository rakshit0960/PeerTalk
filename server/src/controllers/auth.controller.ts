import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { z } from "zod";
import db from "../config/prisma";
import { getGoogleAccessToken, getGoogleAuthURL, getGoogleUserInfo, upsertGoogleUser } from "../services/google.service";
import { CustomRequest } from "../types/auth.type";
import { generateToken } from "../utils/token.utils";

const registerSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const register = async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { name, email, password } = validation.data;
  const existingUser = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken(newUser.id, newUser.name, newUser.email, newUser.bio || "", newUser.profilePicture || "");
  res.json({ message: "User registered successfully", token });
};

export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { email, password } = validation.data;
  const user = await db.user.findUnique({ where: { email: email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = generateToken(user.id, user.name, user.email, user.bio || "", user.profilePicture || "");
  res.json({ message: "Login successful", token });
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const guestId = Math.random().toString(36).substring(7);
    const guestName = `Guest_${guestId}`;
    const guestEmail = `guest_${guestId}@temp.com`;
    const guestPassword = Math.random().toString(36);

    const hashedPassword = await bcrypt.hash(guestPassword, 10);
    const newUser = await db.user.create({
      data: {
        name: guestName,
        email: guestEmail,
        password: hashedPassword,
        isGuest: true,
      },
    });

    const token = generateToken(newUser.id, newUser.name, newUser.email, newUser.bio || "", newUser.profilePicture || "");
    res.json({ message: "Guest login successful", token });
  } catch (error) {
    console.error("Error creating guest account:", error);
    res.status(500).json({ error: "Failed to create guest account" });
  }
};

export const deleteGuestAccount = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isGuest) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.user.delete({
      where: { id: userId },
    });

    res.json({ message: "Guest account deleted successfully" });
  } catch (error) {
    console.error("Error deleting guest account:", error);
    res.status(500).json({ error: "Failed to delete guest account" });
  }
};

export const isTokenValid = async (req: Request, res: Response) => {
  res.json({ message: "Token is valid" });
};

export const getGoogleOAuthURL = (req: Request, res: Response) => {
  const url = getGoogleAuthURL();
  res.json({ url });
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.send({ error: "No authorization code received" });
    }

    // get access token with the code
    const data = await getGoogleAccessToken(code);

    // get user info with the access token
    const userInfo = await getGoogleUserInfo(data.access_token, data.id_token);

    // upsert user in the database
    const user = await upsertGoogleUser(userInfo);
    if (!user) {
      throw new Error("Failed to create or update user");
    }

    // generate token
    const token = generateToken(user.id, user.name, user.email, user.bio || "", user.profilePicture || "");

    // redirect back to the client with the token
    res.send({ token });
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    res.send({ error: "Failed to authenticate with Google" });
  }
}
