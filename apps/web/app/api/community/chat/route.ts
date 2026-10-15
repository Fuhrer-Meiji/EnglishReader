import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserDb } from '@/lib/db';
import { broadcastCommunityEvent } from '@/lib/communityEvents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '60', 10), 1), 100);

    const db = getUserDb();

    // Query messages in ascending order for smooth chat display
    const query = `
      SELECT
        m.id,
        m.user_id as userId,
        m.username,
        m.avatar_color as avatarColor,
        m.content,
        m.reading_context as readingContext,
        m.created_at as createdAt
      FROM community_chat_messages m
      ORDER BY m.created_at DESC
      LIMIT ?
    `;

    const messages = db.prepare(query).all(limit);
    // Reverse so the oldest of the chunk is at the top, latest at bottom
    messages.reverse();

    return NextResponse.json({
      messages,
      totalCount: messages.length,
    });
  } catch (error: any) {
    console.error('[CommunityChat GET] Error:', error);
    return NextResponse.json({ error: '获取聊天消息失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录以在书友大厅发言' }, { status: 401 });
    }

    const body = await request.json();
    const { content, readingContext } = body;

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (!trimmedContent) {
      return NextResponse.json({ error: '发言内容不能为空' }, { status: 400 });
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json({ error: '单条发言不能超过 500 字' }, { status: 400 });
    }

    const db = getUserDb();
    const messageId = `chat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO community_chat_messages (
        id, user_id, username, avatar_color, content, reading_context, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      user.id,
      user.username,
      user.avatarColor,
      trimmedContent,
      typeof readingContext === 'string' ? readingContext.trim() : null,
      now
    );

    const newMessage = {
      id: messageId,
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      content: trimmedContent,
      readingContext: typeof readingContext === 'string' ? readingContext.trim() : null,
      createdAt: now,
    };

    // Broadcast to all active readers in real-time
    broadcastCommunityEvent('chat_message', newMessage);

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error('[CommunityChat POST] Error:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}
