'use client';

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
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  readingMode,
  onToggleMode,
  bookTitle,
  chapterTitle,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 dark:border-stone-800/60 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Book Title & Add to Bookshelf (WeChat Read style) */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
              {bookTitle}
            </span>
          </div>

          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
              isBookmarked
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-stone-400'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5" />
            )}
            <span>{isBookmarked ? '已在书架' : '加入书架'}</span>
          </button>
        </div>

        {/* Center: Dual-Mode Switcher (Zen vs Study) */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-full border border-stone-200/80 dark:border-stone-700/80 shadow-xs">
          <button
            onClick={() => onToggleMode('zen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              readingMode === 'zen'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Feather className={`w-3.5 h-3.5 ${readingMode === 'zen' ? 'text-amber-500' : ''}`} />
            <span>Zen 沉浸</span>
          </button>

          <button
            onClick={() => onToggleMode('study')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              readingMode === 'study'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Study 精读</span>
          </button>
        </div>

        {/* Right: Navigation & User Profile (WeChat Read style) */}
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <button className="hover:text-stone-900 dark:hover:text-stone-100 hidden sm:inline transition-colors">
            首页
          </button>
          <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">|</span>
          <button className="hover:text-stone-900 dark:hover:text-stone-100 hidden sm:inline transition-colors">
            我的书架
          </button>
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            M
          </div>
        </div>
      </div>
    </header>
  );
};
