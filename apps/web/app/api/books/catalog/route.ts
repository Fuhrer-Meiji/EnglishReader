import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';

export async function GET(request: NextRequest) {
  await headers();
  try {
    const catalogPath = path.join(process.cwd(), 'data', 'full_public_catalog.json');
    if (!fs.existsSync(catalogPath)) {
      return NextResponse.json({ total: 0, books: [] });
    }

    const raw = fs.readFileSync(catalogPath, 'utf-8');
    const allBooks: any[] = JSON.parse(raw);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '36', 10);

    let filtered = allBooks;
    if (query) {
      filtered = allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      books: paginated,
    });
  } catch (error: any) {
    console.error('[CatalogAPI] Error:', error);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
