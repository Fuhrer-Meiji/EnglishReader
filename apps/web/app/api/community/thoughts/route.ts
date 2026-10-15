import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { getUserDb } from '@/lib/db';
import { broadcastCommunityEvent } from '@/lib/communityEvents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const chapterIndexStr = searchParams.get('chapterIndex');
    const sentenceId = searchParams.get('sentenceId');

    if (!bookId || chapterIndexStr === null) {
      return NextResponse.json({ error: '缺少 bookId 或 chapterIndex' }, { status: 400 });
    }

    const chapterIndex = parseInt(chapterIndexStr, 10);
    const user = await getCurrentUser();
    const db = getUserDb();

    let query = `
      SELECT
        t.id,
        t.user_id as userId,
        u.username,
        u.avatar_color as avatarColor,
        t.book_id as bookId,
        t.chapter_index as chapterIndex,
        t.sentence_id as sentenceId,
        t.quote_text as quoteText,
        t.chinese_translation as chineseTranslation,
        t.content,
        t.created_at as createdAt,
        t.likes_count as likesCount
      FROM community_thoughts t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.book_id = ? AND t.chapter_index = ?
    `;

    const params: any[] = [bookId, chapterIndex];

    if (sentenceId) {
      query += ` AND t.sentence_id = ?`;
      params.push(sentenceId);
    }

    query += ` ORDER BY t.created_at ASC`;

    const thoughts: any[] = db.prepare(query).all(...params);

    // Check which ones are liked by current user
    let userLikedThoughtIds = new Set<string>();
    if (user && thoughts.length > 0) {
      const likes: any[] = db
        .prepare(`SELECT target_id FROM community_likes WHERE user_id = ? AND target_type = 'thought'`)
        .all(user.id);
      userLikedThoughtIds = new Set(likes.map((l) => l.target_id));
    }

    const enriched = thoughts.map((t) => ({
      ...t,
      isLikedByMe: userLikedThoughtIds.has(t.id),
      username: t.username || '匿名读友',
      avatarColor: t.avatarColor || '#b45309',
    }));

    // Group count by sentenceId for paragraph thought bubbles in ReaderView
    const countsBySentence: Record<string, number> = {};
    for (const t of thoughts) {
      if (t.sentenceId) {
        countsBySentence[t.sentenceId] = (countsBySentence[t.sentenceId] || 0) + 1;
      }
    }

    return NextResponse.json({
      thoughts: enriched,
      countsBySentence,
      totalCount: thoughts.length,
    });
  } catch (error: any) {
    console.error('[CommunityThoughts GET] Error:', error);
    return NextResponse.json({ error: '获取想法失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录以发表读者想法' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookId,
      chapterIndex,
      sentenceId,
      quoteText,
      chineseTranslation,
      content,
    } = body;

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (!trimmedContent) {
      return NextResponse.json({ error: '想法内容不能为空' }, { status: 400 });
    }
    if (trimmedContent.length > 800) {
      return NextResponse.json({ error: '想法内容不能超过 800 字' }, { status: 400 });
    }

    if (!bookId || typeof chapterIndex !== 'number' || !quoteText) {
      return NextResponse.json({ error: '缺少书籍或段落原句信息' }, { status: 400 });
    }

    const db = getUserDb();
    const thoughtId = `th_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO community_thoughts (
        id, user_id, book_id, chapter_index, sentence_id,
        quote_text, chinese_translation, content, created_at, likes_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      thoughtId,
      user.id,
      bookId,
      chapterIndex,
      sentenceId || null,
      quoteText.trim(),
      chineseTranslation?.trim() || null,
      trimmedContent,
      now
    );

    const newThought = {
      id: thoughtId,
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      bookId,
      chapterIndex,
      sentenceId: sentenceId || null,
      quoteText: quoteText.trim(),
      chineseTranslation: chineseTranslation?.trim() || null,
      content: trimmedContent,
      createdAt: now,
      likesCount: 0,
      isLikedByMe: false,
    };

    // Broadcast in real-time to all reading peers!
    broadcastCommunityEvent('new_thought', newThought);

    return NextResponse.json({
      success: true,
      thought: newThought,
    });
  } catch (error: any) {
    console.error('[CommunityThoughts POST] Error:', error);
    return NextResponse.json({ error: '发表想法失败' }, { status: 500 });
  }
}
