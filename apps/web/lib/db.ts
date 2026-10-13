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

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_vocab_user ON user_vocabulary(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON user_reading_progress(user_id);
  `);

  return dbInstance;
}
