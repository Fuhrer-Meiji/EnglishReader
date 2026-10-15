import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

let dbInstance: DatabaseSync | null = null;

export function getUserDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  let dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    const webDataDir = path.join(process.cwd(), 'apps', 'web', 'data');
    if (fs.existsSync(webDataDir)) {
      dataDir = webDataDir;
    } else {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const dbPath = path.join(dataDir, 'reader_users.db');
  dbInstance = new DatabaseSync(dbPath);

  // High performance & concurrency with WAL mode
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  // Initialize tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_login_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_reading_progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL,
      chapter_index INTEGER NOT NULL DEFAULT 0,
      page_index INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS user_vocabulary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      word TEXT NOT NULL,
      phonetic TEXT,
      pos TEXT,
      translation TEXT NOT NULL,
      context_sentence TEXT,
      book_title TEXT,
      chapter_title TEXT,
      level TEXT,
      status TEXT NOT NULL DEFAULT 'learning',
      added_at TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (user_id, word)
    );

    CREATE TABLE IF NOT EXISTS user_bookmarks (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL,
      is_bookmarked INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      font_size INTEGER DEFAULT 18,
      is_serif INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'light',
      reading_mode TEXT DEFAULT 'zen',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_thoughts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL,
      chapter_index INTEGER NOT NULL,
      sentence_id TEXT,
      quote_text TEXT NOT NULL,
      chinese_translation TEXT,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      likes_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT,
      book_title TEXT,
      author TEXT,
      quote_text TEXT NOT NULL,
      chinese_translation TEXT,
      thought TEXT,
      card_image_url TEXT,
      card_layout TEXT,
      created_at INTEGER NOT NULL,
      likes_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS community_likes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (user_id, target_type, target_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_vocab_user ON user_vocabulary(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON user_reading_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_thoughts_book_chap ON community_thoughts(book_id, chapter_index);
    CREATE INDEX IF NOT EXISTS idx_thoughts_sentence ON community_thoughts(sentence_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_likes_target ON community_likes(target_type, target_id);
  `);

  // Seed initial literary thoughts and square posts if empty
  try {
    const thoughtCount: any = dbInstance.prepare('SELECT count(*) as count FROM community_thoughts').get();
    if (thoughtCount && thoughtCount.count === 0) {
      const scholarId = 'user_wilde_scholar';
      const now = Date.now();

      // Ensure scholar persona exists
      dbInstance.prepare(`
        INSERT OR IGNORE INTO users (id, username, email, password_hash, salt, avatar_color, created_at, last_login_at)
        VALUES (?, '王尔德伴读书友', 'bot@wilde.canon', 'seed_bot_hash', 'seed_salt', '#b45309', ?, ?)
      `).run(scholarId, now, now);

      dbInstance.prepare(`
        INSERT INTO community_thoughts (id, user_id, book_id, chapter_index, sentence_id, quote_text, chinese_translation, content, created_at, likes_count)
        VALUES
        ('th_seed_1', ?, 'the-picture-of-dorian-gray', 0, NULL, 'The artist is the creator of beautiful things. To reveal art and conceal the artist is art’s aim.', '艺术家是美好事物的创造者。展现艺术而隐藏艺术家，这是艺术的目的。', '王尔德在序言里开宗明义的唯美主义宣言！艺术的本义并非说教，而是展示美本身。每次读到这里都会被这种纯粹的艺术追求所触动。', ?, 9),
        ('th_seed_2', ?, 'the-great-gatsby', 0, NULL, 'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.', '在我年轻幼稚的岁月里，父亲曾给我一些忠告，至今仍常在我心头回荡。', '整部小说的经典开篇。菲茨杰拉德用极其克制而温润的笔触树立了尼克这一叙事视点，奠定了全书优雅而隐忍哀愁的基调。', ?, 7)
      `).run(scholarId, now - 86400000, scholarId, now - 43200000);

      dbInstance.prepare(`
        INSERT INTO community_posts (id, user_id, book_id, book_title, author, quote_text, chinese_translation, thought, card_image_url, card_layout, created_at, likes_count)
        VALUES
        ('post_seed_1', ?, 'the-picture-of-dorian-gray', 'The Picture of Dorian Gray', 'Oscar Wilde', 'We are all in the gutter, but some of us are looking at the stars.', '我们都身处沟壑之中，但仍有人在仰望星空。', '重温这一句，无论在什么境遇下都能让人重新获得清澈的力量。分享给正在漫漫长夜中潜心共读的每一位书友。', '/presets/starry-night.jpg', 'polaroid', ?, 18)
      `).run(scholarId, now - 3600000);
    }
  } catch (e) {
    console.warn('[DB] Seeding community thoughts note:', e);
  }

  return dbInstance;
}
