import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import prisma from '../prisma';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

/**
 * Registers a new user with a unique email and hashed password.
 */
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return res.status(201).json({
    id: user.id,
    email: user.email,
  });
};

/**
 * Authenticates a user and returns a signed JWT access token.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload: JwtPayload = { sub: user.id, email: user.email };
  const secret: Secret = env.jwtSecret;
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as unknown as number };

  const token = jwt.sign(payload, secret, options);

  return res.json({
    token,
  });
};

