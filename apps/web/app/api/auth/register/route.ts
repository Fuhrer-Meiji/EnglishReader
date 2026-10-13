import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getUserDb } from '../../../../lib/db';
import {
  hashPassword,
  createSession,
  getRandomAvatarColor,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    const trimmedUsername = typeof username === 'string' ? username.trim() : '';
    const trimmedPassword = typeof password === 'string' ? password : '';
    const trimmedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

    if (!trimmedUsername || trimmedUsername.length < 2 || trimmedUsername.length > 32) {
      return NextResponse.json(
        { error: '用户名长度需在 2 到 32 个字符之间' },
        { status: 400 }
      );
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少需 6 位' },
        { status: 400 }
      );
    }

    const db = getUserDb();

    // Check if username already exists
    const existingUser: any = db
      .prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)')
      .get(trimmedUsername);

    if (existingUser) {
      return NextResponse.json(
        { error: '该用户名已被注册，请尝试其他名称或直接登录' },
        { status: 409 }
      );
    }

    if (trimmedEmail) {
      const existingEmail: any = db
        .prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)')
        .get(trimmedEmail);
      if (existingEmail) {
        return NextResponse.json(
          { error: '该邮箱已被注册，请直接登录' },
          { status: 409 }
        );
      }
    }

    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { hash, salt } = hashPassword(trimmedPassword);
    const avatarColor = getRandomAvatarColor();
    const now = Date.now();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, salt, avatar_color, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, trimmedUsername, trimmedEmail, hash, salt, avatarColor, now, now);

    const { sessionId } = createSession(userId);

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: trimmedUsername,
        email: trimmedEmail,
        avatarColor,
        createdAt: now,
      },
    });

    const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https:');
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (error: any) {
    console.error('[RegisterAPI] Error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
