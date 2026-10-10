'use client';

import React, { useState } from 'react';
import { ReadingMode, ThemeMode, DifficultyLevel, SentenceAnalysis, VocabularyItem } from '../lib/types';
import { SAMPLE_BOOK, DICTIONARY_DATABASE, INITIAL_VOCAB_ITEMS, DictEntry } from '../lib/mockData';
import { ReaderHeader } from '../components/ReaderHeader';
import { ReaderView } from '../components/ReaderView';
import { WordPopover } from '../components/WordPopover';
import { SentenceDrawer } from '../components/SentenceDrawer';
import { StudySidebar } from '../components/StudySidebar';
import { VocabDrawer } from '../components/VocabDrawer';

export default function Home() {
  const [readingMode, setReadingMode] = useState<ReadingMode>('zen');
  const [theme, setTheme] = useState<ThemeMode>('sepia');
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<DifficultyLevel | 'ALL' | 'OFF'>('CET6');

  // Interactive popovers & drawers state
  const [popoverState, setPopoverState] = useState<{
    wordEntry: DictEntry;
    rawWord: string;
    position: { x: number; y: number; placeAbove?: boolean };
  } | null>(null);

  const [activeSentence, setActiveSentence] = useState<SentenceAnalysis | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>(INITIAL_VOCAB_ITEMS);

  const book = SAMPLE_BOOK;
  const currentChapter = book.chapters[0];

  // Theme styling background and text mappings
  const getThemeContainerClass = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#423326]';
      case 'dark':
        return 'bg-[#141417] text-[#e0deda] dark';
      case 'light':
      default:
        return 'bg-[#faf9f5] text-[#242220]';
    }
  };

  const handleWordClick = (word: string, rect: DOMRect) => {
    const clean = word.toLowerCase().replace(/[’']/g, '');
    let entry = DICTIONARY_DATABASE[clean];

    // Fallback dictionary entry for words not in the mock database
    if (!entry) {
      entry = {
        word: clean,
        phonetic: `/${clean}/`,
        pos: 'word',
        translation: '即时本地离线解析词条',
        englishDef: 'A recognized vocabulary token in the reader.',
      };
    }

    const placeAbove = typeof window !== 'undefined' && rect.bottom + 260 > window.innerHeight;
    setPopoverState({
      wordEntry: entry,
      rawWord: word,
      position: {
        x: rect.left + rect.width / 2,
        y: placeAbove ? rect.top - 8 : rect.bottom + 8,
        placeAbove,
      },
    });
  };

  const handleSelectWordFromSidebar = (word: string) => {
    const clean = word.toLowerCase();
    const entry = DICTIONARY_DATABASE[clean];
    if (entry) {
      setPopoverState({
        wordEntry: entry,
        rawWord: word,
        position: {
          x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          y: 200,
          placeAbove: false,
        },
      });
    }
  };

  const handleToggleSaveVocab = (entry: DictEntry) => {
    const existingIndex = vocabItems.findIndex((item) => item.word.toLowerCase() === entry.word.toLowerCase());
    if (existingIndex >= 0) {
      setVocabItems(vocabItems.filter((_, idx) => idx !== existingIndex));
    } else {
      const newItem: VocabularyItem = {
        id: `vocab-${Date.now()}`,
        word: entry.word,
        phonetic: entry.phonetic,
        pos: entry.pos,
        translation: entry.translation,
        contextSentence: activeSentence?.rawText || 'In my younger and more vulnerable years...',
        bookTitle: book.title,
        chapterTitle: currentChapter.title,
        addedAt: new Date().toISOString().split('T')[0],
        level: entry.level,
        status: 'learning',
      };
      setVocabItems([newItem, ...vocabItems]);
    }
  };

  const handleRemoveVocabItem = (id: string) => {
    setVocabItems(vocabItems.filter((i) => i.id !== id));
  };

  const handleToggleVocabStatus = (id: string) => {
    setVocabItems(
      vocabItems.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'mastered' ? 'learning' : 'mastered' }
          : item
      )
    );
  };

  const isCurrentWordSaved = popoverState
    ? vocabItems.some((v) => v.word.toLowerCase() === popoverState.wordEntry.word.toLowerCase())
    : false;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${getThemeContainerClass()}`}
      onClick={() => setPopoverState(null)}
    >
      {/* Top Reader Header */}
      <ReaderHeader
        readingMode={readingMode}
        onToggleMode={(mode) => {
          setReadingMode(mode);
          setPopoverState(null);
        }}
        theme={theme}
        onSelectTheme={setTheme}
        fontSize={fontSize}
        onChangeFontSize={(delta) => setFontSize((prev) => Math.min(Math.max(prev + delta, 14), 26))}
        isSerif={isSerif}
        onToggleFontFamily={() => setIsSerif(!isSerif)}
        bookTitle={book.title}
        chapterTitle={currentChapter.title}
        vocabCount={vocabItems.length}
        onOpenVocab={() => setIsVocabOpen(true)}
      />

      {/* Main Reading Surface */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ReaderView
            chapter={currentChapter}
            readingMode={readingMode}
            theme={theme}
            fontSize={fontSize}
            isSerif={isSerif}
            selectedLevelFilter={selectedLevelFilter}
            onWordClick={handleWordClick}
            onSentenceAnalyze={(sent) => {
              setActiveSentence(sent);
              setPopoverState(null);
            }}
            activeSentenceId={activeSentence?.id}
          />
        </div>

        {/* Study Mode: Right Information & Filter Sidebar */}
        {readingMode === 'study' && (
          <StudySidebar
            stats={currentChapter.stats}
            selectedLevelFilter={selectedLevelFilter}
            onSelectLevelFilter={setSelectedLevelFilter}
            onSelectWord={handleSelectWordFromSidebar}
          />
        )}
      </main>

      {/* Instant Word Popover */}
      {popoverState && (
        <WordPopover
          wordEntry={popoverState.wordEntry}
          rawWord={popoverState.rawWord}
          position={popoverState.position}
          isSaved={isCurrentWordSaved}
          onSave={() => handleToggleSaveVocab(popoverState.wordEntry)}
          onClose={() => setPopoverState(null)}
          onDeepDive={() => {
            if (activeSentence) {
              setPopoverState(null);
            } else {
              setActiveSentence(currentChapter.sentences[0]);
              setPopoverState(null);
            }
          }}
        />
      )}

      {/* Sentence Syntax & Cultural Breakdown Drawer */}
      <SentenceDrawer
        sentence={activeSentence}
        onClose={() => setActiveSentence(null)}
        onSelectWord={(kw) => {
          handleSelectWordFromSidebar(kw);
        }}
      />

      {/* Vocabulary Drawer */}
      <VocabDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        vocabItems={vocabItems}
        onRemoveItem={handleRemoveVocabItem}
        onToggleStatus={handleToggleVocabStatus}
      />
    </div>
  );
}
