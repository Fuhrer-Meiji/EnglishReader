import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { BookCardInfo } from '../../../lib/types';
import { PUBLIC_CATALOG_BOOKS } from '../../../lib/publicCatalog';

export async function GET() {
  try {
    const booksDir = path.join(process.cwd(), 'data', 'books');
    const catalogMap = new Map(PUBLIC_CATALOG_BOOKS.map((b) => [b.id, b]));
    const localBooks: BookCardInfo[] = [];

    if (fs.existsSync(booksDir)) {
      const files = fs.readdirSync(booksDir).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(booksDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(raw);

          const catalogMatch = catalogMap.get(data.id);
          const totalWords = data.chapters
            ? data.chapters.reduce((sum: number, c: any) => sum + (c.stats?.wordCount || 0), 0)
            : 0;

          const firstChapStats = data.chapters?.[0]?.stats;
          const cefr = catalogMatch?.cefr || firstChapStats?.cefr || 'B2';
          const lexile = catalogMatch?.lexile || firstChapStats?.lexile || '950L';

          localBooks.push({
            id: data.id,
            title: data.title || file.replace('.json', ''),
            chineseTitle: catalogMatch?.chineseTitle || data.chineseTitle || data.title,
            author: data.author || 'Unknown Author',
            publishedYear: data.publishedYear || 1900,
            cefr: cefr as any,
            lexile: lexile,
            wordCount: totalWords || catalogMatch?.wordCount || 30000,
            coverBg: catalogMatch?.coverBg || 'from-indigo-900 via-stone-900 to-black',
            description: catalogMatch?.description || data.description || '由 EnglishReader 自动解析与分级评测。',
            category: catalogMatch?.category || '自定义导入',
            recommendedAudience: catalogMatch?.recommendedAudience || `${cefr} 进阶读者`,
            readingProgress: catalogMatch?.readingProgress || 0,
            totalChapters: data.totalChapters || data.chapters?.length || 1,
          });
        } catch (e) {
          console.error(`[BooksAPI] Failed to parse ${file}:`, e);
        }
      }
    }

    return NextResponse.json({
      books: localBooks,
      count: localBooks.length,
    });
  } catch (error: any) {
    console.error('[BooksAPI] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to list books' }, { status: 500 });
  }
}
