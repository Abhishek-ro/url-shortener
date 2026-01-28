import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'user',
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function loginUser(email: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    } as AuthPayload,
    JWT_SECRET,
    { expiresIn: '30d' },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      isPrivate: true,
      allowPublicView: true,
      createdAt: true,
    },
  });

  return user;
}
