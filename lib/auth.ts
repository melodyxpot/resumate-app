'use server';

import { cookies } from 'next/headers';
import { User } from '@/types';
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return null;
  }

  const db = await getDatabase();
  const user = await db.collection<User>('users').findOne({
    _id: new ObjectId(userId),
  });

  return user;
}

export async function setCurrentUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}

export async function signUp(email: string, name: string): Promise<User> {
  const db = await getDatabase();
  
  const existingUser = await db.collection<User>('users').findOne({ email });
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    email,
    name,
    saveResumeByDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection<User>('users').insertOne(newUser);
  newUser._id = result.insertedId;

  await setCurrentUser(result.insertedId.toString());

  return newUser;
}

export async function signIn(email: string): Promise<User> {
  const db = await getDatabase();
  const user = await db.collection<User>('users').findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  await setCurrentUser(user._id!.toString());

  return user;
}
