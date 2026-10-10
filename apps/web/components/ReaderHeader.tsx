'use client';

import React from 'react';
import { ReadingMode, ThemeMode } from '../lib/types';
import { BookOpen, Bookmark, Sun, Moon, Coffee, Type, Sparkles, Feather } from 'lucide-react';

interface ReaderHeaderProps {
  readingMode: ReadingMode;
  onToggleMode: (mode: ReadingMode) => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  fontSize: number;
  onChangeFontSize: (delta: number) => void;
  isSerif: boolean;
  onToggleFontFamily: () => void;
  bookTitle: string;
  chapterTitle: string;
  vocabCount: number;
  onOpenVocab: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  readingMode,
  onToggleMode,
  theme,
  onSelectTheme,
  fontSize,
  onChangeFontSize,
  isSerif,
  onToggleFontFamily,
  bookTitle,
  chapterTitle,
  vocabCount,
  onOpenVocab,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Book Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs font-bold text-sm">
              ER
            </div>
            <span className="font-extrabold text-stone-900 dark:text-stone-100 tracking-tight hidden md:inline text-sm">
              EnglishReader
            </span>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
              {bookTitle}
            </h1>
            <p className="text-[10px] text-stone-400 truncate">
              {chapterTitle}
            </p>
          </div>
        </div>

        {/* Center: Dual-Mode Switcher (The Core Highlight) */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => onToggleMode('zen')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              readingMode === 'zen'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Feather className={`w-3.5 h-3.5 ${readingMode === 'zen' ? 'text-amber-500' : ''}`} />
            <span>Zen 沉浸</span>
          </button>

          <button
            onClick={() => onToggleMode('study')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              readingMode === 'study'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Study 精读</span>
          </button>
        </div>

        {/* Right: Controls & Vocabulary Entry */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Typography Controls */}
          <div className="hidden sm:flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700/60">
            <button
              onClick={() => onChangeFontSize(-1)}
              disabled={fontSize <= 15}
              className="px-2 py-1 text-xs text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 rounded disabled:opacity-40"
              title="减小字号"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1 text-stone-400">{fontSize}</span>
            <button
              onClick={() => onChangeFontSize(1)}
              disabled={fontSize >= 26}
              className="px-2 py-1 text-xs text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 rounded disabled:opacity-40"
              title="增大字号"
            >
              A+
            </button>

            <div className="w-px h-3 bg-stone-200 dark:bg-stone-700 mx-0.5" />

            <button
              onClick={onToggleFontFamily}
              className={`px-2 py-1 text-xs rounded transition-all ${
                isSerif
                  ? 'font-serif font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-stone-700'
                  : 'font-sans text-stone-600 dark:text-stone-300'
              }`}
              title="切换 衬线体 (Serif) / 无衬线体 (Sans)"
            >
              {isSerif ? 'Serif' : 'Sans'}
            </button>
          </div>

          {/* Theme Palette */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700/60">
            <button
              onClick={() => onSelectTheme('light')}
              className={`p-1.5 rounded transition-all ${
                theme === 'light' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="亮白纸张"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTheme('sepia')}
              className={`p-1.5 rounded transition-all ${
                theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="护眼羊皮纸 (Sepia)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTheme('dark')}
              className={`p-1.5 rounded transition-all ${
                theme === 'dark' ? 'bg-stone-900 text-stone-100 shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="暗夜黑"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vocabulary Notebook Button */}
          <button
            onClick={onOpenVocab}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800 transition-all relative"
            title="查看生词本"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">生词本</span>
            <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
              {vocabCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
