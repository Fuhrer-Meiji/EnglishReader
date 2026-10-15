import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserDb } from '@/lib/db';
import { broadcastCommunityEvent } from '@/lib/communityEvents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const db = getUserDb();

    const comments = db
      .prepare(`
        SELECT
          c.id,
          c.post_id as postId,
          c.user_id as userId,
          c.username,
          c.avatar_color as avatarColor,
          c.content,
          c.reply_to_username as replyToUsername,
          c.created_at as createdAt
        FROM community_comments c
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `)
      .all(postId);

    return NextResponse.json({
      comments,
      totalCount: comments.length,
    });
  } catch (error: any) {
    console.error('[PostComments GET] Error:', error);
    return NextResponse.json({ error: '获取动态讨论失败' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录以参与动态讨论' }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { content, replyToUsername } = body;

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (!trimmedContent) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }

    if (trimmedContent.length > 600) {
      return NextResponse.json({ error: '评论字数不能超过 600 字' }, { status: 400 });
    }

    const db = getUserDb();

    // Verify post exists
    const post: any = db.prepare(`SELECT id FROM community_posts WHERE id = ?`).get(postId);
    if (!post) {
      return NextResponse.json({ error: '动态不存在或已被删除' }, { status: 404 });
    }

    const commentId = `comm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO community_comments (
        id, post_id, user_id, username, avatar_color, content, reply_to_username, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      commentId,
      postId,
      user.id,
      user.username,
      user.avatarColor,
      trimmedContent,
      typeof replyToUsername === 'string' ? replyToUsername.trim() : null,
      now
    );

    const newComment = {
      id: commentId,
      postId,
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      content: trimmedContent,
      replyToUsername: typeof replyToUsername === 'string' ? replyToUsername.trim() : null,
      createdAt: now,
    };

    // Broadcast new comment live across the network
    broadcastCommunityEvent('new_comment', newComment);

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error: any) {
    console.error('[PostComments POST] Error:', error);
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 });
  }
}
