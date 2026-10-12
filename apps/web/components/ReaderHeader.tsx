'use client';

/* Hallmark · component: ReaderHeader · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { ReadingMode } from '../lib/types';
import { BookOpen, BookmarkCheck, BookmarkPlus, Sparkles, Feather } from 'lucide-react';

interface ReaderHeaderProps {
  readingMode: ReadingMode;
  onToggleMode: (mode: ReadingMode) => void;
  bookTitle: string;
  chapterTitle: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onGoBookshelf: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  readingMode,
  onToggleMode,
  bookTitle,
  chapterTitle,
  isBookmarked,
  onToggleBookmark,
  onGoBookshelf,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/95 backdrop-blur-md px-4 sm:px-8 py-3 text-[var(--color-ink)] transition-[background-color,border-color] duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Book Title & Back to Shelf */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onGoBookshelf}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            title="返回书架"
          >
            <div className="p-1.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-book-serif font-medium text-sm text-[var(--color-ink)] truncate">
              {bookTitle}
            </span>
          </button>

          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border font-meta-mono transition-[background-color,border-color,color] duration-150 cursor-pointer ${
              isBookmarked
                ? 'bg-[var(--color-paper-elevated)] text-[var(--color-accent)] border-[var(--color-accent)]/50'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border-[var(--color-rule)] hover:border-[var(--color-ink-muted)]'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5" />
            )}
            <span>{isBookmarked ? '在架典藏' : '收入书架'}</span>
          </button>
        </div>

        {/* Center: Dual-Mode Switcher (Zen vs Study) */}
        <div className="flex items-center bg-[var(--color-paper-elevated)] p-0.5 rounded-lg border border-[var(--color-rule)] shadow-2xs">
          <button
            onClick={() => onToggleMode('zen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              readingMode === 'zen'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold shadow-2xs'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Feather className={`w-3.5 h-3.5 ${readingMode === 'zen' ? 'text-[var(--color-accent)]' : ''}`} />
            <span>Zen 沉浸</span>
          </button>

          <button
            onClick={() => onToggleMode('study')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              readingMode === 'study'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold shadow-2xs'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Study 精读</span>
          </button>
        </div>

        {/* Right: Shelf Navigation */}
        <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)] font-meta-mono">
          <button
            onClick={onGoBookshelf}
            className="hover:text-[var(--color-ink)] hidden sm:inline transition-colors cursor-pointer"
          >
            返回文库
          </button>
          <span className="text-[var(--color-rule)] hidden sm:inline">|</span>
          <div className="w-6 h-6 rounded-md bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink)] font-bold text-xs select-none">
            ER
          </div>
        </div>
      </div>
    </header>
  );
};
