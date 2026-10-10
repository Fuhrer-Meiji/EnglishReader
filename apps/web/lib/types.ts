export type ReadingMode = 'zen' | 'study';

export type ThemeMode = 'light' | 'sepia' | 'dark';

export type DifficultyLevel = 'CET4' | 'CET6' | 'KY' | 'IELTS' | 'GRE';

export interface WordToken {
  text: string;
  cleanWord: string;
  level?: DifficultyLevel;
  phonetic?: string;
  translation?: string;
  pos?: string;
}

export interface GrammarNode {
  role: string;
  content: string;
  explanation: string;
}

export interface SentenceAnalysis {
  id: string;
  rawText: string;
  chineseTranslation: string;
  difficultyTag: '基础' | '中等' | '长难句';
  grammarComponents: GrammarNode[];
  culturalNote?: string;
  coreKeywords: string[];
}

export interface ChapterStats {
  wordCount: number;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  fleschScore: number;
  lexile: string;
  levelDistribution: {
    basic: number; // %
    cet4: number;  // %
    cet6: number;  // %
    gre: number;   // %
  };
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  sentences: SentenceAnalysis[];
  stats: ChapterStats;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
  source: 'Standard Ebooks' | 'Project Gutenberg';
  chapters: Chapter[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  translation: string;
  contextSentence: string;
  bookTitle: string;
  chapterTitle: string;
  addedAt: string;
  level?: DifficultyLevel;
  status: 'new' | 'learning' | 'mastered';
}
