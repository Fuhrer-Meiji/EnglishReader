import { DictEntry } from './mockData';
import { DifficultyLevel } from './types';

const clientCache = new Map<string, DictEntry>();

export async function fetchWordDefinition(rawWord: string): Promise<DictEntry> {
  const clean = rawWord.toLowerCase().trim().replace(/[’']/g, '');

  if (clientCache.has(clean)) {
    return clientCache.get(clean)!;
  }

  try {
    const res = await fetch(`/api/dict/${encodeURIComponent(clean)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch word: ${res.statusText}`);
    }
    const data = await res.json();

    const entry: DictEntry = {
      word: data.word || clean,
      phonetic: data.phonetic || `/${clean}/`,
      pos: data.pos || '',
      translation: data.translation || '暂无离线释义',
      englishDef: data.definition || '',
      level: data.level as DifficultyLevel | undefined,
      collocations: data.tags && data.tags.length > 0 ? data.tags : undefined,
    };

    clientCache.set(clean, entry);
    return entry;
  } catch (err) {
    console.warn(`[dictService] Falling back for "${clean}":`, err);
    const fallbackEntry: DictEntry = {
      word: clean,
      phonetic: `/${clean}/`,
      pos: 'word',
      translation: '本地词条解析中',
      englishDef: 'A recognized vocabulary token in the reader.',
    };
    clientCache.set(clean, fallbackEntry);
    return fallbackEntry;
  }
}

export async function fetchBatchWordDefinitions(rawWords: string[]): Promise<Record<string, DictEntry>> {
  const result: Record<string, DictEntry> = {};
  const toFetch: string[] = [];

  for (const raw of rawWords) {
    const clean = raw.toLowerCase().trim().replace(/[’']/g, '');
    if (!clean || clean.length <= 1) continue;

    if (clientCache.has(clean)) {
      result[clean] = clientCache.get(clean)!;
    } else {
      toFetch.push(clean);
    }
  }

  if (toFetch.length === 0) {
    return result;
  }

  try {
    const res = await fetch('/api/dict/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: toFetch }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.words) {
        for (const [w, item] of Object.entries(data.words as Record<string, any>)) {
          const entry: DictEntry = {
            word: item.word || w,
            phonetic: item.phonetic || `/${w}/`,
            pos: item.pos || '',
            translation: item.translation || '',
            englishDef: item.englishDef || '',
            level: item.level as DifficultyLevel | undefined,
            collocations: item.tags,
          };
          clientCache.set(w, entry);
          result[w] = entry;
        }
      }
    }
  } catch (err) {
    console.warn('[dictService] Batch lookup error:', err);
  }

  return result;
}

