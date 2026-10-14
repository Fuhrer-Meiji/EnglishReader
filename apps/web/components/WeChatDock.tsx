'use client';

/* Hallmark · component: WeChatDock · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState } from 'react';
import {
  Menu,
  BookOpen,
  Feather,
  Bookmark,
  Columns2,
  Scroll,
  Type,
  Sun,
  Moon,
  Coffee,
  X,
  ChevronRight,
  ChevronLeft,
  Settings2,
} from 'lucide-react';
import { LayoutMode, ReadingMode, ThemeMode } from '../lib/types';

interface WeChatDockProps {
  layoutMode: LayoutMode;
  onToggleLayoutMode: (mode: LayoutMode) => void;
  readingMode: ReadingMode;
  onToggleReadingMode: (mode: ReadingMode) => void;
  isStudySidebarOpen?: boolean;
  onToggleStudySidebar?: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  fontSize: number;
  onChangeFontSize: (delta: number) => void;
  onSetFontSize?: (size: number) => void;
  isSerif: boolean;
  onToggleFontFamily: () => void;
  onSelectFontFamily?: (serif: boolean) => void;
  onOpenVocab: () => void;
  onOpenTOC: () => void;
  vocabCount: number;
  isControlsVisible?: boolean;
  onToggleControls?: () => void;
}

const FONT_PRESETS = [
  { label: '小号', size: 14 },
  { label: '经典', size: 18 },
  { label: '舒适', size: 22 },
  { label: '大字', size: 26 },
  { label: '特大', size: 32 },
];

const getFontSizeLabel = (size: number) => {
  if (size <= 15) return '精致小号';
  if (size <= 19) return '经典书刊';
  if (size <= 23) return '舒适阅读';
  if (size <= 28) return '清晰大字';
  return '特大沉浸';
};

export const WeChatDock: React.FC<WeChatDockProps> = ({
  layoutMode,
  onToggleLayoutMode,
  readingMode,
  onToggleReadingMode,
  isStudySidebarOpen = false,
  onToggleStudySidebar,
  theme,
  onSelectTheme,
  fontSize,
  onChangeFontSize,
  onSetFontSize,
  isSerif,
  onToggleFontFamily,
  onSelectFontFamily,
  onOpenVocab,
  onOpenTOC,
  vocabCount,
  isControlsVisible = true,
  onToggleControls,
}) => {
  const [activePanel, setActivePanel] = useState<'font' | 'theme' | null>(null);

  const togglePanel = (panel: 'font' | 'theme') => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleUpdateFontSize = (newSize: number) => {
    const clamped = Math.min(Math.max(newSize, 13), 38);
    if (onSetFontSize) {
      onSetFontSize(clamped);
    } else {
      onChangeFontSize(clamped - fontSize);
    }
  };

  return (
    <>
      {/* 0. Edge Pull-Tab (Shown when controls are collapsed / hidden) */}
      {!isControlsVisible && onToggleControls && (
        <button
          onClick={onToggleControls}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-[var(--color-paper-2)]/90 hover:bg-[var(--color-paper-elevated)] backdrop-blur-md border-y border-l border-[var(--color-rule)] rounded-l-xl px-1.5 py-3.5 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] shadow-md transition-all cursor-pointer flex flex-col items-center gap-1 group ${
            isStudySidebarOpen ? 'right-[320px]' : 'right-0'
          }`}
          title="展开阅读控制栏"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[9px] font-meta-mono writing-mode-vertical uppercase tracking-tighter opacity-70 group-hover:opacity-100">
            MENU
          </span>
        </button>
      )}

      {/* 1. Backdrop Overlay for active mobile bottom sheet panels */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-150"
          onClick={() => setActivePanel(null)}
        />
      )}

      {/* 2. Settings Popup / Bottom Sheet: FONT & TYPOGRAPHY */}
      {activePanel === 'font' && (
        <div
          className="fixed inset-x-0 bottom-0 md:bottom-auto md:inset-x-auto md:absolute md:right-16 md:top-1/2 md:-translate-y-1/2 md:w-80 bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border-t md:border border-[var(--color-rule)] rounded-t-3xl md:rounded-2xl shadow-2xl p-5 md:p-4.5 animate-in slide-in-from-bottom md:zoom-in-95 duration-200 space-y-4 z-50 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div className="w-10 h-1 bg-[var(--color-rule)] rounded-full mx-auto -mt-1 mb-2 md:hidden" />

          {/* Header with Title and Current Size Badge */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-rule)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold font-book-serif text-[var(--color-ink)]">字号与版式</span>
              <span className="text-[10px] font-meta-mono text-[var(--color-accent)] bg-[var(--color-paper-2)] px-2 py-0.5 rounded-full border border-[var(--color-rule)] font-medium">
                {fontSize}px · {getFontSizeLabel(fontSize)}
              </span>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer p-1 rounded hover:bg-[var(--color-paper-2)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper + Continuous Range Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[var(--color-ink-2)]">
              <span>阅读字号调节</span>
              <span className="font-meta-mono text-[11px] text-[var(--color-ink-muted)]">13px - 38px</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleUpdateFontSize(fontSize - 2)}
                disabled={fontSize <= 13}
                className="w-9 h-9 shrink-0 flex items-center justify-center text-xs font-bold font-meta-mono bg-[var(--color-paper-2)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                title="缩小字号 (2px)"
              >
                A-
              </button>

              <div className="flex-1 relative flex items-center px-1">
                <input
                  type="range"
                  min="13"
                  max="38"
                  step="1"
                  value={fontSize}
                  onChange={(e) => handleUpdateFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--color-rule)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleUpdateFontSize(fontSize + 2)}
                disabled={fontSize >= 38}
                className="w-9 h-9 shrink-0 flex items-center justify-center text-sm font-bold font-meta-mono bg-[var(--color-paper-2)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                title="放大字号 (2px)"
              >
                A+
              </button>
            </div>

            {/* Quick Preset Pills */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {FONT_PRESETS.map((p) => {
                const isActive = fontSize === p.size;
                return (
                  <button
                    key={p.size}
                    onClick={() => handleUpdateFontSize(p.size)}
                    className={`py-1.5 rounded-md text-[11px] font-meta-mono transition-colors border cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] font-semibold shadow-2xs'
                        : 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-rule)] hover:border-[var(--color-accent)]/50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Font Family */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-rule)]">
            <span className="text-xs text-[var(--color-ink-2)] block">正文字体风格</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onSelectFontFamily) {
                    onSelectFontFamily(true);
                  } else if (!isSerif) {
                    onToggleFontFamily();
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                  isSerif
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] shadow-2xs'
                    : 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-rule)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <span className={`font-book-serif text-sm font-bold ${isSerif ? 'text-[var(--color-paper)]' : 'text-inherit'}`}>Aa</span>
                <span className={`font-book-serif font-medium ${isSerif ? 'text-[var(--color-paper)]' : 'text-inherit'}`}>古典衬线</span>
              </button>
              <button
                onClick={() => {
                  if (onSelectFontFamily) {
                    onSelectFontFamily(false);
                  } else if (isSerif) {
                    onToggleFontFamily();
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                  !isSerif
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] shadow-2xs'
                    : 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-rule)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <span className={`font-book-sans text-sm font-bold ${!isSerif ? 'text-[var(--color-paper)]' : 'text-inherit'}`}>Aa</span>
                <span className={`font-book-sans font-medium ${!isSerif ? 'text-[var(--color-paper)]' : 'text-inherit'}`}>现代无衬</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Settings Popup / Bottom Sheet: THEME & COLOR */}
      {activePanel === 'theme' && (
        <div
          className="fixed inset-x-0 bottom-0 md:bottom-auto md:inset-x-auto md:absolute md:right-16 md:top-1/2 md:-translate-y-1/2 md:w-64 bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border-t md:border border-[var(--color-rule)] rounded-t-3xl md:rounded-xl shadow-2xl p-5 md:p-4 animate-in slide-in-from-bottom md:zoom-in-95 duration-200 space-y-3 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div className="w-10 h-1 bg-[var(--color-rule)] rounded-full mx-auto -mt-1 mb-2 md:hidden" />

          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule)]">
            <span className="text-xs font-semibold font-book-serif text-[var(--color-ink)]">纸张色温与夜间</span>
            <button
              onClick={() => setActivePanel(null)}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                onSelectTheme('light');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 bg-[var(--color-paper-2)]'
                  : 'border-[var(--color-rule)]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#f8f5ee] border border-stone-300 shadow-2xs flex items-center justify-center">
                <Sun className="w-4 h-4 text-stone-700" />
              </div>
              <span className="text-[10px] text-[var(--color-ink-2)] font-meta-mono">自然光</span>
            </button>

            <button
              onClick={() => {
                onSelectTheme('sepia');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                theme === 'sepia'
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 bg-[#f4ecd8]/40'
                  : 'border-[var(--color-rule)]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#ede1c7] border border-[#d6c4a0] shadow-2xs flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[#594433]" />
              </div>
              <span className="text-[10px] text-[var(--color-ink-2)] font-meta-mono">羊皮纸</span>
            </button>

            <button
              onClick={() => {
                onSelectTheme('dark');
                setActivePanel(null);
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 bg-stone-900'
                  : 'border-[var(--color-rule)]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#161719] border border-stone-700 shadow-2xs flex items-center justify-center">
                <Moon className="w-4 h-4 text-stone-300" />
              </div>
              <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono">典藏夜间</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Desktop Floating Vertical Dock (hidden on mobile, shown on md:) */}
      <aside
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 transition-all duration-300 ease-in-out ${
          isStudySidebarOpen ? 'right-[336px]' : 'right-5'
        } ${
          isControlsVisible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-paper-2)]/95 backdrop-blur-md rounded-full p-1.5 flex flex-col gap-2 shadow-xl border border-[var(--color-rule)] text-[var(--color-ink-2)]">
          {/* 1. TOC 目录 */}
          <button
            onClick={onOpenTOC}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)] transition-colors group relative cursor-pointer"
            title="目录"
          >
            <Menu className="w-4 h-4" />
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              章节目录
            </span>
          </button>

          {/* 2. AI 深度语法树/精读模式切换与研读助手联动 */}
          <button
            onClick={() => {
              if (readingMode === 'study') {
                if (onToggleStudySidebar) {
                  onToggleStudySidebar();
                } else {
                  onToggleReadingMode('zen');
                }
              } else {
                onToggleReadingMode('study');
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all group relative cursor-pointer ${
              readingMode === 'study'
                ? isStudySidebarOpen
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)] shadow-2xs'
                  : 'bg-[var(--color-paper-elevated)] text-[var(--color-accent)] border border-[var(--color-accent)]/50 shadow-2xs'
                : 'hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)]'
            }`}
            title={
              readingMode === 'study'
                ? isStudySidebarOpen
                  ? '收起研读助手边栏 (保持正文考纲高亮)'
                  : '展开研读助手边栏 (考纲雷达与生词清单)'
                : '开启精读助读模式'
            }
          >
            {readingMode === 'study' ? (
              <>
                <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                {!isStudySidebarOpen && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                )}
              </>
            ) : (
              <Feather className="w-4 h-4" />
            )}
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              {readingMode === 'study'
                ? isStudySidebarOpen
                  ? '收起研读助手'
                  : '展开研读助手'
                : '精读研读'}
            </span>
          </button>

          {/* 3. 生词本 & 划线笔记 */}
          <button
            onClick={onOpenVocab}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)] transition-colors group relative cursor-pointer"
            title="生词本与笔记"
          >
            <Bookmark className="w-4 h-4" />
            {vocabCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-[var(--color-paper)] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-meta-mono">
                {vocabCount}
              </span>
            )}
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              {vocabCount > 0 ? `生词本 (${vocabCount})` : '生词本'}
            </span>
          </button>

          {/* 4. 双栏翻页 vs 滚动阅读切换 */}
          <button
            onClick={() => onToggleLayoutMode(layoutMode === 'scroll' ? 'double' : 'scroll')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors group relative cursor-pointer ${
              layoutMode === 'double'
                ? 'bg-[var(--color-paper-elevated)] text-[var(--color-accent)] border border-[var(--color-rule)]'
                : 'hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)]'
            }`}
            title={layoutMode === 'double' ? '切换为纵向滚动' : '切换为双栏翻页'}
          >
            {layoutMode === 'double' ? (
              <Columns2 className="w-4 h-4" />
            ) : (
              <Scroll className="w-4 h-4" />
            )}
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              {layoutMode === 'double' ? '切为滚动' : '切为双栏'}
            </span>
          </button>

          {/* 5. 字体与字号调节 */}
          <button
            onClick={() => togglePanel('font')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors group relative cursor-pointer ${
              activePanel === 'font'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)]'
            }`}
            title="排版与字号"
          >
            <Type className="w-4 h-4" />
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              字号排版
            </span>
          </button>

          {/* 6. 主题背景色 */}
          <button
            onClick={() => togglePanel('theme')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors group relative cursor-pointer ${
              activePanel === 'theme'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'hover:bg-[var(--color-paper-elevated)] hover:text-[var(--color-ink)]'
            }`}
            title="纸张色温"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'sepia' ? (
              <Coffee className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span className="absolute right-11 bg-[var(--color-ink)] text-[var(--color-paper)] text-[10px] font-meta-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
              纸张色温
            </span>
          </button>

          {/* 7. Collapse Button on Desktop */}
          {onToggleControls && (
            <button
              onClick={onToggleControls}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-elevated)] transition-colors cursor-pointer border-t border-[var(--color-rule)]/60 mt-1"
              title="收起边栏"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 5. Mobile WeChat Read Bottom Bar (visible only on mobile, collapsible) */}
      <nav
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-paper-2)]/95 backdrop-blur-md border-t border-[var(--color-rule)] px-2 py-2 flex items-center justify-around shadow-2xl transition-all duration-300 ease-in-out ${
          isControlsVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 目录 */}
        <button
          onClick={onOpenTOC}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] cursor-pointer"
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-[10px] font-meta-mono">目录</span>
        </button>

        {/* 2. 版式切换 */}
        <button
          onClick={() => onToggleLayoutMode(layoutMode === 'scroll' ? 'double' : 'scroll')}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] cursor-pointer"
        >
          {layoutMode === 'double' ? (
            <Columns2 className="w-4.5 h-4.5 text-[var(--color-accent)]" />
          ) : (
            <Scroll className="w-4.5 h-4.5" />
          )}
          <span className="text-[10px] font-meta-mono">{layoutMode === 'double' ? '双栏' : '滚动'}</span>
        </button>

        {/* 3. 模式与研读助手 */}
        <button
          onClick={() => {
            if (readingMode === 'study') {
              if (onToggleStudySidebar) {
                onToggleStudySidebar();
              } else {
                onToggleReadingMode('zen');
              }
            } else {
              onToggleReadingMode('study');
            }
          }}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] cursor-pointer"
        >
          {readingMode === 'study' ? (
            <BookOpen className="w-4.5 h-4.5 text-[var(--color-accent)]" />
          ) : (
            <Feather className="w-4.5 h-4.5" />
          )}
          <span className="text-[10px] font-meta-mono">
            {readingMode === 'study' ? (isStudySidebarOpen ? '收起研读' : '展开研读') : '精读'}
          </span>
        </button>

        {/* 4. 字号排版 */}
        <button
          onClick={() => togglePanel('font')}
          className={`flex flex-col items-center gap-1 py-1 px-2 cursor-pointer transition-colors ${
            activePanel === 'font' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-ink-2)]'
          }`}
        >
          <Type className="w-4.5 h-4.5" />
          <span className="text-[10px] font-meta-mono">字号</span>
        </button>

        {/* 5. 纸张色温 */}
        <button
          onClick={() => togglePanel('theme')}
          className={`flex flex-col items-center gap-1 py-1 px-2 cursor-pointer transition-colors ${
            activePanel === 'theme' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-ink-2)]'
          }`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4.5 h-4.5" />
          ) : theme === 'sepia' ? (
            <Coffee className="w-4.5 h-4.5" />
          ) : (
            <Sun className="w-4.5 h-4.5" />
          )}
          <span className="text-[10px] font-meta-mono">色温</span>
        </button>

        {/* 6. 生词本 */}
        <button
          onClick={onOpenVocab}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] cursor-pointer relative"
        >
          <Bookmark className="w-4.5 h-4.5" />
          {vocabCount > 0 && (
            <span className="absolute top-0 right-1 bg-[var(--color-accent)] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-meta-mono shadow-xs">
              {vocabCount}
            </span>
          )}
          <span className="text-[10px] font-meta-mono">生词本</span>
        </button>
      </nav>
    </>
  );
};
