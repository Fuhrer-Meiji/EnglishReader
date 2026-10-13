import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { getUserDb } from '../../../../lib/db';
import { VocabularyItem } from '../../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = getUserDb();

    // 1. Reading progresses
    const progressRows: any[] = db
      .prepare('SELECT book_id, chapter_index, page_index, updated_at FROM user_reading_progress WHERE user_id = ?')
      .all(user.id);

    const progressMap: Record<string, { chap: number; page: number; updatedAt: number }> = {};
    for (const r of progressRows) {
      progressMap[r.book_id] = {
        chap: r.chapter_index,
        page: r.page_index,
        updatedAt: r.updated_at,
      };
    }

    // 2. Vocabulary items
    const vocabRows: any[] = db
      .prepare('SELECT id, word, phonetic, pos, translation, context_sentence, book_title, chapter_title, level, status, added_at FROM user_vocabulary WHERE user_id = ? ORDER BY updated_at DESC')
      .all(user.id);

    const vocabulary: VocabularyItem[] = vocabRows.map((v) => ({
      id: v.id,
      word: v.word,
      phonetic: v.phonetic || '',
      pos: v.pos || '',
      translation: v.translation,
      contextSentence: v.context_sentence || '',
      bookTitle: v.book_title || '',
      chapterTitle: v.chapter_title || '',
      level: v.level || undefined,
      status: v.status || 'learning',
      addedAt: v.added_at,
    }));

    // 3. Bookmarks
    const bookmarkRows: any[] = db
      .prepare('SELECT book_id, is_bookmarked FROM user_bookmarks WHERE user_id = ?')
      .all(user.id);

    const bookmarks: Record<string, boolean> = {};
    for (const b of bookmarkRows) {
      bookmarks[b.book_id] = b.is_bookmarked === 1;
    }

    // 4. Settings
    const settingsRow: any = db
      .prepare('SELECT font_size, is_serif, theme, reading_mode FROM user_settings WHERE user_id = ?')
      .get(user.id);

    return NextResponse.json({
      success: true,
      data: {
        progress: progressMap,
        vocabulary,
        bookmarks,
        settings: settingsRow
          ? {
              fontSize: settingsRow.font_size,
              isSerif: settingsRow.is_serif === 1,
              theme: settingsRow.theme,
              readingMode: settingsRow.reading_mode,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('[UserSyncAPI GET] Error:', error);
    return NextResponse.json({ error: '同步拉取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientProgress = {},
      clientVocab = [],
      clientBookmarks = {},
      clientSettings = null,
    } = body;

    const db = getUserDb();
    const now = Date.now();

    // 1. Merge client reading progress with cloud
    const upsertProgressStmt = db.prepare(`
      INSERT INTO user_reading_progress (user_id, book_id, chapter_index, page_index, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        chapter_index = CASE WHEN excluded.chapter_index > user_reading_progress.chapter_index OR (excluded.chapter_index = user_reading_progress.chapter_index AND excluded.page_index > user_reading_progress.page_index) THEN excluded.chapter_index ELSE user_reading_progress.chapter_index END,
        page_index = CASE WHEN excluded.chapter_index > user_reading_progress.chapter_index OR (excluded.chapter_index = user_reading_progress.chapter_index AND excluded.page_index > user_reading_progress.page_index) THEN excluded.page_index ELSE user_reading_progress.page_index END,
        updated_at = excluded.updated_at
    `);

    for (const [bookId, p] of Object.entries(clientProgress as Record<string, { chap: number; page: number }>)) {
      if (typeof p?.chap === 'number') {
        upsertProgressStmt.run(user.id, bookId, p.chap, p.page || 0, now);
      }
    }

    // 2. Merge client vocabulary with cloud
    const upsertVocabStmt = db.prepare(`
      INSERT INTO user_vocabulary (id, user_id, word, phonetic, pos, translation, context_sentence, book_title, chapter_title, level, status, added_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, word) DO UPDATE SET
        translation = excluded.translation,
        context_sentence = COALESCE(excluded.context_sentence, user_vocabulary.context_sentence),
        status = excluded.status,
        updated_at = excluded.updated_at
    `);

    if (Array.isArray(clientVocab)) {
      for (const item of clientVocab) {
        if (item?.word) {
          upsertVocabStmt.run(
            item.id || `vocab_${now}_${Math.random().toString(36).substring(2, 6)}`,
            user.id,
            item.word,
            item.phonetic || '',
            item.pos || '',
            item.translation || '',
            item.contextSentence || '',
            item.bookTitle || '',
            item.chapterTitle || '',
            item.level || null,
            item.status || 'learning',
            item.addedAt || new Date().toISOString().split('T')[0],
            now
          );
        }
      }
    }

    // 3. Merge bookmarks
    const upsertBookmarkStmt = db.prepare(`
      INSERT INTO user_bookmarks (user_id, book_id, is_bookmarked, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        is_bookmarked = excluded.is_bookmarked,
        updated_at = excluded.updated_at
    `);

    for (const [bookId, isBookmarked] of Object.entries(clientBookmarks as Record<string, boolean>)) {
      upsertBookmarkStmt.run(user.id, bookId, isBookmarked ? 1 : 0, now);
    }

    // 4. Merge settings if provided
    if (clientSettings) {
      db.prepare(`
        INSERT INTO user_settings (user_id, font_size, is_serif, theme, reading_mode, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          font_size = excluded.font_size,
          is_serif = excluded.is_serif,
          theme = excluded.theme,
          reading_mode = excluded.reading_mode,
          updated_at = excluded.updated_at
      `).run(
        user.id,
        clientSettings.fontSize || 18,
        clientSettings.isSerif !== false ? 1 : 0,
        clientSettings.theme || 'light',
        clientSettings.readingMode || 'zen',
        now
      );
    }

    // Return the latest consolidated data
    const progressRows: any[] = db
      .prepare('SELECT book_id, chapter_index, page_index, updated_at FROM user_reading_progress WHERE user_id = ?')
      .all(user.id);

    const progressMap: Record<string, { chap: number; page: number; updatedAt: number }> = {};
    for (const r of progressRows) {
      progressMap[r.book_id] = {
        chap: r.chapter_index,
        page: r.page_index,
        updatedAt: r.updated_at,
      };
    }

    const vocabRows: any[] = db
      .prepare('SELECT id, word, phonetic, pos, translation, context_sentence, book_title, chapter_title, level, status, added_at FROM user_vocabulary WHERE user_id = ? ORDER BY updated_at DESC')
      .all(user.id);

    const vocabulary: VocabularyItem[] = vocabRows.map((v) => ({
      id: v.id,
      word: v.word,
      phonetic: v.phonetic || '',
      pos: v.pos || '',
      translation: v.translation,
      contextSentence: v.context_sentence || '',
      bookTitle: v.book_title || '',
      chapterTitle: v.chapter_title || '',
      level: v.level || undefined,
      status: v.status || 'learning',
      addedAt: v.added_at,
    }));

    const bookmarkRows: any[] = db
      .prepare('SELECT book_id, is_bookmarked FROM user_bookmarks WHERE user_id = ?')
      .all(user.id);

    const bookmarks: Record<string, boolean> = {};
    for (const b of bookmarkRows) {
      bookmarks[b.book_id] = b.is_bookmarked === 1;
    }

    const settingsRow: any = db
      .prepare('SELECT font_size, is_serif, theme, reading_mode FROM user_settings WHERE user_id = ?')
      .get(user.id);

    return NextResponse.json({
      success: true,
      data: {
        progress: progressMap,
        vocabulary,
        bookmarks,
        settings: settingsRow
          ? {
              fontSize: settingsRow.font_size,
              isSerif: settingsRow.is_serif === 1,
              theme: settingsRow.theme,
              readingMode: settingsRow.reading_mode,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('[UserSyncAPI POST] Error:', error);
    return NextResponse.json({ error: '数据合并同步失败' }, { status: 500 });
  }
}
