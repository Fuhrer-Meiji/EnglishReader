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
