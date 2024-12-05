import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { z } from "zod";
import db from "../config/prisma";
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

  const token = generateToken(newUser.id, newUser.name, newUser.email);
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

  const token = generateToken(user.id, user.name, user.email);
  res.json({ message: "Login successful", token });
};
