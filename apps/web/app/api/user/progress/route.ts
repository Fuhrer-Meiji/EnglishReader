import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { getUserDb } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // If not logged in, client still stores in localStorage, return 200 silently
      return NextResponse.json({ success: true, isGuest: true });
    }

    const body = await request.json();
    const { bookId, chapterIndex, pageIndex } = body;

    if (!bookId || typeof chapterIndex !== 'number') {
      return NextResponse.json({ error: '无效的阅读进度参数' }, { status: 400 });
    }

    const db = getUserDb();
    const now = Date.now();

    db.prepare(`
      INSERT INTO user_reading_progress (user_id, book_id, chapter_index, page_index, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        chapter_index = excluded.chapter_index,
        page_index = excluded.page_index,
        updated_at = excluded.updated_at
    `).run(user.id, bookId, chapterIndex, pageIndex || 0, now);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[UserProgressAPI] Error:', error);
    return NextResponse.json({ error: '保存进度失败' }, { status: 500 });
  }
}
