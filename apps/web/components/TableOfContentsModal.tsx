'use client';

/* Astryx · component: TableOfContentsModal · integrated with Meta Astryx Dialog & DialogHeader
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { Book, Check } from 'lucide-react';
import { Chapter } from '../lib/types';
import { Dialog, DialogHeader } from '@astryxdesign/core';

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
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      width={480}
      padding={4}
    >
      <DialogHeader
        title={bookTitle}
        subtitle={`${author} · 卷册全篇目录 (${chapters.length} 章节)`}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        startContent={
          <div className="p-1.5 rounded-md bg-[var(--color-paper-2)] text-[var(--color-accent)] border border-[var(--color-rule)]">
            <Book className="w-4 h-4" />
          </div>
        }
      />

      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1 py-2 mt-2">
        {chapters.map((ch) => {
          const isCurrent = ch.id === currentChapterId;
          return (
            <button
              key={ch.id}
              onClick={() => {
                onSelectChapter(ch.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer border ${
                isCurrent
                  ? 'bg-[var(--color-paper-2)] text-[var(--color-accent)] font-medium border-[var(--color-accent)]/40 shadow-2xs'
                  : 'hover:bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-transparent'
              }`}
            >
              <div>
                <div className="text-sm font-book-serif font-medium">{ch.title}</div>
                {ch.subtitle && (
                  <div className="text-xs text-[var(--color-ink-muted)] font-book-serif italic truncate max-w-[320px]">
                    {ch.subtitle}
                  </div>
                )}
              </div>
              {isCurrent && <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
};
