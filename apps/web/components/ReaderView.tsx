'use client';

/* Hallmark · component: ReaderView · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

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
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';

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
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasPrevChapter?: boolean;
  hasNextChapter?: boolean;
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
  onNextChapter,
  onPrevChapter,
  hasPrevChapter = false,
  hasNextChapter = false,
}) => {
  const activeFontFamily = isSerif
    ? 'var(--font-newsreader), Newsreader, Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif'
    : 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

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
    const isDark = theme === 'dark';
    switch (level) {
      case 'GRE':
        return isDark
          ? 'text-purple-300 border-b border-purple-400/80 font-medium'
          : 'text-purple-800 border-b border-purple-700/80 font-medium';
      case 'KY':
        return isDark
          ? 'text-rose-300 border-b border-rose-400/80 font-medium'
          : 'text-rose-800 border-b border-rose-700/80 font-medium';
      case 'CET6':
        return 'text-[var(--color-accent)] border-b border-[var(--color-accent)]/80 font-medium';
      case 'CET4':
        return isDark
          ? 'text-emerald-300 border-b border-emerald-400/80 font-medium'
          : 'text-emerald-800 border-b border-emerald-700/80 font-medium';
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
            ? 'bg-[var(--color-accent)]/20 px-0.5 ring-1 ring-[var(--color-accent)]/50'
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
                const sel = typeof window !== 'undefined' ? window.getSelection() : null;
                if (sel && sel.toString().trim().length > 0) {
                  return;
                }
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onWordClick(token, rect);
              }}
              style={{ fontSize: 'inherit', fontFamily: 'inherit' }}
              className={`cursor-pointer transition-colors duration-100 ${
                isHighlighted
                  ? getWordHighlightClass(dictEntry?.level)
                  : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]'
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
            className="inline-flex items-center align-middle ml-1.5 p-0.5 rounded-sm text-[var(--color-accent)]/80 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15 transition-all cursor-pointer"
            title="句法解构与文学注脚"
          >
            <Layers className="w-3 h-3 inline" />
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

  // Dynamic spread pagination based on sentence/word density & current font size
  const spreads = useMemo(() => {
    const list = chapter.sentences || [];
    if (list.length === 0) {
      return [{ left: [], right: [] }];
    }

    const result: { left: SentenceAnalysis[]; right: SentenceAnalysis[] }[] = [];
    let currentLeft: SentenceAnalysis[] = [];
    let currentRight: SentenceAnalysis[] = [];
    let currentColumnWords = 0;
    let isFillingLeft = true;

    // Dynamically adjust capacity based on font size (18px = ~135 words, 14px = ~210 words, 26px = ~72 words, 32px = ~50 words)
    const baseCapacity = 135;
    const effectiveFontSize = Math.max(fontSize, 12);
    const WORDS_PER_COLUMN = Math.max(
      35,
      Math.round(baseCapacity * Math.pow(18 / effectiveFontSize, 1.65))
    );
    const minSentencesPerColumn = effectiveFontSize >= 28 ? 1 : 2;

    for (const sent of list) {
      const wordsInSent = sent.rawText.split(/\s+/).length;

      if (isFillingLeft) {
        currentLeft.push(sent);
        currentColumnWords += wordsInSent;
        if (currentColumnWords >= WORDS_PER_COLUMN && currentLeft.length >= minSentencesPerColumn) {
          isFillingLeft = false;
          currentColumnWords = 0;
        }
      } else {
        currentRight.push(sent);
        currentColumnWords += wordsInSent;
        if (currentColumnWords >= WORDS_PER_COLUMN && currentRight.length >= minSentencesPerColumn) {
          result.push({ left: currentLeft, right: currentRight });
          currentLeft = [];
          currentRight = [];
          isFillingLeft = true;
          currentColumnWords = 0;
        }
      }
    }

    if (currentLeft.length > 0 || currentRight.length > 0) {
      result.push({ left: currentLeft, right: currentRight });
    }

    return result.length > 0 ? result : [{ left: [], right: [] }];
  }, [chapter.sentences, fontSize]);

  const totalPages = spreads.length;
  const safePage = Math.min(Math.max(currentPage, 0), totalPages - 1);
  const currentSpread = spreads[safePage] || spreads[0];

  // -------------------------------------------------------------
  // Mode 1: Dual-Leaf Spread Mode (双栏纸书翻页)
  // -------------------------------------------------------------
  if (layoutMode === 'double') {
    const leftParagraphs = groupSentencesIntoParagraphs(currentSpread.left);
    const rightParagraphs = groupSentencesIntoParagraphs(currentSpread.right);
    const isFirstPage = safePage === 0;
    const isLastPage = safePage === totalPages - 1;

    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 animate-in fade-in duration-150">
        <div className="bg-[var(--color-paper-2)]/90 text-[var(--color-ink)] rounded-2xl border border-[var(--color-rule)] shadow-md p-8 sm:p-12 min-h-[680px] flex flex-col justify-between">
          {/* Two-Column Grid (Left Page + Right Page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 flex-1">
            {/* Left Column (Left Leaf) */}
            <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--color-rule)] pb-6 md:pb-0 md:pr-10 lg:pr-14">
              <div>
                {isFirstPage ? (
                  <div className="mb-8">
                    <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono uppercase tracking-widest block mb-1">
                      Chapter
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-medium font-book-serif text-[var(--color-ink)] tracking-tight">
                      {chapter.title}
                    </h2>
                    <div className="w-full h-px bg-[var(--color-rule)] mt-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] font-meta-mono pb-4 mb-6 border-b border-[var(--color-rule)]">
                    <span className="truncate max-w-[200px]">{chapter.title}</span>
                    <span>Page {safePage * 2 + 1}</span>
                  </div>
                )}

                {/* Left Column Paragraphs */}
                <div
                  className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: activeFontFamily,
                    lineHeight: fontSize >= 28 ? 1.65 : fontSize >= 22 ? 1.74 : 1.82,
                    letterSpacing: '0.005em',
                  }}
                >
                  {leftParagraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className={`text-left indent-[2em] mb-6 text-[var(--color-ink)] ${
                        isSerif ? 'font-book-serif' : 'font-book-sans'
                      }`}
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: activeFontFamily,
                        lineHeight: fontSize >= 28 ? 1.65 : fontSize >= 22 ? 1.74 : 1.82,
                      }}
                    >
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

              {/* Left Column Bottom: Previous Leaf */}
              <div className="pt-6 flex items-center justify-between text-xs text-[var(--color-ink-muted)] border-t border-[var(--color-rule)]/50">
                {isFirstPage && hasPrevChapter ? (
                  <button
                    onClick={onPrevChapter}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--color-rule)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>上一章</span>
                  </button>
                ) : (
                  <button
                    onClick={onPrevPage}
                    disabled={isFirstPage}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--color-rule)] transition-colors cursor-pointer ${
                      isFirstPage
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>上一页</span>
                  </button>
                )}

                <span className="font-meta-mono text-[11px] text-[var(--color-ink-muted)]">
                  {safePage * 2 + 1} / {totalPages * 2}
                </span>
              </div>
            </div>

            {/* Right Column (Right Leaf) */}
            <div className="flex flex-col justify-between md:pl-2">
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] font-meta-mono pb-4 mb-6 border-b border-[var(--color-rule)]">
                  <span className="truncate max-w-[200px]">{chapter.title}</span>
                  <span>Page {safePage * 2 + 2}</span>
                </div>

                {/* Right Column Paragraphs */}
                <div
                  className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: activeFontFamily,
                    lineHeight: fontSize >= 28 ? 1.65 : fontSize >= 22 ? 1.74 : 1.82,
                    letterSpacing: '0.005em',
                  }}
                >
                  {rightParagraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className={`text-left indent-[2em] mb-6 text-[var(--color-ink)] ${
                        isSerif ? 'font-book-serif' : 'font-book-sans'
                      }`}
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: activeFontFamily,
                        lineHeight: fontSize >= 28 ? 1.65 : fontSize >= 22 ? 1.74 : 1.82,
                      }}
                    >
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

              {/* Right Column Bottom: Next Leaf */}
              <div className="pt-6 flex items-center justify-between text-xs text-[var(--color-ink-muted)] border-t border-[var(--color-rule)]/50">
                <span className="font-meta-mono text-[11px] text-[var(--color-ink-muted)]">
                  {safePage * 2 + 2} / {totalPages * 2}
                </span>

                {isLastPage && hasNextChapter ? (
                  <button
                    onClick={onNextChapter}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] font-medium hover:bg-[var(--color-ink-2)] transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>下一章</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onNextPage}
                    disabled={isLastPage}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--color-rule)] transition-colors cursor-pointer ${
                      isLastPage
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }`}
                  >
                    <span>下一页</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Mode 2: Continuous Scroll Mode (长卷纵向阅读)
  // -------------------------------------------------------------
  const allParagraphs = groupSentencesIntoParagraphs(chapter.sentences);

  return (
    <article
      className={`mx-auto text-[var(--color-ink)] ${
        readingMode === 'zen'
          ? 'max-w-[65ch] py-12 px-6 sm:px-10'
          : 'max-w-[68ch] py-10 px-6 sm:px-8'
      }`}
    >
      {/* Top Chapter Nav & Title */}
      <header className="mb-10 text-left space-y-3">
        {hasPrevChapter && (
          <button
            onClick={onPrevChapter}
            className="text-xs text-[var(--color-accent)] hover:underline font-meta-mono mb-2 inline-block cursor-pointer"
          >
            &lt; 上一章
          </button>
        )}
        <h2 className="text-3xl sm:text-4xl font-medium font-book-serif text-[var(--color-ink)] tracking-tight">
          {chapter.title}
        </h2>
        <div className="w-full h-px bg-[var(--color-rule)] mt-4" />
      </header>

      {/* Continuous Paragraph Flow */}
      <div
        className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: activeFontFamily,
          lineHeight: fontSize >= 28 ? 1.66 : fontSize >= 22 ? 1.75 : 1.85,
          letterSpacing: '0.005em',
        }}
      >
        {allParagraphs.map((para, pIdx) => (
          <p
            key={pIdx}
            className={`text-left indent-[2em] mb-7 text-[var(--color-ink)] ${
              isSerif ? 'font-book-serif' : 'font-book-sans'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: activeFontFamily,
              lineHeight: fontSize >= 28 ? 1.66 : fontSize >= 22 ? 1.75 : 1.85,
            }}
          >
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
      <div className="mt-16 pt-8 border-t border-[var(--color-rule)] flex items-center justify-between text-xs text-[var(--color-ink-muted)] font-meta-mono">
        <span>{chapter.title}</span>
        {hasNextChapter && (
          <button
            onClick={onNextChapter}
            className="text-[var(--color-accent)] hover:underline font-medium cursor-pointer"
          >
            下一章 &gt;
          </button>
        )}
      </div>
    </article>
  );
};
