'use client';

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
      window.speechSynthesis.speak(utterance);
    }
  };

  const exportToAnki = () => {
    // Generate TSV format for Anki: Front (Word + Audio hint) \t Back (Phonetic + Translation + Context Sentence)
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:w-[440px] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                语境生词本 ({vocabItems.length})
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                生词自动绑定原文句子与出处
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3.5 border-b border-stone-100 dark:border-stone-800/80 space-y-2.5 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索单词或中文释义..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-1">
              {(['all', 'learning', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    filterStatus === st
                      ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                      : 'text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {st === 'all' ? '全部' : st === 'learning' ? '复习中' : '已掌握'}
                </button>
              ))}
            </div>

            <button
              onClick={exportToAnki}
              disabled={vocabItems.length === 0}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出至 Anki</span>
            </button>
          </div>
        </div>

        {/* Word Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              暂无匹配的生词，在阅读时点击单词即可快速收藏。
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-amber-300 dark:hover:border-amber-700 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {item.word}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{item.phonetic}</span>
                    <button
                      onClick={() => playAudio(item.word)}
                      className="p-1 text-stone-400 hover:text-amber-500 rounded"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    {item.level && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 font-medium">
                        {item.level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className={`p-1 rounded-md transition-colors ${
                        item.status === 'mastered'
                          ? 'text-emerald-500 hover:text-emerald-600'
                          : 'text-stone-300 hover:text-stone-500 dark:text-stone-600'
                      }`}
                      title={item.status === 'mastered' ? '标为复习中' : '标为已掌握'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded-md text-stone-300 hover:text-rose-500 transition-colors"
                      title="移除生词"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-stone-700 dark:text-stone-300">
                  <span className="italic font-serif text-stone-400 mr-1.5">{item.pos}</span>
                  {item.translation}
                </div>

                {item.contextSentence && (
                  <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/80 border-l-2 border-amber-400 text-[11px] text-stone-500 dark:text-stone-400 font-serif italic">
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
