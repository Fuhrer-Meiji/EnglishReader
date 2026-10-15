import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DICTIONARY_DATABASE } from '../../../../lib/mockData';
import { DifficultyLevel } from '../../../../lib/types';

let dbInstance: DatabaseSync | null = null;

function getDatabase(): DatabaseSync | null {
  if (dbInstance) return dbInstance;

  function getDictPath(): string {
    const p1 = path.join(process.cwd(), 'data', 'dict.db');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(process.cwd(), 'apps', 'web', 'data', 'dict.db');
    if (fs.existsSync(p2)) return p2;
    return p1;
  }

  const dbPath = getDictPath();
  if (fs.existsSync(dbPath)) {
    try {
      dbInstance = new DatabaseSync(dbPath, { readOnly: true });
      return dbInstance;
    } catch (err) {
      console.error('[DictBatchAPI] Failed to initialize SQLite database:', err);
      return null;
    }
  }
  return null;
}

// Convert ECDICT tags into standardized levels
function parseTags(tagStr?: string): { tags: string[]; highestLevel?: DifficultyLevel } {
  if (!tagStr) return { tags: [] };
  const rawTags = tagStr.toLowerCase().split(/\s+/).filter(Boolean);
  const tags: string[] = [];
  let highestLevel: DifficultyLevel | undefined = undefined;

  const isZk = rawTags.includes('zk');

  if (isZk) tags.push('中考');
  if (rawTags.includes('gk')) tags.push('高考');
  if (rawTags.includes('cet4')) tags.push('四级');
  if (rawTags.includes('cet6')) tags.push('六级');
  if (rawTags.includes('ky')) tags.push('考研');
  if (rawTags.includes('ielts')) tags.push('雅思');
  if (rawTags.includes('toefl')) tags.push('托福');
  if (rawTags.includes('gre')) tags.push('GRE');

  // Elementary junior-high words (zk) like 'the', 'father', 'make' should not be highlighted as college exam vocab
  if (!isZk) {
    if (rawTags.includes('cet4') || rawTags.includes('gk')) {
      highestLevel = 'CET4';
    }
    if (rawTags.includes('cet6') || rawTags.includes('ielts') || rawTags.includes('toefl')) {
      highestLevel = 'CET6';
    }
    if (rawTags.includes('ky')) {
      highestLevel = 'KY';
    }
    if (rawTags.includes('gre')) {
      highestLevel = 'GRE';
    }
  } else if (rawTags.includes('gre')) {
    highestLevel = 'GRE';
  }

  return { tags, highestLevel };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = body;

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ words: {} });
    }

    // Limit batch size to 1,500 words to ensure sub-30ms performance
    const uniqueWords = Array.from(
      new Set(
        words
          .map((w: any) =>
            typeof w === 'string' ? w.toLowerCase().trim().replace(/[’']/g, '') : ''
          )
          .filter((w: string) => w.length > 1)
      )
    ).slice(0, 1500);

    const result: Record<
      string,
      {
        word: string;
        phonetic: string;
        pos: string;
        translation: string;
        englishDef?: string;
        level?: DifficultyLevel;
        tags?: string[];
      }
    > = {};

    const db = getDatabase();
    let stmt: any = null;
    let lemmaStmt: any = null;

    if (db) {
      stmt = db.prepare(
        'SELECT word, phonetic, pos, tag, translation, definition FROM words WHERE word = ? LIMIT 1'
      );
      lemmaStmt = db.prepare('SELECT lemma FROM lemmas WHERE word = ? LIMIT 1');
    }

    for (const cleanWord of uniqueWords) {
      // 1. Check local preset dictionary first
      const mockEntry = DICTIONARY_DATABASE[cleanWord];
      if (mockEntry) {
        result[cleanWord] = {
          word: mockEntry.word,
          phonetic: mockEntry.phonetic,
          pos: mockEntry.pos,
          translation: mockEntry.translation,
          englishDef: mockEntry.englishDef,
          level: mockEntry.level,
          tags: mockEntry.level ? [mockEntry.level] : [],
        };
        continue;
      }

      // 2. Query ECDICT SQLite
      if (stmt) {
        let row = stmt.get(cleanWord) as any;

        // Try lemma if not directly found
        if (!row && lemmaStmt) {
          const lemmaRow = lemmaStmt.get(cleanWord) as any;
          if (lemmaRow && lemmaRow.lemma) {
            row = stmt.get(lemmaRow.lemma) as any;
          }
        }

        // Morphological heuristics fallback
        if (!row) {
          if (cleanWord.endsWith('ies') && cleanWord.length > 4) {
            row = stmt.get(cleanWord.slice(0, -3) + 'y') as any;
          } else if (cleanWord.endsWith('es') && cleanWord.length > 3) {
            row = stmt.get(cleanWord.slice(0, -2)) as any;
          } else if (cleanWord.endsWith('s') && cleanWord.length > 3) {
            row = stmt.get(cleanWord.slice(0, -1)) as any;
          } else if (cleanWord.endsWith('ed') && cleanWord.length > 4) {
            row = stmt.get(cleanWord.slice(0, -2)) as any || stmt.get(cleanWord.slice(0, -1)) as any;
          } else if (cleanWord.endsWith('ing') && cleanWord.length > 5) {
            row = stmt.get(cleanWord.slice(0, -3)) as any || stmt.get(cleanWord.slice(0, -3) + 'e') as any;
          }
        }

        if (row) {
          const { tags, highestLevel } = parseTags(row.tag);
          let cleanTrans = (row.translation || '').replace(/\\r\\n/g, '; ').replace(/\\n/g, '; ');
          if (cleanTrans.length > 80) {
            cleanTrans = cleanTrans.slice(0, 80) + '...';
          }

          result[cleanWord] = {
            word: row.word || cleanWord,
            phonetic: row.phonetic ? `/${row.phonetic}/` : '',
            pos: row.pos || '',
            translation: cleanTrans,
            englishDef: row.definition || '',
            level: highestLevel,
            tags,
          };
        }
      }
    }

    return NextResponse.json({ words: result });
  } catch (error: any) {
    console.error('[DictBatchAPI] Error processing batch:', error);
    return NextResponse.json({ error: error.message || 'Batch lookup failed' }, { status: 500 });
  }
}
