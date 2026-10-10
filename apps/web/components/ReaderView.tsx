'use client';

import React, { useMemo } from 'react';
import { Chapter, ReadingMode, ThemeMode, DifficultyLevel, SentenceAnalysis } from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';
import { Sparkles } from 'lucide-react';

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
  // Group sentences into actual book paragraphs
  const paragraphGroups = useMemo(() => {
    const groups: SentenceAnalysis[][] = [];
    chapter.sentences.forEach((sent) => {
      const pIdx = sent.paragraphIndex ?? 0;
      if (!groups[pIdx]) {
        groups[pIdx] = [];
      }
      groups[pIdx].push(sent);
    });
    return groups.filter(Boolean);
  }, [chapter.sentences]);

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
    // Regex splits by words, keeping punctuation and spaces exactly as they are in prose
    const tokens = sent.rawText.split(/([a-zA-Z’']+)/g);

    const isCurrentActive = activeSentenceId === sent.id;

    return (
      <span
        key={sent.id}
        className={`transition-colors rounded-sm ${
          isCurrentActive
            ? 'bg-amber-200/40 dark:bg-amber-900/40 px-0.5 ring-1 ring-amber-400/50'
            : ''
        }`}
      >
        {tokens.map((token, idx) => {
          const clean = token.toLowerCase().replace(/[’']/g, '');
          const isWord = /^[a-zA-Z’']+$/.test(token);

          // Non-word punctuation or whitespace: render as pure plain text node (no span wrapper, no artificial gaps!)
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

        {/* Study Mode only: subtle syntax inspection icon at sentence end */}
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

  return (
    <article
      className={`mx-auto transition-all ${
        readingMode === 'zen'
          ? 'max-w-[700px] py-14 px-6 sm:px-10'
          : 'max-w-[760px] py-10 px-6 sm:px-8'
      }`}
    >
      {/* Chapter Title in authentic book style */}
      <header className="mb-14 text-center space-y-3">
        <span className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500 block">
          F. Scott Fitzgerald
        </span>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-wide font-book-serif text-stone-900 dark:text-stone-100">
          {chapter.title}
        </h2>
        {chapter.subtitle && (
          <p className="text-xs sm:text-sm italic text-stone-500 dark:text-stone-400 font-book-serif">
            {chapter.subtitle}
          </p>
        )}
        <div className="w-10 h-px bg-stone-300 dark:bg-stone-700 mx-auto mt-6" />
      </header>

      {/* Main Prose Text: Real Book Paragraphs, natural left alignment, elegant indent */}
      <div
        className={`select-text ${isSerif ? 'font-book-serif' : 'font-book-sans'}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.85,
          letterSpacing: '0.005em',
        }}
      >
        {paragraphGroups.map((sentencesInParagraph, pIdx) => (
          <p
            key={pIdx}
            className="text-left indent-[2em] mb-7 leading-[1.85]"
          >
            {sentencesInParagraph.map((sent, sIdx) => (
              <React.Fragment key={sent.id}>
                {sIdx > 0 ? ' ' : ''}
                {renderInteractiveSentence(sent)}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>

      {/* End of chapter ornament */}
      <div className="mt-20 pt-10 border-t border-stone-200/50 dark:border-stone-800/50 text-center">
        <span className="text-sm font-serif italic text-stone-400 dark:text-stone-500">
          ❦ · The Great Gatsby · ❦
        </span>
      </div>
    </article>
  );
};
