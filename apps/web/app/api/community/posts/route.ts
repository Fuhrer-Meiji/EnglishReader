import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserDb } from '@/lib/db';
import { broadcastCommunityEvent } from '@/lib/communityEvents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10), 1), 100);
    const bookId = searchParams.get('bookId');

    const user = await getCurrentUser();
    const db = getUserDb();

    let query = `
      SELECT
        p.id,
        p.user_id as userId,
        u.username,
        u.avatar_color as avatarColor,
        p.book_id as bookId,
        p.book_title as bookTitle,
        p.author,
        p.quote_text as quoteText,
        p.chinese_translation as chineseTranslation,
        p.thought,
        p.card_image_url as cardImageUrl,
        p.card_layout as cardLayout,
        p.created_at as createdAt,
        p.likes_count as likesCount
      FROM community_posts p
      LEFT JOIN users u ON p.user_id = u.id
    `;

    const params: any[] = [];
    if (bookId) {
      query += ` WHERE p.book_id = ?`;
      params.push(bookId);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ?`;
    params.push(limit);

    const posts: any[] = db.prepare(query).all(...params);

    let userLikedPostIds = new Set<string>();
    if (user && posts.length > 0) {
      const likes: any[] = db
        .prepare(`SELECT target_id FROM community_likes WHERE user_id = ? AND target_type = 'post'`)
        .all(user.id);
      userLikedPostIds = new Set(likes.map((l) => l.target_id));
    }

    const enriched = posts.map((p) => ({
      ...p,
      isLikedByMe: userLikedPostIds.has(p.id),
      username: p.username || '文学漫游者',
      avatarColor: p.avatarColor || '#b45309',
    }));

    return NextResponse.json({
      posts: enriched,
      totalCount: posts.length,
    });
  } catch (error: any) {
    console.error('[CommunityPosts GET] Error:', error);
    return NextResponse.json({ error: '获取广场动态失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录以发布金句动态' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookId,
      bookTitle,
      author,
      quoteText,
      chineseTranslation,
      thought,
      cardImageUrl,
      cardLayout,
    } = body;

    const trimmedQuote = typeof quoteText === 'string' ? quoteText.trim() : '';
    if (!trimmedQuote) {
      return NextResponse.json({ error: '金句内容不能为空' }, { status: 400 });
    }

    const trimmedThought = typeof thought === 'string' ? thought.trim() : '';
    if (trimmedThought.length > 1000) {
      return NextResponse.json({ error: '感悟字数不能超过 1000 字' }, { status: 400 });
    }

    const db = getUserDb();
    const postId = `post_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO community_posts (
        id, user_id, book_id, book_title, author,
        quote_text, chinese_translation, thought,
        card_image_url, card_layout, created_at, likes_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      postId,
      user.id,
      bookId || null,
      bookTitle?.trim() || null,
      author?.trim() || null,
      trimmedQuote,
      chineseTranslation?.trim() || null,
      trimmedThought || null,
      cardImageUrl || null,
      cardLayout || 'polaroid',
      now
    );

    const newPost = {
      id: postId,
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      bookId: bookId || null,
      bookTitle: bookTitle?.trim() || null,
      author: author?.trim() || null,
      quoteText: trimmedQuote,
      chineseTranslation: chineseTranslation?.trim() || null,
      thought: trimmedThought || null,
      cardImageUrl: cardImageUrl || null,
      cardLayout: cardLayout || 'polaroid',
      createdAt: now,
      likesCount: 0,
      isLikedByMe: false,
    };

    // Broadcast live event to all readers in the square!
    broadcastCommunityEvent('new_post', newPost);

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error: any) {
    console.error('[CommunityPosts POST] Error:', error);
    return NextResponse.json({ error: '发布动态失败' }, { status: 500 });
  }
}
