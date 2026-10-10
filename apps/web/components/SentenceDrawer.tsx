'use client';

import React from 'react';
import { X, Volume2, Sparkles, BookOpen, Layers, Lightbulb, ChevronRight } from 'lucide-react';
import { SentenceAnalysis } from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';

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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              AI 语法树与深度句法剖析
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              难度评定：<span className="font-medium text-amber-600 dark:text-amber-400">{sentence.difficultyTag}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Original Sentence Card */}
        <div className="rounded-xl p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="font-serif text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
              {sentence.rawText}
            </p>
            <button
              onClick={playSentenceAudio}
              className="shrink-0 p-2 text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs hover:shadow transition-all"
              title="整句朗读"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/40">
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {sentence.chineseTranslation}
            </p>
          </div>
        </div>

        {/* Grammar Tree Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>句法成分层级拆解</span>
          </div>
          <div className="space-y-2.5">
            {sentence.grammarComponents.map((comp, idx) => (
              <div
                key={idx}
                className="rounded-lg p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
                    {comp.role}
                  </span>
                </div>
                <p className="font-serif text-sm font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                  {comp.content}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {comp.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural & Literary Notes */}
        {sentence.culturalNote && (
          <div className="rounded-xl p-4 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>时代文化与文学典故注脚</span>
            </div>
            <p className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
              {sentence.culturalNote}
            </p>
          </div>
        )}

        {/* Core Words in Sentence */}
        {sentence.coreKeywords && sentence.coreKeywords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
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
                    className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-stone-900 transition-all text-left group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-800 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {kw}
                        </span>
                        {entry?.phonetic && (
                          <span className="text-xs text-stone-400 font-mono">
                            {entry.phonetic}
                          </span>
                        )}
                        {entry?.level && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                            {entry.level}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[340px] mt-0.5">
                        {entry?.translation || '点击查看词义与搭配'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
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
