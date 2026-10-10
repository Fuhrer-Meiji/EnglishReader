'use client';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {bookTitle}
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{author} · 章节目录</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
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
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div>
                  <div className="text-sm">{ch.title}</div>
                  {ch.subtitle && (
                    <div className="text-xs text-stone-400 font-serif italic truncate max-w-[280px]">
                      {ch.subtitle}
                    </div>
                  )}
                </div>
                {isCurrent && <Check className="w-4 h-4 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
