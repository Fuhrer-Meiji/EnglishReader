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

  // 1. Try compiled pipeline JSON first
  const bookJsonPath = path.join(process.cwd(), 'data', 'books', `${id}.json`);
  if (fs.existsSync(bookJsonPath)) {
    try {
      const fileContent = fs.readFileSync(bookJsonPath, 'utf-8');
      const bookData = JSON.parse(fileContent);
      if (!bookData.chineseTitle) {
        try {
          const catPath = path.join(process.cwd(), 'data', 'full_public_catalog.json');
          if (fs.existsSync(catPath)) {
            const catalog = JSON.parse(fs.readFileSync(catPath, 'utf-8'));
            const match = catalog.find((b: any) => b.id === id);
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
  const presetBook = BOOKS_DATABASE[id];
  if (presetBook) {
    return NextResponse.json(presetBook);
  }

  return NextResponse.json({ error: `Book '${id}' not found` }, { status: 404 });
}
