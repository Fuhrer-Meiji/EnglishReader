'use client';

/* Hallmark · component: VocabDrawer · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState } from 'react';
import { X, Bookmark, Trash2, Volume2, Download, Search, CheckCircle2 } from 'lucide-react';
import { VocabularyItem } from '../lib/types';

interface VocabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vocabItems: VocabularyItem[];
  onRemoveItem: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const VocabDrawer: React.FC<VocabDrawerProps> = ({
  isOpen,
  onClose,
  vocabItems,
  onRemoveItem,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'learning' | 'mastered'>('all');

  if (!isOpen) return null;

  const filteredItems = vocabItems.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.includes(searchQuery);
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  const playAudio = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const exportToAnki = () => {
    const tsvContent = vocabItems
      .map(
        (v) =>
          `${v.word}\t${v.phonetic} ${v.pos} ${v.translation}<br><small>“${v.contextSentence}”</small>`
      )
      .join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'english_reader_anki_export.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full sm:w-[440px] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border-l border-[var(--color-rule)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-rule)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--color-paper-2)] text-[var(--color-accent)] border border-[var(--color-rule)] rounded-md">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-book-serif font-medium text-base text-[var(--color-ink)]">
                语境生词本 ({vocabItems.length})
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                生词自动绑定原文出处与长句上下文
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3.5 border-b border-[var(--color-rule)] space-y-2.5 bg-[var(--color-paper-2)]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索词汇或中文释义..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-focus)]"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-1">
              {(['all', 'learning', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-elevated)]'
                  }`}
                >
                  {st === 'all' ? '全部' : st === 'learning' ? '复习中' : '已掌握'}
                </button>
              ))}
            </div>

            <button
              onClick={exportToAnki}
              disabled={vocabItems.length === 0}
              className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] hover:underline disabled:opacity-30 cursor-pointer font-meta-mono"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 Anki</span>
            </button>
          </div>
        </div>

        {/* Word Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-ink-muted)] text-xs">
              暂无匹配的生词，在阅读时点击单词即可快速收藏。
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-accent)]/50 transition-colors space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-book-serif font-medium text-sm text-[var(--color-ink)]">
                      {item.word}
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">{item.phonetic}</span>
                    <button
                      onClick={() => playAudio(item.word)}
                      className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] rounded cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    {item.level && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] text-[var(--color-accent)] font-meta-mono">
                        {item.level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        item.status === 'mastered'
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                      }`}
                      title={item.status === 'mastered' ? '标为复习中' : '标为已掌握'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded text-[var(--color-ink-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                      title="移除生词"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[var(--color-ink)]">
                  <span className="font-book-serif italic text-[var(--color-accent)] mr-1.5">{item.pos}</span>
                  {item.translation}
                </div>

                {item.contextSentence && (
                  <div className="p-2 rounded bg-[var(--color-paper)] border-l-2 border-[var(--color-accent)] text-[11px] text-[var(--color-ink-2)] font-book-serif italic leading-relaxed">
                    “{item.contextSentence}”
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
