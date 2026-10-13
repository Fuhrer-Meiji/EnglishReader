import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getUserDb } from './db';

const SESSION_COOKIE_NAME = 'er_session_token';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
  avatarColor: string;
  createdAt: number;
}

export const AVATAR_COLORS = [
  '#b45309', // amber-700
  '#047857', // emerald-700
  '#1d4ed8', // blue-700
  '#7e22ce', // purple-700
  '#be123c', // rose-700
  '#0f766e', // teal-700
  '#4338ca', // indigo-700
  '#c2410c', // orange-700
];

export function getRandomAvatarColor(): string {
  const idx = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[idx];
}

// Generate salted password hash using PBKDF2
export function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

// Create a new session for user
export function createSession(userId: string): { sessionId: string; expiresAt: number } {
  const db = getUserDb();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  const stmt = db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
  stmt.run(sessionId, userId, expiresAt, now);

  // Update user last login
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, userId);

  return { sessionId, expiresAt };
}

// Validate session and retrieve user
export function getSessionUser(sessionId?: string): AuthUser | null {
  if (!sessionId) return null;
  const db = getUserDb();
  const now = Date.now();

  const sessionRow: any = db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').get(sessionId);
  if (!sessionRow) return null;

  if (sessionRow.expires_at < now) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }

  const userRow: any = db.prepare('SELECT id, username, email, avatar_color, created_at FROM users WHERE id = ?').get(sessionRow.user_id);
  if (!userRow) return null;

  return {
    id: userRow.id,
    username: userRow.username,
    email: userRow.email,
    avatarColor: userRow.avatar_color || '#b45309',
    createdAt: userRow.created_at,
  };
}

// Helper to get current logged-in user in Next.js Server Components / Route Handlers
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return getSessionUser(token);
  } catch {
    return null;
  }
}

// Delete session
export function deleteSession(sessionId?: string): void {
  if (!sessionId) return;
  const db = getUserDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export { SESSION_COOKIE_NAME, SESSION_TTL_MS };
