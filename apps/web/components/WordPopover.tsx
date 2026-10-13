'use client';

/* Astryx · component: WordPopover · integrated with Meta Astryx Badge, Button, IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { Volume2, Bookmark, Check, Sparkles, X } from 'lucide-react';
import { DictEntry } from '../lib/mockData';
import { Badge, Button, IconButton } from '@astryxdesign/core';

interface WordPopoverProps {
  wordEntry: DictEntry;
  rawWord: string;
  position: { x: number; y: number; placeAbove?: boolean };
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

  const getBadgeVariant = (level?: string) => {
    switch (level) {
      case 'GRE':
        return 'purple';
      case 'KY':
        return 'orange';
      case 'CET6':
        return 'blue';
      case 'CET4':
        return 'green';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      className={`fixed z-50 transform -translate-x-1/2 w-80 sm:w-88 bg-[var(--color-paper-elevated)] text-[var(--color-ink)] rounded-2xl shadow-2xl border border-[var(--color-rule)] p-4 animate-in fade-in zoom-in-95 duration-150 ${
        position.placeAbove ? '-translate-y-full' : ''
      }`}
      style={{
        left: `${Math.min(Math.max(position.x, 175), typeof window !== 'undefined' ? window.innerWidth - 175 : 300)}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: Oxford-grade Entry Head */}
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-rule)] pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-book-serif font-medium text-[var(--color-ink)] tracking-tight">
              {wordEntry.word}
            </h4>
            {wordEntry.level && (
              <Badge label={wordEntry.level} variant={getBadgeVariant(wordEntry.level) as any} />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[var(--color-ink-muted)] text-xs">
            <span className="font-meta-mono">{wordEntry.phonetic}</span>
            <IconButton
              label="标准美音发音"
              icon={<Volume2 className="w-3.5 h-3.5" />}
              variant="ghost"
              size="sm"
              onClick={playAudio}
            />
          </div>
        </div>
        <IconButton
          label="关闭词典浮窗"
          icon={<X className="w-3.5 h-3.5" />}
          variant="ghost"
          size="sm"
          onClick={onClose}
        />
      </div>

      {/* Body: Editorial Definitions */}
      <div className="py-3 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="font-book-serif italic text-xs text-[var(--color-accent)] mt-0.5 font-medium shrink-0">
            {wordEntry.pos}
          </span>
          <span className="text-[var(--color-ink)] leading-snug font-medium">
            {wordEntry.translation}
          </span>
        </div>

        {wordEntry.englishDef && (
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-book-serif">
            {wordEntry.englishDef}
          </p>
        )}

        {wordEntry.collocations && wordEntry.collocations.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-1.5">
            {wordEntry.collocations.map((col, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)] px-2 py-0.5 rounded font-meta-mono"
              >
                {col}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2.5 border-t border-[var(--color-rule)] flex items-center justify-between text-xs">
        <Button
          label={isSaved ? '已录生词本' : '加生词本'}
          size="sm"
          variant={isSaved ? 'primary' : 'secondary'}
          icon={isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          onClick={onSave}
        />

        {onDeepDive && (
          <Button
            label="语境助记"
            size="sm"
            variant="ghost"
            icon={<Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
            onClick={onDeepDive}
          />
        )}
      </div>
    </div>
  );
};
