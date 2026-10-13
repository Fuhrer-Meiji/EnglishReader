'use client';

import React, { useState, useEffect } from 'react';
import {
  ReadingMode,
  LayoutMode,
  ThemeMode,
  DifficultyLevel,
  SentenceAnalysis,
  VocabularyItem,
  Book,
} from '../lib/types';
import {
  SAMPLE_BOOK,
  BOOKS_DATABASE,
  DICTIONARY_DATABASE,
  INITIAL_VOCAB_ITEMS,
  DictEntry,
} from '../lib/mockData';
import { fetchWordDefinition } from '../lib/dictService';
import { ReaderHeader } from '../components/ReaderHeader';
import { ReaderView } from '../components/ReaderView';
import { BookshelfView } from '../components/BookshelfView';
import { WeChatDock } from '../components/WeChatDock';
import { TableOfContentsModal } from '../components/TableOfContentsModal';
import { WordPopover } from '../components/WordPopover';
import { SentenceDrawer } from '../components/SentenceDrawer';
import { StudySidebar } from '../components/StudySidebar';
import { VocabDrawer } from '../components/VocabDrawer';
import { useReaderTheme } from '../components/AstryxProvider';

export default function Home() {
  const [activeView, setActiveView] = useState<'reader' | 'bookshelf'>('bookshelf');
  const [currentBookId, setCurrentBookId] = useState<string>('the-great-gatsby');
  const [currentBook, setCurrentBook] = useState<Book>(BOOKS_DATABASE['the-great-gatsby'] || SAMPLE_BOOK);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  const [readingMode, setReadingMode] = useState<ReadingMode>('zen');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('double');
  const { theme, setTheme } = useReaderTheme();
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<DifficultyLevel | 'ALL' | 'OFF'>('CET6');

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(true);
  const [isTOCOpen, setIsTOCOpen] = useState<boolean>(false);

  // Popovers & Drawers
  const [popoverState, setPopoverState] = useState<{
    wordEntry: DictEntry;
    rawWord: string;
    position: { x: number; y: number; placeAbove?: boolean };
  } | null>(null);

  const [activeSentence, setActiveSentence] = useState<SentenceAnalysis | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>(INITIAL_VOCAB_ITEMS);

  // Restore last read book and position from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookId = localStorage.getItem('er_last_book_id');
      if (savedBookId) {
        setCurrentBookId(savedBookId);
        const savedChap = parseInt(localStorage.getItem(`er_chap_${savedBookId}`) || '0', 10);
        const savedPage = parseInt(localStorage.getItem(`er_page_${savedBookId}`) || '0', 10);
        setCurrentChapterIndex(savedChap);
        setCurrentPage(savedPage);
      }
      const savedFontSize = parseInt(localStorage.getItem('er_font_size') || '18', 10);
      if (savedFontSize >= 13 && savedFontSize <= 40) {
        setFontSize(savedFontSize);
      }
      const savedSerif = localStorage.getItem('er_is_serif');
      if (savedSerif !== null) {
        setIsSerif(savedSerif === 'true');
      }
    }
  }, []);

  // Save current progress to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentBookId) {
      localStorage.setItem('er_last_book_id', currentBookId);
      localStorage.setItem(`er_chap_${currentBookId}`, String(currentChapterIndex));
      localStorage.setItem(`er_page_${currentBookId}`, String(currentPage));
    }
  }, [currentBookId, currentChapterIndex, currentPage]);

  // Load compiled book from API if available
  useEffect(() => {
    let isCancelled = false;
    async function loadBookData() {
      try {
        const res = await fetch(`/api/books/${currentBookId}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data && data.chapters) {
            setCurrentBook(data);
            return;
          }
        }
      } catch (err) {
        console.warn(`[Reader] Using preset database for ${currentBookId}`);
      }

      if (!isCancelled) {
        const fallback = BOOKS_DATABASE[currentBookId] || SAMPLE_BOOK;
        setCurrentBook(fallback);
      }
    }

    loadBookData();
    return () => {
      isCancelled = true;
    };
  }, [currentBookId]);

  const currentChapter = currentBook.chapters[currentChapterIndex] || currentBook.chapters[0];

  // Keyboard navigation for Two-Column spread reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeView !== 'reader' || layoutMode !== 'double') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, layoutMode]);

  // Theme styling background and text mappings
  const getThemeContainerClass = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[var(--color-paper)] text-[var(--color-ink)]';
      case 'dark':
        return 'dark bg-[var(--color-paper)] text-[var(--color-ink)]';
      case 'light':
      default:
        return 'bg-[var(--color-paper)] text-[var(--color-ink)]';
    }
  };

  const handleSetFontSize = (size: number) => {
    const clamped = Math.min(Math.max(size, 13), 38);
    setFontSize(clamped);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('er_font_size', String(clamped));
      } catch (e) {}
    }
  };

  const handleToggleFontFamily = () => {
    const next = !isSerif;
    setIsSerif(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('er_is_serif', String(next));
      } catch (e) {}
    }
  };

  // Instant 770,000-word ECDICT lookup
  const handleWordClick = async (word: string, rect: DOMRect) => {
    const clean = word.toLowerCase().replace(/[’']/g, '');
    let entry = DICTIONARY_DATABASE[clean];

    if (!entry) {
      entry = await fetchWordDefinition(word);
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

  const handleSelectWordFromSidebar = async (word: string) => {
    const clean = word.toLowerCase();
    let entry = DICTIONARY_DATABASE[clean];
    if (!entry) {
      entry = await fetchWordDefinition(word);
    }

    setPopoverState({
      wordEntry: entry,
      rawWord: word,
      position: {
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        y: 200,
        placeAbove: false,
      },
    });
  };

  const handleToggleSaveVocab = (entry: DictEntry) => {
    const existingIndex = vocabItems.findIndex(
      (item) => item.word.toLowerCase() === entry.word.toLowerCase()
    );
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
        bookTitle: currentBook.title,
        chapterTitle: currentChapter.title,
        addedAt: new Date().toISOString().split('T')[0],
        level: entry.level,
        status: 'learning',
      };
      setVocabItems([newItem, ...vocabItems]);
    }
  };

  const isCurrentWordSaved = popoverState
    ? vocabItems.some((v) => v.word.toLowerCase() === popoverState.wordEntry.word.toLowerCase())
    : false;

  // View 1: WeChat Read Styled Bookshelf & Library
  if (activeView === 'bookshelf') {
    return (
      <BookshelfView
        onSelectBook={(bookId) => {
          setCurrentBookId(bookId);
          if (typeof window !== 'undefined') {
            const savedChap = parseInt(localStorage.getItem(`er_chap_${bookId}`) || '0', 10);
            const savedPage = parseInt(localStorage.getItem(`er_page_${bookId}`) || '0', 10);
            setCurrentChapterIndex(savedChap);
            setCurrentPage(savedPage);
          } else {
            setCurrentChapterIndex(0);
            setCurrentPage(0);
          }
          setActiveView('reader');
        }}
      />
    );
  }

  // View 2: Dual-Mode WeChat Read Reader
  return (
    <div
      data-theme={theme}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative ${getThemeContainerClass()}`}
      onClick={() => setPopoverState(null)}
    >
      {/* 1. WeChat Read Style Header */}
      <ReaderHeader
        readingMode={readingMode}
        onToggleMode={(mode) => {
          setReadingMode(mode);
          setPopoverState(null);
        }}
        bookTitle={currentBook.title}
        chapterTitle={currentChapter.title}
        isBookmarked={isBookmarked}
        onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
        onGoBookshelf={() => setActiveView('bookshelf')}
      />

      {/* 2. Main Reader Canvas with Optional Study Sidebar */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ReaderView
            chapter={currentChapter}
            readingMode={readingMode}
            layoutMode={layoutMode}
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
            currentPage={currentPage}
            onNextPage={() => setCurrentPage((prev) => prev + 1)}
            onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            hasPrevChapter={currentChapterIndex > 0}
            hasNextChapter={currentChapterIndex < currentBook.chapters.length - 1}
            onPrevChapter={() => {
              setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
              setCurrentPage(0);
            }}
            onNextChapter={() => {
              setCurrentChapterIndex((prev) => Math.min(currentBook.chapters.length - 1, prev + 1));
              setCurrentPage(0);
            }}
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

      {/* 3. WeChat Read Floating Right Dock */}
      <WeChatDock
        layoutMode={layoutMode}
        onToggleLayoutMode={(mode) => {
          setLayoutMode(mode);
          setCurrentPage(0);
        }}
        readingMode={readingMode}
        onToggleReadingMode={setReadingMode}
        theme={theme}
        onSelectTheme={setTheme}
        fontSize={fontSize}
        onChangeFontSize={(delta) => handleSetFontSize(fontSize + delta)}
        onSetFontSize={handleSetFontSize}
        isSerif={isSerif}
        onToggleFontFamily={handleToggleFontFamily}
        onOpenVocab={() => setIsVocabOpen(true)}
        onOpenTOC={() => setIsTOCOpen(true)}
        vocabCount={vocabItems.length}
      />

      {/* 4. Table of Contents Modal */}
      <TableOfContentsModal
        isOpen={isTOCOpen}
        onClose={() => setIsTOCOpen(false)}
        chapters={currentBook.chapters}
        currentChapterId={currentChapter.id}
        onSelectChapter={(chapterId) => {
          const idx = currentBook.chapters.findIndex((c) => c.id === chapterId);
          if (idx >= 0) {
            setCurrentChapterIndex(idx);
            setCurrentPage(0);
          }
          setIsTOCOpen(false);
        }}
        bookTitle={currentBook.title}
        author={currentBook.author}
      />

      {/* 5. Instant Word Popover */}
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

      {/* 6. Sentence Syntax & Cultural Breakdown Drawer */}
      <SentenceDrawer
        sentence={activeSentence}
        onClose={() => setActiveSentence(null)}
        onSelectWord={(kw) => {
          handleSelectWordFromSidebar(kw);
        }}
      />

      {/* 7. Vocabulary Drawer */}
      <VocabDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        vocabItems={vocabItems}
        onRemoveItem={(id) => setVocabItems(vocabItems.filter((i) => i.id !== id))}
        onToggleStatus={(id) =>
          setVocabItems(
            vocabItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: item.status === 'mastered' ? 'learning' : 'mastered',
                  }
                : item
            )
          )
        }
      />
    </div>
  );
}
