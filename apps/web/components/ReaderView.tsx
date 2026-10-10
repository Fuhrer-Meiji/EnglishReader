'use client';

import React from 'react';
import { Chapter, ReadingMode, ThemeMode, DifficultyLevel, SentenceAnalysis } from '../lib/types';
import { DICTIONARY_DATABASE, DictEntry } from '../lib/mockData';
import { Sparkles, HelpCircle } from 'lucide-react';

interface ReaderViewProps {
  chapter: Chapter;
  readingMode: ReadingMode;
  theme: ThemeMode;
  fontSize: number;
  isSerif: boolean;
  selectedLevelFilter: DifficultyLevel | 'ALL' | 'OFF';
  onWordClick: (word: string, rect: DOMRect) => void;
  onSentenceAnalyze: (sentence: SentenceAnalysis) => void;
  activeSentenceId?: string;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  chapter,
  readingMode,
  theme,
  fontSize,
  isSerif,
  selectedLevelFilter,
  onWordClick,
  onSentenceAnalyze,
  activeSentenceId,
}) => {
  // Helper to test if a word qualifies for highlighting under current filter
  const shouldHighlightWord = (level?: DifficultyLevel) => {
    if (readingMode === 'zen' || selectedLevelFilter === 'OFF' || !level) return false;
    if (selectedLevelFilter === 'ALL') return true;
    if (selectedLevelFilter === 'CET4') return true;
    if (selectedLevelFilter === 'CET6') return level === 'CET6' || level === 'KY' || level === 'GRE';
    if (selectedLevelFilter === 'KY') return level === 'KY' || level === 'GRE';
    if (selectedLevelFilter === 'GRE') return level === 'GRE';
    return false;
  };

  const getWordHighlightClass = (level?: DifficultyLevel) => {
    if (!level) return '';
    switch (level) {
      case 'GRE':
        return 'text-purple-700 dark:text-purple-400 underline decoration-purple-400 decoration-wavy underline-offset-4 font-medium hover:bg-purple-100/50 dark:hover:bg-purple-950/40 rounded-xs px-0.5';
      case 'KY':
        return 'text-rose-700 dark:text-rose-400 underline decoration-rose-400 decoration-dotted underline-offset-4 font-medium hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded-xs px-0.5';
      case 'CET6':
        return 'text-amber-700 dark:text-amber-400 underline decoration-amber-400 decoration-dotted underline-offset-4 font-medium hover:bg-amber-100/50 dark:hover:bg-amber-950/40 rounded-xs px-0.5';
      case 'CET4':
        return 'text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-dotted underline-offset-4 font-medium hover:bg-blue-100/50 dark:hover:bg-blue-950/40 rounded-xs px-0.5';
      default:
        return '';
    }
  };

  // Split sentence rawText into tokens of words and punctuations
  const renderInteractiveSentence = (sent: SentenceAnalysis) => {
    // Regex splits by word characters keeping punctuation
    const tokens = sent.rawText.split(/([a-zA-Z’']+)/g);

    return (
      <span
        key={sent.id}
        className={`relative inline transition-colors rounded-lg ${
          activeSentenceId === sent.id
            ? 'bg-amber-100/60 dark:bg-amber-950/40 ring-2 ring-amber-300 dark:ring-amber-700'
            : ''
        }`}
      >
        {tokens.map((token, idx) => {
          const clean = token.toLowerCase().replace(/[’']/g, '');
          const isWord = /^[a-zA-Z’']+$/.test(token);
          const dictEntry = isWord ? DICTIONARY_DATABASE[clean] : undefined;
          const isHighlighted = dictEntry && shouldHighlightWord(dictEntry.level);

          if (!isWord) {
            return <span key={idx}>{token}</span>;
          }

          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onWordClick(token, rect);
              }}
              className={`cursor-pointer transition-colors duration-150 inline-block ${
                isHighlighted
                  ? getWordHighlightClass(dictEntry?.level)
                  : 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-xs'
              }`}
            >
              {token}
            </span>
          );
        })}

        {/* Study Mode: Sentence Analysis Trigger Icon */}
        {readingMode === 'study' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSentenceAnalyze(sent);
            }}
            className="inline-flex items-center align-middle mx-1.5 p-1 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-100/80 dark:hover:bg-amber-950/50 transition-all opacity-80 hover:opacity-100"
            title="拆解长难句语法树与意译"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </span>
    );
  };

  return (
    <article
      className={`mx-auto transition-all ${
        readingMode === 'zen' ? 'max-w-2xl py-12 px-6 sm:px-8' : 'max-w-3xl py-8 px-6'
      }`}
    >
      {/* Chapter Title & Subtitle */}
      <div className="mb-10 text-center space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight opacity-90">
          {chapter.title}
        </h2>
        {chapter.subtitle && (
          <p className="text-xs sm:text-sm italic opacity-60 font-serif">
            {chapter.subtitle}
          </p>
        )}
        <div className="w-12 h-0.5 bg-amber-500/40 mx-auto mt-4 rounded-full" />
      </div>

      {/* Main Prose Text */}
      <div
        className={`space-y-6 leading-relaxed select-text ${
          isSerif ? 'font-serif' : 'font-sans'
        }`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
      >
        <p className="indent-8 text-justify">
          {chapter.sentences.slice(0, 2).map((sent) => renderInteractiveSentence(sent))}
        </p>
        <p className="indent-8 text-justify">
          {chapter.sentences.slice(2, 4).map((sent) => renderInteractiveSentence(sent))}
        </p>
        <p className="indent-8 text-justify">
          {chapter.sentences.slice(4).map((sent) => renderInteractiveSentence(sent))}
        </p>
      </div>

      {/* Chapter Footer Pagination / Mode Hint */}
      <div className="mt-16 pt-8 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-xs opacity-60">
        <span>The Great Gatsby · Chapter 1 of 9</span>
        <div className="flex items-center gap-1.5">
          <span>当前：{readingMode === 'zen' ? '🧘 Zen 心流模式' : '🎓 Study 精读模式'}</span>
        </div>
      </div>
    </article>
  );
};
