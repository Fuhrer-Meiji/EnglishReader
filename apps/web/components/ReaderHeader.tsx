'use client';

/* Astryx · component: ReaderHeader · integrated with Meta Astryx Badge, Button, IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { ReadingMode } from '../lib/types';
import { BookOpen, BookmarkCheck, BookmarkPlus, Sparkles, Feather } from 'lucide-react';
import { Badge, Button, IconButton } from '@astryxdesign/core';
import { UserMenu } from './UserMenu';
import { AuthUser } from '../lib/auth';

interface ReaderHeaderProps {
  readingMode: ReadingMode;
  onToggleMode: (mode: ReadingMode) => void;
  bookTitle: string;
  chineseTitle?: string;
  chapterTitle: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onGoBookshelf: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  readingMode,
  onToggleMode,
  bookTitle,
  chineseTitle,
  chapterTitle,
  isBookmarked,
  onToggleBookmark,
  onGoBookshelf,
  user,
  onOpenAuth,
  onLogout,
  onManualSync,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/95 backdrop-blur-md px-4 sm:px-8 py-3 text-[var(--color-ink)] transition-[background-color,border-color] duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Book Title & Back to Shelf */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onGoBookshelf}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
            title="返回书架"
          >
            <div className="p-1.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] shadow-2xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-book-serif font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors truncate">
              {chineseTitle ? `${chineseTitle} · ${bookTitle}` : bookTitle}
            </span>
          </button>

          <Button
            label={isBookmarked ? '在架典藏' : '收入书架'}
            size="sm"
            variant={isBookmarked ? 'primary' : 'secondary'}
            icon={
              isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <BookmarkPlus className="w-3.5 h-3.5" />
              )
            }
            onClick={onToggleBookmark}
          />
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

        {/* Right: Shelf Navigation & User Account */}
        <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink-muted)] font-meta-mono">
          <Button
            label="返回文库"
            size="sm"
            variant="ghost"
            onClick={onGoBookshelf}
          />
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
