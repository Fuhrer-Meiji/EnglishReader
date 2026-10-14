import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { BOOKS_DATABASE } from '../../../../lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
  }

  // Reject deleted or probe books immediately
  if (id === 'the-little-prince' || id.startsWith('audit') || id.startsWith('wilde-audit')) {
    return NextResponse.json({ error: `Book '${id}' is incomplete and has been removed.` }, { status: 404 });
  }

  const ALIASES: Record<string, string> = {
    'alice-in-wonderland': 'alices-adventures-in-wonderland',
    'sherlock-holmes': 'the-adventures-of-sherlock-holmes',
    'tom-sawyer': 'the-adventures-of-tom-sawyer',
    'dr-jekyll-and-mr-hyde': 'the-strange-case-of-dr-jekyll-and-mr-hyde',
  };
  const bookId = ALIASES[id] || id;

  function getBooksDir(): string {
    const p1 = path.join(process.cwd(), 'data', 'books');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(process.cwd(), 'apps', 'web', 'data', 'books');
    if (fs.existsSync(p2)) return p2;
    return p1;
  }

  function getFullCatalogPath(): string {
    const p1 = path.join(process.cwd(), 'data', 'full_public_catalog.json');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(process.cwd(), 'apps', 'web', 'data', 'full_public_catalog.json');
    if (fs.existsSync(p2)) return p2;
    return p1;
  }

  // 1. Try compiled pipeline JSON first
  const bookJsonPath = path.join(getBooksDir(), `${bookId}.json`);
  if (fs.existsSync(bookJsonPath)) {
    try {
      const fileContent = fs.readFileSync(bookJsonPath, 'utf-8');
      const bookData = JSON.parse(fileContent);

      if (!bookData.chapters || bookData.chapters.length === 0) {
        return NextResponse.json({ error: `Book '${id}' has no chapters.` }, { status: 404 });
      }

      if (!bookData.chineseTitle) {
        try {
          const catPath = getFullCatalogPath();
          if (fs.existsSync(catPath)) {
            const catalog = JSON.parse(fs.readFileSync(catPath, 'utf-8'));
            const match = catalog.find((b: any) => b.id === bookId || b.id === id);
            if (match && match.chineseTitle) {
              bookData.chineseTitle = match.chineseTitle;
            }
          }
        } catch (e) {}
      }
      return NextResponse.json(bookData);
    } catch (err) {
      console.error(`[BookAPI] Error loading JSON for ${id}:`, err);
    }
  }

  // 2. Try preset database fallback
  const presetBook = BOOKS_DATABASE[bookId] || BOOKS_DATABASE[id];
  if (presetBook) {
    return NextResponse.json(presetBook);
  }

  return NextResponse.json({ error: `Book '${id}' not found` }, { status: 404 });
}
