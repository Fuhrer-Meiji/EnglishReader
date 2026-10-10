'use client';

import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Bookmark,
  Columns2,
  Scroll,
  Type,
  Sun,
  Moon,
  Coffee,
  X,
  BookOpen,
} from 'lucide-react';
import { LayoutMode, ReadingMode, ThemeMode } from '../lib/types';

interface WeChatDockProps {
  layoutMode: LayoutMode;
  onToggleLayoutMode: (mode: LayoutMode) => void;
  readingMode: ReadingMode;
  onToggleReadingMode: (mode: ReadingMode) => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  fontSize: number;
  onChangeFontSize: (delta: number) => void;
  isSerif: boolean;
  onToggleFontFamily: () => void;
  onOpenVocab: () => void;
  onOpenTOC: () => void;
  vocabCount: number;
}

export const WeChatDock: React.FC<WeChatDockProps> = ({
  layoutMode,
  onToggleLayoutMode,
  readingMode,
  onToggleReadingMode,
  theme,
  onSelectTheme,
  fontSize,
  onChangeFontSize,
  isSerif,
  onToggleFontFamily,
  onOpenVocab,
  onOpenTOC,
  vocabCount,
}) => {
  const [activePanel, setActivePanel] = useState<'font' | 'theme' | null>(null);

  const togglePanel = (panel: 'font' | 'theme') => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <aside className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
      {/* Settings Popup Flyout Panel */}
      {activePanel === 'font' && (
        <div
          className="absolute right-14 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">字号与排版</span>
            <button onClick={() => setActivePanel(null)} className="text-stone-400 hover:text-stone-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">字号大小</span>
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
              <button
                onClick={() => onChangeFontSize(-1)}
                disabled={fontSize <= 15}
                className="px-2.5 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-stone-700 rounded disabled:opacity-40"
              >
                A-
              </button>
              <span className="text-xs font-mono font-medium px-1">{fontSize}px</span>
              <button
                onClick={() => onChangeFontSize(1)}
                disabled={fontSize >= 26}
                className="px-2.5 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-stone-700 rounded disabled:opacity-40"
              >
                A+
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">字体样式</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onToggleFontFamily()}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all ${
                  isSerif
                    ? 'bg-amber-500 text-white border-amber-500 font-serif'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 font-serif'
                }`}
              >
                衬线 (Serif)
              </button>
              <button
                onClick={() => onToggleFontFamily()}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all ${
                  !isSerif
                    ? 'bg-amber-500 text-white border-amber-500 font-sans'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 font-sans'
                }`}
              >
                无衬线 (Sans)
              </button>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'theme' && (
        <div
          className="absolute right-14 top-1/2 -translate-y-1/2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 space-y-3 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">背景色温</span>
            <button onClick={() => setActivePanel(null)} className="text-stone-400 hover:text-stone-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onSelectTheme('light');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-stone-50'
                  : 'border-stone-200 dark:border-stone-700'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#faf9f5] border border-stone-200 shadow-xs flex items-center justify-center">
                <Sun className="w-3.5 h-3.5 text-stone-600" />
              </div>
              <span className="text-[11px] text-stone-600 dark:text-stone-300">明亮</span>
            </button>

            <button
              onClick={() => {
                onSelectTheme('sepia');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                theme === 'sepia'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-[#f4ecd8]/40'
                  : 'border-stone-200 dark:border-stone-700'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#f4ecd8] border border-[#e5d8be] shadow-xs flex items-center justify-center">
                <Coffee className="w-3.5 h-3.5 text-[#594433]" />
              </div>
              <span className="text-[11px] text-[#594433] dark:text-[#d3bc9f]">羊皮纸</span>
            </button>

            <button
              onClick={() => {
                onSelectTheme('dark');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-stone-800'
                  : 'border-stone-200 dark:border-stone-700'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#141417] border border-stone-700 shadow-xs flex items-center justify-center">
                <Moon className="w-3.5 h-3.5 text-stone-300" />
              </div>
              <span className="text-[11px] text-stone-400">深色</span>
            </button>
          </div>
        </div>
      )}

      {/* Main WeChat Read Floating Button Column */}
      <div className="bg-stone-900/80 dark:bg-stone-800/80 backdrop-blur-md rounded-full p-1.5 flex flex-col gap-2 shadow-2xl border border-stone-800/60 dark:border-stone-700/60 text-stone-300">
        {/* 1. TOC 目录 */}
        <button
          onClick={onOpenTOC}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-700/80 hover:text-white transition-all group relative"
          title="目录"
        >
          <Menu className="w-4 h-4" />
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            目录
          </span>
        </button>

        {/* 2. AI 深度语法树/精读模式切换 */}
        <button
          onClick={() => onToggleReadingMode(readingMode === 'zen' ? 'study' : 'zen')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group relative ${
            readingMode === 'study'
              ? 'bg-amber-500 text-white shadow-md'
              : 'hover:bg-stone-700/80 hover:text-white'
          }`}
          title={readingMode === 'study' ? '切回 Zen 沉浸模式' : '开启 AI 精读模式'}
        >
          <Sparkles className="w-4 h-4" />
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            {readingMode === 'study' ? 'Zen 沉浸' : 'AI 精读'}
          </span>
        </button>

        {/* 3. 生词本 & 划线笔记 */}
        <button
          onClick={onOpenVocab}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-700/80 hover:text-white transition-all group relative"
          title="生词本与笔记"
        >
          <Bookmark className="w-4 h-4" />
          {vocabCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {vocabCount}
            </span>
          )}
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            生词本 ({vocabCount})
          </span>
        </button>

        {/* 4. ⭐ 核心：滚动阅读 vs 双栏翻页切换 (WeChat Read Layout Switcher) */}
        <button
          onClick={() => onToggleLayoutMode(layoutMode === 'scroll' ? 'double' : 'scroll')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group relative ${
            layoutMode === 'double'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : 'hover:bg-stone-700/80 hover:text-white'
          }`}
          title={layoutMode === 'double' ? '切换为滚动阅读' : '切换为双栏翻页阅读'}
        >
          {layoutMode === 'double' ? (
            <Columns2 className="w-4 h-4" />
          ) : (
            <Scroll className="w-4 h-4" />
          )}
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            {layoutMode === 'double' ? '切为滚动阅读' : '切为双栏阅读'}
          </span>
        </button>

        {/* 5. 字体与字号调节 */}
        <button
          onClick={() => togglePanel('font')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group relative ${
            activePanel === 'font'
              ? 'bg-stone-700 text-white'
              : 'hover:bg-stone-700/80 hover:text-white'
          }`}
          title="排版与字号"
        >
          <Type className="w-4 h-4" />
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            字号排版
          </span>
        </button>

        {/* 6. 主题背景色 */}
        <button
          onClick={() => togglePanel('theme')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group relative ${
            activePanel === 'theme'
              ? 'bg-stone-700 text-white'
              : 'hover:bg-stone-700/80 hover:text-white'
          }`}
          title="背景色温"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : theme === 'sepia' ? (
            <Coffee className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span className="absolute right-12 bg-stone-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            背景色温
          </span>
        </button>
      </div>
    </aside>
  );
};
