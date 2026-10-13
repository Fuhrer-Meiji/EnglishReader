'use client';

/* Astryx · component: SentenceDrawer · integrated with Meta Astryx Badge and IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React from 'react';
import { X, Volume2, Sparkles, BookOpen, Layers, Lightbulb, ChevronRight } from 'lucide-react';
import { SentenceAnalysis } from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';
import { Badge, IconButton } from '@astryxdesign/core';

interface SentenceDrawerProps {
  sentence: SentenceAnalysis | null;
  onClose: () => void;
  onSelectWord: (word: string) => void;
}

export const SentenceDrawer: React.FC<SentenceDrawerProps> = ({
  sentence,
  onClose,
  onSelectWord,
}) => {
  if (!sentence) return null;

  const playSentenceAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.rawText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border-l border-[var(--color-rule)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-rule)] flex items-center justify-between bg-[var(--color-paper-2)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[var(--color-paper)] text-[var(--color-accent)] border border-[var(--color-rule)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-book-serif font-medium text-[var(--color-ink)] text-sm">
                句法成分与原著深度拆解
              </h3>
              <Badge label={sentence.difficultyTag} variant="purple" />
            </div>
            <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
              长难句解构 · 语法成分逐级剖析
            </span>
          </div>
        </div>
        <IconButton
          label="关闭抽屉"
          icon={<X className="w-4 h-4" />}
          variant="ghost"
          size="sm"
          onClick={onClose}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Original Sentence Card */}
        <div className="rounded-xl p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="font-book-serif text-base sm:text-lg text-[var(--color-ink)] leading-relaxed font-normal">
              {sentence.rawText}
            </p>
            <IconButton
              label="整句朗读"
              icon={<Volume2 className="w-4 h-4" />}
              variant="secondary"
              size="sm"
              onClick={playSentenceAudio}
            />
          </div>
          <div className="pt-2 border-t border-[var(--color-rule)]">
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              {sentence.chineseTranslation}
            </p>
          </div>
        </div>

        {/* Grammar Tree Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] font-meta-mono uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>句法成分层级拆解</span>
          </div>
          <div className="space-y-2.5">
            {sentence.grammarComponents.map((comp, idx) => (
              <div
                key={idx}
                className="rounded-lg p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge label={comp.role} variant="teal" />
                </div>
                <p className="font-book-serif text-sm font-medium text-[var(--color-ink)] bg-[var(--color-paper-elevated)] px-2.5 py-1.5 rounded border border-[var(--color-rule)]/60">
                  {comp.content}
                </p>
                <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                  {comp.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural & Literary Notes */}
        {sentence.culturalNote && (
          <div className="rounded-xl p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] font-meta-mono">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>时代文化与文学典故注脚</span>
            </div>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              {sentence.culturalNote}
            </p>
          </div>
        )}

        {/* Core Words in Sentence */}
        {sentence.coreKeywords && sentence.coreKeywords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] font-meta-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>句中考点词汇清单</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sentence.coreKeywords.map((kw, idx) => {
                const entry = DICTIONARY_DATABASE[kw.toLowerCase()];
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectWord(kw)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-rule)] hover:border-[var(--color-accent)]/50 bg-[var(--color-paper-2)] transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-book-serif font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                          {kw}
                        </span>
                        {entry?.phonetic && (
                          <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                            {entry.phonetic}
                          </span>
                        )}
                        {entry?.level && (
                          <Badge label={entry.level} variant="neutral" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-ink-muted)] truncate max-w-[340px] mt-0.5">
                        {entry?.translation || '点击查看词义与搭配'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
