import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';

export async function GET(request: NextRequest) {
  await headers();
  try {
    function getFullCatalogPath(): string {
      const p1 = path.join(process.cwd(), 'data', 'full_public_catalog.json');
      if (fs.existsSync(p1)) return p1;
      const p2 = path.join(process.cwd(), 'apps', 'web', 'data', 'full_public_catalog.json');
      if (fs.existsSync(p2)) return p2;
      return p1;
    }

    const catalogPath = getFullCatalogPath();
    if (!fs.existsSync(catalogPath)) {
      return NextResponse.json({ total: 0, books: [] });
    }

    const raw = fs.readFileSync(catalogPath, 'utf-8');
    const allBooks: any[] = JSON.parse(raw);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const category = searchParams.get('category')?.toLowerCase().trim() || 'all';
    const cefr = searchParams.get('cefr')?.toUpperCase().trim() || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '36', 10);

    // Compute global category counts across full catalog
    const categoryCounts: Record<string, number> = { all: allBooks.length };
    const cefrCounts: Record<string, number> = { ALL: allBooks.length };

    for (const book of allBooks) {
      const cat = book.category || 'literature';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const lvl = book.cefr || 'B2';
      cefrCounts[lvl] = (cefrCounts[lvl] || 0) + 1;
    }

    // Apply filters
    let filtered = allBooks;

    // 1. Category Filter
    if (category && category !== 'all') {
      filtered = filtered.filter((b) => b.category === category);
    }

    // 2. CEFR Difficulty Filter
    if (cefr && cefr !== 'ALL') {
      filtered = filtered.filter((b) => {
        if (cefr === 'B1') return b.cefr === 'A2' || b.cefr === 'B1';
        return b.cefr === cefr;
      });
    }

    // 3. Search Query Filter
    if (query) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query) ||
          (b.chineseTitle && b.chineseTitle.includes(query)) ||
          (b.categoryName && b.categoryName.includes(query))
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
      categoryCounts,
      cefrCounts,
      books: paginated,
    });
  } catch (error: any) {
    console.error('[CatalogAPI] Error:', error);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
