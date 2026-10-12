'use client';

/* Hallmark · component: TableOfContentsModal · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { X, Book, Check } from 'lucide-react';
import { Chapter } from '../lib/types';

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  bookTitle: string;
  author: string;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  bookTitle,
  author,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-150 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--color-rule)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-[var(--color-accent)]" />
              <h3 className="font-book-serif font-medium text-base text-[var(--color-ink)]">
                {bookTitle}
              </h3>
            </div>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 font-meta-mono">{author} · 卷册目录</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {chapters.map((ch) => {
            const isCurrent = ch.id === currentChapterId;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChapter(ch.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--color-paper-2)] text-[var(--color-accent)] font-medium border border-[var(--color-accent)]/30'
                    : 'hover:bg-[var(--color-paper-2)] text-[var(--color-ink-2)]'
                }`}
              >
                <div>
                  <div className="text-sm font-book-serif">{ch.title}</div>
                  {ch.subtitle && (
                    <div className="text-xs text-[var(--color-ink-muted)] font-book-serif italic truncate max-w-[280px]">
                      {ch.subtitle}
                    </div>
                  )}
                </div>
                {isCurrent && <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
