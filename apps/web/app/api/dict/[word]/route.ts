import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DICTIONARY_DATABASE } from '../../../../lib/mockData';

let dbInstance: DatabaseSync | null = null;

function getDatabase(): DatabaseSync | null {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(process.cwd(), 'data', 'dict.db');
  if (fs.existsSync(dbPath)) {
    try {
      dbInstance = new DatabaseSync(dbPath, { readOnly: true });
      return dbInstance;
    } catch (err) {
      console.error('[DictAPI] Failed to initialize SQLite database:', err);
      return null;
    }
  }
  return null;
}

// Convert ECDICT tags into standardized levels
function parseTags(tagStr?: string): { tags: string[]; highestLevel?: 'CET4' | 'CET6' | 'KY' | 'IELTS' | 'GRE' } {
  if (!tagStr) return { tags: [] };
  const rawTags = tagStr.toLowerCase().split(/\s+/).filter(Boolean);
  const tags: string[] = [];
  let highestLevel: 'CET4' | 'CET6' | 'KY' | 'IELTS' | 'GRE' | undefined = undefined;

  if (rawTags.includes('zk')) tags.push('中考');
  if (rawTags.includes('gk')) tags.push('高考');
  if (rawTags.includes('cet4')) {
    tags.push('四级');
    highestLevel = 'CET4';
  }
  if (rawTags.includes('cet6')) {
    tags.push('六级');
    highestLevel = 'CET6';
  }
  if (rawTags.includes('ky')) {
    tags.push('考研');
    if (!highestLevel || highestLevel === 'CET4') highestLevel = 'KY';
  }
  if (rawTags.includes('ielts')) tags.push('雅思');
  if (rawTags.includes('toefl')) tags.push('托福');
  if (rawTags.includes('gre')) {
    tags.push('GRE');
    highestLevel = 'GRE';
  }

  return { tags, highestLevel };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;
  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  const cleanWord = decodeURIComponent(word).toLowerCase().trim().replace(/[’']/g, '');

  // 1. Try local mock database first for enriched sample data
  const mockEntry = DICTIONARY_DATABASE[cleanWord];
  if (mockEntry) {
    return NextResponse.json({
      word: mockEntry.word,
      phonetic: mockEntry.phonetic,
      pos: mockEntry.pos,
      translation: mockEntry.translation,
      definition: mockEntry.englishDef,
      level: mockEntry.level,
      tags: mockEntry.level ? [mockEntry.level] : [],
      collocations: mockEntry.collocations || [],
      source: 'local_preset',
    });
  }

  // 2. Query ECDICT SQLite if available
  const db = getDatabase();
  if (db) {
    try {
      const stmt = db.prepare('SELECT * FROM words WHERE word = ? LIMIT 1');
      let row = stmt.get(cleanWord) as any;
      let isLemmatized = false;
      let baseWord = cleanWord;

      // If word not found directly, attempt lemmatization
      if (!row) {
        const lemmaStmt = db.prepare('SELECT lemma FROM lemmas WHERE word = ? LIMIT 1');
        const lemmaRow = lemmaStmt.get(cleanWord) as any;
        if (lemmaRow && lemmaRow.lemma) {
          baseWord = lemmaRow.lemma;
          row = stmt.get(baseWord) as any;
          isLemmatized = true;
        }
      }

      if (row) {
        const { tags, highestLevel } = parseTags(row.tag);
        // Format translation: replace \n with commas or newlines
        const cleanTranslation = (row.translation || '')
          .split('\\n')
          .join('； ')
          .replace(/^\[.*?\]\s*/, '');

        return NextResponse.json({
          word: row.word,
          originalQuery: cleanWord,
          isLemmatized,
          phonetic: row.phonetic ? `/${row.phonetic}/` : `/${row.word}/`,
          pos: row.pos || '',
          translation: cleanTranslation,
          definition: row.definition || '',
          level: highestLevel,
          tags,
          collins: row.collins || 0,
          oxford: row.oxford || 0,
          source: 'ecdict_sqlite',
        });
      }
    } catch (err) {
      console.error('[DictAPI] Error executing query:', err);
    }
  }

  // 3. Fallback when not found in database
  return NextResponse.json({
    word: cleanWord,
    phonetic: `/${cleanWord}/`,
    pos: 'word',
    translation: '暂无离线释义',
    definition: 'Word recognized in the text flow.',
    tags: [],
    source: 'fallback',
  });
}
