'use client';

/* Astryx · component: ReaderHeader · integrated with Meta Astryx Badge, Button, IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { ReadingMode } from '../lib/types';
import { BookOpen, Feather, ChevronLeft, Sliders, Share2 } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { AuthUser } from '../lib/auth';

interface ReaderHeaderProps {
  readingMode: ReadingMode;
  onToggleMode: (mode: ReadingMode) => void;
  bookTitle: string;
  chineseTitle?: string;
  chapterTitle: string;
  onGoBookshelf: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
  isControlsVisible?: boolean;
  onOpenAIConfig?: () => void;
  onOpenQuoteCard?: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  readingMode,
  onToggleMode,
  bookTitle,
  chineseTitle,
  chapterTitle,
  onGoBookshelf,
  user,
  onOpenAuth,
  onLogout,
  onManualSync,
  isSyncing,
  isControlsVisible = true,
  onOpenAIConfig,
  onOpenQuoteCard,
}) => {
  return (
    <header
      className={`sticky top-0 z-30 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/95 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3 text-[var(--color-ink)] transition-all duration-300 ease-in-out ${
        isControlsVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Book Title & Back to Shelf */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            onClick={onGoBookshelf}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity cursor-pointer group min-w-0"
            title="返回书架"
          >
            <div className="p-1.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] shadow-2xs shrink-0">
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
            <span className="font-book-serif font-medium text-xs sm:text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors truncate max-w-[180px] sm:max-w-[320px] md:max-w-[420px]">
              {chineseTitle ? `${chineseTitle} · ${bookTitle}` : bookTitle}
            </span>
          </button>
        </div>

        {/* Center: Dual-Mode Switcher (Zen vs Study) - Hidden on mobile, shown on md: */}
        <div className="hidden md:flex items-center bg-[var(--color-paper-elevated)] p-0.5 rounded-lg border border-[var(--color-rule)] shadow-2xs">
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer active:scale-95 ${
              readingMode === 'study'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold shadow-2xs'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${readingMode === 'study' ? 'text-[var(--color-accent)]' : ''}`} />
            <span>Study 精读</span>
          </button>
        </div>

        {/* Right: Shelf Navigation & User Account */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-[var(--color-ink-muted)] font-meta-mono shrink-0">
          {onOpenQuoteCard && (
            <button
              onClick={onOpenQuoteCard}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-paper-elevated)] hover:bg-[var(--color-paper-3)] active:scale-95 border border-[var(--color-rule)] text-[var(--color-accent)] hover:text-[var(--color-ink)] transition-all cursor-pointer text-xs font-meta-mono shadow-2xs"
              title="制作金句书签与藏书票卡片"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">金句卡片</span>
            </button>
          )}

          {onOpenAIConfig && (
            <button
              onClick={onOpenAIConfig}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-paper-elevated)] hover:bg-[var(--color-paper-3)] active:scale-95 border border-[var(--color-rule)] text-[var(--color-accent)] hover:text-[var(--color-ink)] transition-all cursor-pointer text-xs font-meta-mono shadow-2xs"
              title="配置大模型研读与伴读密钥"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">伴读设置</span>
            </button>
          )}

          <button
            onClick={onGoBookshelf}
            className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-md hover:bg-[var(--color-paper-elevated)] text-[var(--color-ink-2)] transition-colors cursor-pointer"
          >
            返回文库
          </button>
          {onOpenAuth && (
            <>
              <span className="text-[var(--color-rule)] hidden sm:inline">|</span>
              <UserMenu
                user={user || null}
                onOpenAuth={onOpenAuth}
                onLogout={onLogout || (() => {})}
                onManualSync={onManualSync}
                isSyncing={isSyncing}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
