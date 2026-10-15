import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserDb } from '@/lib/db';
import { broadcastCommunityEvent } from '@/lib/communityEvents';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录以点赞想法' }, { status: 401 });
    }

    const { id: thoughtId } = await params;
    const db = getUserDb();

    // Check if thought exists
    const thought: any = db
      .prepare('SELECT id, likes_count FROM community_thoughts WHERE id = ?')
      .get(thoughtId);

    if (!thought) {
      return NextResponse.json({ error: '想法不存在或已被删除' }, { status: 404 });
    }

    const existingLike: any = db
      .prepare(`SELECT id FROM community_likes WHERE user_id = ? AND target_type = 'thought' AND target_id = ?`)
      .get(user.id, thoughtId);

    let isLikedByMe = false;
    let newLikesCount = thought.likes_count;

    if (existingLike) {
      // Toggle OFF: remove like
      db.prepare(`DELETE FROM community_likes WHERE id = ?`).run(existingLike.id);
      newLikesCount = Math.max(0, thought.likes_count - 1);
      db.prepare(`UPDATE community_thoughts SET likes_count = ? WHERE id = ?`).run(newLikesCount, thoughtId);
      isLikedByMe = false;
    } else {
      // Toggle ON: add like
      const likeId = `like_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO community_likes (id, user_id, target_type, target_id, created_at)
        VALUES (?, ?, 'thought', ?, ?)
      `).run(likeId, user.id, thoughtId, Date.now());

      newLikesCount = thought.likes_count + 1;
      db.prepare(`UPDATE community_thoughts SET likes_count = ? WHERE id = ?`).run(newLikesCount, thoughtId);
      isLikedByMe = true;
    }

    // Broadcast like event via SSE
    broadcastCommunityEvent('like_thought', {
      thoughtId,
      likesCount: newLikesCount,
      userId: user.id,
      isLikedByMe,
    });

    return NextResponse.json({
      success: true,
      thoughtId,
      likesCount: newLikesCount,
      isLikedByMe,
    });
  } catch (error: any) {
    console.error('[CommunityThoughtLike POST] Error:', error);
    return NextResponse.json({ error: '点赞失败' }, { status: 500 });
  }
}
