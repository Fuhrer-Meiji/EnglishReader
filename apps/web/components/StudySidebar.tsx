'use client';

import React from 'react';
import { ChapterStats, DifficultyLevel } from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';
import { Gauge, BookA, Sliders, Volume2, Sparkles } from 'lucide-react';

interface StudySidebarProps {
  stats: ChapterStats;
  selectedLevelFilter: DifficultyLevel | 'ALL' | 'OFF';
  onSelectLevelFilter: (filter: DifficultyLevel | 'ALL' | 'OFF') => void;
  onSelectWord: (word: string) => void;
}

export const StudySidebar: React.FC<StudySidebarProps> = ({
  stats,
  selectedLevelFilter,
  onSelectLevelFilter,
  onSelectWord,
}) => {
  const filterOptions: { label: string; value: DifficultyLevel | 'ALL' | 'OFF' }[] = [
    { label: '全部标色', value: 'ALL' },
    { label: '四级+', value: 'CET4' },
    { label: '六级+', value: 'CET6' },
    { label: '考研+', value: 'KY' },
    { label: 'GRE高难', value: 'GRE' },
    { label: '关高亮', value: 'OFF' },
  ];

  const playWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const highLevelWords = Object.entries(DICTIONARY_DATABASE);

  return (
    <aside className="w-80 shrink-0 border-l border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 space-y-6 overflow-y-auto">
      {/* Chapter Readability Metrics */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
          <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>本章文本难度雷达</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 text-center shadow-xs">
            <span className="text-[10px] text-stone-400 block font-medium">CEFR 分级</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{stats.cefr}</span>
          </div>
          <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 text-center shadow-xs">
            <span className="text-[10px] text-stone-400 block font-medium">蓝思指数</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{stats.lexile}</span>
          </div>
          <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 text-center shadow-xs">
            <span className="text-[10px] text-stone-400 block font-medium">易读性评分</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{stats.fleschScore}</span>
          </div>
        </div>

        {/* Vocabulary Composition Bar */}
        <div className="space-y-1.5 bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700/80 shadow-xs">
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
            <span className="font-medium">词汇难度构成</span>
            <span className="text-[11px] text-stone-400">{stats.wordCount} 词</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-stone-200 dark:bg-stone-700">
            <div
              style={{ width: `${stats.levelDistribution.basic}%` }}
              className="bg-emerald-500"
              title={`基础词汇: ${stats.levelDistribution.basic}%`}
            />
            <div
              style={{ width: `${stats.levelDistribution.cet4}%` }}
              className="bg-blue-500"
              title={`CET-4: ${stats.levelDistribution.cet4}%`}
            />
            <div
              style={{ width: `${stats.levelDistribution.cet6}%` }}
              className="bg-amber-500"
              title={`CET-6: ${stats.levelDistribution.cet6}%`}
            />
            <div
              style={{ width: `${stats.levelDistribution.gre}%` }}
              className="bg-purple-500"
              title={`GRE/高阶: ${stats.levelDistribution.gre}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />基础 {stats.levelDistribution.basic}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />四级 {stats.levelDistribution.cet4}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />六级 {stats.levelDistribution.cet6}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />GRE {stats.levelDistribution.gre}%</span>
          </div>
        </div>
      </div>

      {/* Level Filter Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>正文词汇高亮门槛</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectLevelFilter(opt.value)}
              className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                selectedLevelFilter === opt.value
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-frequency Focus Words */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
            <BookA className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>重点精读词汇 ({highLevelWords.length})</span>
          </div>
          <span className="text-[10px] text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            点击查词
          </span>
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
          {highLevelWords.map(([rawKey, entry]) => (
            <div
              key={rawKey}
              onClick={() => onSelectWord(rawKey)}
              className="p-2 rounded-lg bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/70 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {entry.word}
                  </span>
                  {entry.level && (
                    <span className="text-[9px] font-medium px-1 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                      {entry.level}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                  {entry.translation}
                </p>
              </div>

              <button
                onClick={(e) => playWord(entry.word, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-amber-500 transition-opacity"
                title="朗读"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
