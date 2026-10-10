'use client';

import React from 'react';
import { Volume2, Bookmark, Check, Sparkles, X } from 'lucide-react';
import { DictEntry } from '../lib/mockData';

interface WordPopoverProps {
  wordEntry: DictEntry;
  rawWord: string;
  position: { x: number; y: number };
  isSaved: boolean;
  onSave: () => void;
  onClose: () => void;
  onDeepDive?: () => void;
}

export const WordPopover: React.FC<WordPopoverProps> = ({
  wordEntry,
  rawWord,
  position,
  isSaved,
  onSave,
  onClose,
  onDeepDive,
}) => {
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordEntry.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getBadgeColor = (level?: string) => {
    switch (level) {
      case 'GRE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'KY':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'CET6':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'CET4':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 mt-2 w-76 sm:w-84 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 p-4 animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: `${Math.min(Math.max(position.x, 160), typeof window !== 'undefined' ? window.innerWidth - 160 : 300)}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {wordEntry.word}
            </h4>
            {wordEntry.level && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeColor(wordEntry.level)}`}>
                {wordEntry.level}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-stone-500 dark:text-stone-400 text-xs">
            <span className="font-mono">{wordEntry.phonetic}</span>
            <button
              onClick={playAudio}
              className="p-1 hover:text-amber-600 dark:hover:text-amber-400 rounded-md transition-colors"
              title="朗读发音"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="py-2.5 space-y-1.5 text-sm">
        <div className="flex items-start gap-1.5">
          <span className="font-serif italic text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
            {wordEntry.pos}
          </span>
          <span className="text-stone-800 dark:text-stone-200 leading-snug font-medium">
            {wordEntry.translation}
          </span>
        </div>

        {wordEntry.englishDef && (
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
            {wordEntry.englishDef}
          </p>
        )}

        {wordEntry.collocations && wordEntry.collocations.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-1">
            {wordEntry.collocations.map((col, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded"
              >
                {col}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
        <button
          onClick={onSave}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            isSaved
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
          <span>{isSaved ? '已在生词本' : '加生词本'}</span>
        </button>

        {onDeepDive && (
          <button
            onClick={onDeepDive}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 语境拆解</span>
          </button>
        )}
      </div>
    </div>
  );
};
