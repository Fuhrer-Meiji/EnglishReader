'use client';

import React, { useMemo } from 'react';
import {
  Chapter,
  ReadingMode,
  LayoutMode,
  ThemeMode,
  DifficultyLevel,
  SentenceAnalysis,
} from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReaderViewProps {
  chapter: Chapter;
  readingMode: ReadingMode;
  layoutMode: LayoutMode;
  theme: ThemeMode;
  fontSize: number;
  isSerif: boolean;
  selectedLevelFilter: DifficultyLevel | 'ALL' | 'OFF';
  onWordClick: (word: string, rect: DOMRect) => void;
  onSentenceAnalyze: (sentence: SentenceAnalysis) => void;
  activeSentenceId?: string;
  currentPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  chapter,
  readingMode,
  layoutMode,
  theme,
  fontSize,
  isSerif,
  selectedLevelFilter,
  onWordClick,
  onSentenceAnalyze,
  activeSentenceId,
  currentPage,
  onNextPage,
  onPrevPage,
}) => {
  // Check if a word should have study highlights
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
        return 'text-purple-800 dark:text-purple-300 border-b border-purple-500/80 dark:border-purple-400 font-medium';
      case 'KY':
        return 'text-rose-800 dark:text-rose-300 border-b border-rose-500/80 dark:border-rose-400 font-medium';
      case 'CET6':
        return 'text-amber-800 dark:text-amber-300 border-b border-amber-600/80 dark:border-amber-400 font-medium';
      case 'CET4':
        return 'text-blue-800 dark:text-blue-300 border-b border-blue-500/80 dark:border-blue-400 font-medium';
      default:
        return '';
    }
  };

  // Render sentence tokens naturally without artificial block spacing
  const renderInteractiveSentence = (sent: SentenceAnalysis) => {
    const tokens = sent.rawText.split(/([a-zA-Z’']+)/g);
    const isCurrentActive = activeSentenceId === sent.id;

    return (
      <span
        key={sent.id}
        className={`transition-colors rounded-xs ${
          isCurrentActive
            ? 'bg-amber-200/50 dark:bg-amber-900/50 px-0.5 ring-1 ring-amber-400/50'
            : ''
        }`}
      >
        {tokens.map((token, idx) => {
          const clean = token.toLowerCase().replace(/[’']/g, '');
          const isWord = /^[a-zA-Z’']+$/.test(token);

          if (!isWord) {
            return token;
          }

          const dictEntry = DICTIONARY_DATABASE[clean];
          const isHighlighted = dictEntry && shouldHighlightWord(dictEntry.level);

          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onWordClick(token, rect);
              }}
              className={`cursor-pointer transition-colors duration-100 ${
                isHighlighted
                  ? getWordHighlightClass(dictEntry?.level)
                  : 'hover:text-amber-700 dark:hover:text-amber-300'
              }`}
            >
              {token}
            </span>
          );
        })}

        {readingMode === 'study' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSentenceAnalyze(sent);
            }}
            className="inline-flex items-center align-middle ml-1.5 p-0.5 rounded-sm text-amber-600/70 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400/70 dark:hover:text-amber-300 dark:hover:bg-amber-950/60 transition-all"
            title="拆解长难句语法树与译文"
          >
            <Sparkles className="w-3.5 h-3.5 inline" />
          </button>
        )}
      </span>
    );
  };

  // Helper to group arbitrary list of sentences into book paragraphs
  const groupSentencesIntoParagraphs = (sentences: SentenceAnalysis[]) => {
    const pMap = new Map<number, SentenceAnalysis[]>();
    sentences.forEach((sent) => {
      const pIdx = sent.paragraphIndex ?? 0;
      if (!pMap.has(pIdx)) {
        pMap.set(pIdx, []);
      }
      pMap.get(pIdx)!.push(sent);
    });
    return Array.from(pMap.values());
  };

  // Two-column pagination spreads
  const spreads = useMemo(() => {
    return [
      {
        left: chapter.sentences.slice(0, 4), // sent-1, 2, 3, 4
        right: chapter.sentences.slice(4, 7), // sent-5, 6, 7
      },
      {
        left: chapter.sentences.slice(7, 10), // sent-8, 9, 10
        right: chapter.sentences.slice(10, 13), // sent-11, 12, 13
      },
    ];
  }, [chapter.sentences]);

  const currentSpread = spreads[currentPage] || spreads[0];
  const totalPages = spreads.length;

  // -------------------------------------------------------------
  // Mode 1: 双栏翻页阅读 (WeChat Read Two-Column Spread Mode)
  // -------------------------------------------------------------
  if (layoutMode === 'double') {
    const leftParagraphs = groupSentencesIntoParagraphs(currentSpread.left);
    const rightParagraphs = groupSentencesIntoParagraphs(currentSpread.right);

    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 transition-all animate-in fade-in duration-200">
        <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800/90 shadow-xl p-8 sm:p-12 min-h-[680px] flex flex-col justify-between backdrop-blur-xs">
          {/* Two-Column Grid (Left Page + Right Page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 flex-1">
            {/* Left Column (左栏) */}
            <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200/60 dark:border-stone-800/60 pb-6 md:pb-0 md:pr-10 lg:pr-14">
              <div>
                {currentPage === 0 ? (
                  <div className="mb-8">
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-sans block mb-1">
                      {chapter.title}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-book-serif text-stone-900 dark:text-stone-100 tracking-tight">
                      {chapter.title}
                    </h2>
                    <div className="w-full h-0.5 bg-amber-500/80 mt-3 rounded-full" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-sans pb-4 mb-6 border-b border-stone-100 dark:border-stone-800/60">
                    <span>The Great Gatsby</span>
                    <span>{chapter.title}</span>
                  </div>
                )}

                {/* Left Column Paragraphs */}
                <div
                  className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.85,
                    letterSpacing: '0.005em',
                  }}
                >
                  {leftParagraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-left indent-[2em] mb-6 leading-[1.85]">
                      {para.map((sent, sIdx) => (
                        <React.Fragment key={sent.id}>
                          {sIdx > 0 ? ' ' : ''}
                          {renderInteractiveSentence(sent)}
                        </React.Fragment>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {/* Left Column Bottom: 上一页 (Previous Page) */}
              <div className="pt-6 flex items-center justify-between text-xs text-stone-400">
                <button
                  onClick={onPrevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all ${
                    currentPage === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>上一页</span>
                </button>
                <span className="font-mono text-[11px] text-stone-400">
                  {currentPage * 2 + 1} / {totalPages * 2}
                </span>
              </div>
            </div>

            {/* Right Column (右栏) */}
            <div className="flex flex-col justify-between md:pl-2">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-sans pb-4 mb-6 border-b border-stone-100 dark:border-stone-800/60">
                  <span>Chapter I</span>
                  <span>Page {currentPage * 2 + 2}</span>
                </div>

                {/* Right Column Paragraphs */}
                <div
                  className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.85,
                    letterSpacing: '0.005em',
                  }}
                >
                  {rightParagraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-left indent-[2em] mb-6 leading-[1.85]">
                      {para.map((sent, sIdx) => (
                        <React.Fragment key={sent.id}>
                          {sIdx > 0 ? ' ' : ''}
                          {renderInteractiveSentence(sent)}
                        </React.Fragment>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {/* Right Column Bottom: 下一页 (Next Page) */}
              <div className="pt-6 flex items-center justify-between text-xs text-stone-400">
                <span className="font-mono text-[11px] text-stone-400">
                  {currentPage * 2 + 2} / {totalPages * 2}
                </span>
                <button
                  onClick={onNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all ${
                    currentPage === totalPages - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                >
                  <span>下一页</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Mode 2: 滚动阅读 (WeChat Read Continuous Scroll Mode)
  // -------------------------------------------------------------
  const allParagraphs = groupSentencesIntoParagraphs(chapter.sentences);

  return (
    <article
      className={`mx-auto transition-all ${
        readingMode === 'zen'
          ? 'max-w-[720px] py-12 px-6 sm:px-10'
          : 'max-w-[760px] py-10 px-6 sm:px-8'
      }`}
    >
      {/* Top Chapter Nav & Title */}
      <header className="mb-10 text-left space-y-3">
        <button className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-sans font-medium mb-2 inline-block">
          上一章
        </button>
        <h2 className="text-3xl sm:text-4xl font-bold font-book-serif text-stone-900 dark:text-stone-100 tracking-tight">
          {chapter.title}
        </h2>
        <div className="w-full h-0.5 bg-amber-500/80 mt-2 rounded-full" />
      </header>

      {/* Continuous Paragraph Flow */}
      <div
        className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.85,
          letterSpacing: '0.005em',
        }}
      >
        {allParagraphs.map((para, pIdx) => (
          <p key={pIdx} className="text-left indent-[2em] mb-7 leading-[1.85]">
            {para.map((sent, sIdx) => (
              <React.Fragment key={sent.id}>
                {sIdx > 0 ? ' ' : ''}
                {renderInteractiveSentence(sent)}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>

      {/* Chapter Footer Navigation */}
      <div className="mt-16 pt-8 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
        <span>The Great Gatsby · Chapter 1</span>
        <button className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
          下一章 &gt;
        </button>
      </div>
    </article>
  );
};
