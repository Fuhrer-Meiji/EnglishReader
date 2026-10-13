import { NextRequest, NextResponse } from 'next/server';
import { getUserDb } from '../../../../lib/db';
import {
  verifyPassword,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const trimmedIdentifier = typeof username === 'string' ? username.trim() : '';
    const trimmedPassword = typeof password === 'string' ? password : '';

    if (!trimmedIdentifier || !trimmedPassword) {
      return NextResponse.json(
        { error: '请输入用户名/邮箱及密码' },
        { status: 400 }
      );
    }

    const db = getUserDb();

    // Query by username or email
    const userRow: any = db
      .prepare('SELECT id, username, email, password_hash, salt, avatar_color, created_at FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)')
      .get(trimmedIdentifier, trimmedIdentifier);

    if (!userRow) {
      return NextResponse.json(
        { error: '账号不存在或密码错误' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(trimmedPassword, userRow.password_hash, userRow.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: '账号不存在或密码错误' },
        { status: 401 }
      );
    }

    const { sessionId } = createSession(userRow.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        avatarColor: userRow.avatar_color || '#b45309',
        createdAt: userRow.created_at,
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
    console.error('[LoginAPI] Error:', error);
    return NextResponse.json(
      { error: '登录服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}
