import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import prisma from '../prisma';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

const SALT_ROUNDS = 10;

const PASSWORD_REGEX = {
  length: /^.{8,}$/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
};

function validatePassword(password: string): string | null {
  if (!PASSWORD_REGEX.length.test(password)) return 'Password must be at least 8 characters';
  if (!PASSWORD_REGEX.uppercase.test(password)) return 'Password must contain at least 1 uppercase letter';
  if (!PASSWORD_REGEX.number.test(password)) return 'Password must contain at least 1 number';
  if (!PASSWORD_REGEX.special.test(password)) return 'Password must contain at least 1 special character';
  return null;
}

/**
 * Registers a new user with username, email, and hashed password.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = (req.body ?? {}) as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      return res.status(400).json({ message: 'Username must be at least 2 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: trimmedUsername } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    if (env.nodeEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Registration error:', err);
    }
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return res.status(409).json({ message: 'Email or username already registered' });
    }
    const errMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    return res.status(500).json({ message: errMsg });
  }
};

/**
 * Authenticates a user and returns a signed JWT access token and user info.
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
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
};

/**
 * Updates the authenticated user's password.
 * Only updates when current password is verified with bcrypt.
 * Never returns password in response.
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  const cur = String(currentPassword).trim();
  const neu = String(newPassword).trim();

  if (!neu) {
    return res.status(400).json({ message: 'New password must not be empty' });
  }

  const pwdError = validatePassword(neu);
  if (pwdError) {
    return res.status(400).json({ message: pwdError });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user || !user.password) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(cur, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  if (cur === neu) {
    return res.status(400).json({ message: 'New password must differ from current password' });
  }

  const hashedPassword = await bcrypt.hash(neu, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return res.json({ message: 'Password updated successfully' });
};

/**
 * Returns the current authenticated user's profile.
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

