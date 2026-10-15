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
      return NextResponse.json({ error: '请先登录以点赞动态' }, { status: 401 });
    }

    const { id: postId } = await params;
    const db = getUserDb();

    const post: any = db
      .prepare('SELECT id, likes_count FROM community_posts WHERE id = ?')
      .get(postId);

    if (!post) {
      return NextResponse.json({ error: '动态不存在或已被删除' }, { status: 404 });
    }

    const existingLike: any = db
      .prepare(`SELECT id FROM community_likes WHERE user_id = ? AND target_type = 'post' AND target_id = ?`)
      .get(user.id, postId);

    let isLikedByMe = false;
    let newLikesCount = post.likes_count;

    if (existingLike) {
      // Toggle OFF
      db.prepare(`DELETE FROM community_likes WHERE id = ?`).run(existingLike.id);
      newLikesCount = Math.max(0, post.likes_count - 1);
      db.prepare(`UPDATE community_posts SET likes_count = ? WHERE id = ?`).run(newLikesCount, postId);
      isLikedByMe = false;
    } else {
      // Toggle ON
      const likeId = `like_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO community_likes (id, user_id, target_type, target_id, created_at)
        VALUES (?, ?, 'post', ?, ?)
      `).run(likeId, user.id, postId, Date.now());

      newLikesCount = post.likes_count + 1;
      db.prepare(`UPDATE community_posts SET likes_count = ? WHERE id = ?`).run(newLikesCount, postId);
      isLikedByMe = true;
    }

    broadcastCommunityEvent('like_post', {
      postId,
      likesCount: newLikesCount,
      userId: user.id,
      isLikedByMe,
    });

    return NextResponse.json({
      success: true,
      postId,
      likesCount: newLikesCount,
      isLikedByMe,
    });
  } catch (error: any) {
    console.error('[CommunityPostLike POST] Error:', error);
    return NextResponse.json({ error: '点赞失败' }, { status: 500 });
  }
}
