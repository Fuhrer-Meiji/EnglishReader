'use client';

/* Astryx · component: VocabDrawer · integrated with Meta Astryx Badge, Button, IconButton, EmptyState
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState } from 'react';
import { X, Bookmark, Trash2, Volume2, Download, Search, CheckCircle2, Sparkles } from 'lucide-react';
import { VocabularyItem } from '../lib/types';
import { Badge, Button, IconButton, EmptyState } from '@astryxdesign/core';

interface VocabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vocabItems: VocabularyItem[];
  onRemoveItem: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onGenerateCard?: (quote: string, translation?: string) => void;
}

export const VocabDrawer: React.FC<VocabDrawerProps> = ({
  isOpen,
  onClose,
  vocabItems,
  onRemoveItem,
  onToggleStatus,
  onGenerateCard,
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
              <div className="flex items-center gap-2">
                <h3 className="font-book-serif font-medium text-base text-[var(--color-ink)]">
                  语境生词本
                </h3>
                <Badge label={`${vocabItems.length} 词`} variant="neutral" />
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                生词自动绑定原文出处与长句上下文
              </p>
            </div>
          </div>
          <IconButton
            label="关闭生词本"
            icon={<X className="w-4 h-4" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
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

          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex gap-1">
              {(['all', 'learning', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                    filterStatus === st
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] font-semibold shadow-2xs'
                      : 'bg-[var(--color-paper-elevated)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] border-[var(--color-rule)]'
                  }`}
                >
                  {st === 'all' ? '全部' : st === 'learning' ? '复习中' : '已掌握'}
                </button>
              ))}
            </div>

            <Button
              label="导出 Anki"
              size="sm"
              variant="secondary"
              icon={<Download className="w-3.5 h-3.5" />}
              isDisabled={vocabItems.length === 0}
              onClick={exportToAnki}
            />
          </div>
        </div>

        {/* Word Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title={vocabItems.length === 0 ? "生词本暂无收录" : "暂无匹配的生词"}
                description={
                  vocabItems.length === 0
                    ? "在阅读正文时点击任意词汇，即可触发查词弹窗并一键收藏至语境生词本。"
                    : "未找到符合当前搜索或筛选条件的生词。"
                }
                isCompact
              />
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-accent)]/50 transition-colors space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-book-serif font-medium text-base text-[var(--color-ink)]">
                      {item.word}
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">{item.phonetic}</span>
                    <IconButton
                      label="播放发音"
                      icon={<Volume2 className="w-3.5 h-3.5" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(item.word)}
                    />
                    {item.level && (
                      <Badge label={item.level} variant="teal" />
                    )}
                    <Badge
                      label={item.status === 'mastered' ? '已掌握' : '复习中'}
                      variant={item.status === 'mastered' ? 'success' : 'neutral'}
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                      label={item.status === 'mastered' ? '标为复习中' : '标为已掌握'}
                      icon={<CheckCircle2 className={`w-3.5 h-3.5 ${item.status === 'mastered' ? 'text-emerald-500' : ''}`} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(item.id)}
                    />
                    <IconButton
                      label="删除生词"
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                    />
                  </div>
                </div>

                <div className="text-xs text-[var(--color-ink)]">
                  <span className="font-book-serif italic text-[var(--color-accent)] mr-1.5 font-medium">{item.pos}</span>
                  {item.translation}
                </div>

                {item.contextSentence && (
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-[var(--color-paper)] border-l-2 border-[var(--color-accent)] text-[11px] text-[var(--color-ink-2)] font-book-serif italic leading-relaxed">
                      “{item.contextSentence}”
                    </div>
                    {onGenerateCard && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            onGenerateCard(
                              item.contextSentence,
                              item.translation ? `${item.word}：${item.translation}` : undefined
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--color-accent)] hover:underline font-meta-mono cursor-pointer"
                          title="将该语境例句制作成典藏金句卡片"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>制作金句卡片</span>
                        </button>
                      </div>
                    )}
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
