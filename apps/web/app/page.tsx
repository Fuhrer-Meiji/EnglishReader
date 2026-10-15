'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { SelectionPopover } from '../components/SelectionPopover';
import { SentenceDrawer } from '../components/SentenceDrawer';
import { StudySidebar } from '../components/StudySidebar';
import { VocabDrawer } from '../components/VocabDrawer';
import { useReaderTheme } from '../components/AstryxProvider';
import { AuthUser } from '../lib/auth';
import { AuthModal } from '../components/AuthModal';
import { WelcomeView } from '../components/WelcomeView';
import { AIConfigModal } from '../components/AIConfigModal';
import { QuoteCardModal } from '../components/QuoteCardModal';

export default function Home() {
  const [activeView, setActiveView] = useState<'welcome' | 'reader' | 'bookshelf'>('welcome');
  const [currentBookId, setCurrentBookId] = useState<string>('the-great-gatsby');
  const [currentBook, setCurrentBook] = useState<Book>(BOOKS_DATABASE['the-great-gatsby'] || SAMPLE_BOOK);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  const [readingMode, setReadingMode] = useState<ReadingMode>('zen');
  const [isStudySidebarOpen, setIsStudySidebarOpen] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('double');
  const { theme, setTheme } = useReaderTheme();
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<DifficultyLevel | 'ALL' | 'OFF'>('CET6');

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isTOCOpen, setIsTOCOpen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);

  // Account & Cloud Sync
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // AI BYOK Modal State
  const [isAIConfigOpen, setIsAIConfigOpen] = useState<boolean>(false);

  // Popovers & Drawers
  const [popoverState, setPopoverState] = useState<{
    wordEntry: DictEntry;
    rawWord: string;
    position: { x: number; y: number; placeAbove?: boolean };
  } | null>(null);

  // Drag / Selection Translation Popover State
  const [selectionPopoverState, setSelectionPopoverState] = useState<{
    text: string;
    position: { x: number; y: number; placeAbove?: boolean };
  } | null>(null);

  // Archival Quote Bookmark & Card Modal State
  const [quoteCardState, setQuoteCardState] = useState<{
    quote: string;
    translation?: string;
    bookTitle?: string;
    chineseTitle?: string;
    author?: string;
    chapterTitle?: string;
  } | null>(null);

  const [activeSentence, setActiveSentence] = useState<SentenceAnalysis | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>(INITIAL_VOCAB_ITEMS);

  const gatherClientDataForMerge = () => {
    if (typeof window === 'undefined') return {};
    const clientProgress: Record<string, { chap: number; page: number }> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('er_chap_')) {
          const bookId = key.replace('er_chap_', '');
          const chap = parseInt(localStorage.getItem(key) || '0', 10);
          const page = parseInt(localStorage.getItem(`er_page_${bookId}`) || '0', 10);
          if (!isNaN(chap)) {
            clientProgress[bookId] = { chap, page: isNaN(page) ? 0 : page };
          }
        }
      }
    } catch (e) {}

    let clientVocab: VocabularyItem[] = [];
    try {
      const rawVocab = localStorage.getItem('er_vocab_items');
      if (rawVocab) {
        clientVocab = JSON.parse(rawVocab);
      }
    } catch (e) {}

    const clientBookmarks: Record<string, boolean> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('er_bookmarked_')) {
          const bookId = key.replace('er_bookmarked_', '');
          clientBookmarks[bookId] = localStorage.getItem(key) === 'true';
        }
      }
    } catch (e) {}

    const clientSettings = {
      fontSize,
      isSerif,
      theme,
      readingMode,
    };

    return {
      clientProgress,
      clientVocab,
      clientBookmarks,
      clientSettings,
    };
  };

  const applyCloudDataToClient = (cloudData: any) => {
    if (!cloudData || typeof window === 'undefined') return;

    if (cloudData.progress && typeof cloudData.progress === 'object') {
      for (const [bookId, p] of Object.entries(cloudData.progress as Record<string, { chap: number; page: number }>)) {
        if (typeof p?.chap === 'number') {
          localStorage.setItem(`er_chap_${bookId}`, String(p.chap));
          localStorage.setItem(`er_page_${bookId}`, String(p.page || 0));
          if (bookId === currentBookId) {
            setCurrentChapterIndex(p.chap);
            setCurrentPage(p.page || 0);
          }
        }
      }
    }

    if (Array.isArray(cloudData.vocabulary)) {
      setVocabItems(cloudData.vocabulary);
      try {
        localStorage.setItem('er_vocab_items', JSON.stringify(cloudData.vocabulary));
      } catch (e) {}
    }

    if (cloudData.bookmarks && typeof cloudData.bookmarks === 'object') {
      for (const [bookId, isBm] of Object.entries(cloudData.bookmarks as Record<string, boolean>)) {
        localStorage.setItem(`er_bookmarked_${bookId}`, String(isBm));
      }
    }

    if (cloudData.settings) {
      if (typeof cloudData.settings.fontSize === 'number') {
        setFontSize(cloudData.settings.fontSize);
        localStorage.setItem('er_font_size', String(cloudData.settings.fontSize));
      }
      if (typeof cloudData.settings.isSerif === 'boolean') {
        setIsSerif(cloudData.settings.isSerif);
        localStorage.setItem('er_is_serif', String(cloudData.settings.isSerif));
      }
      if (cloudData.settings.theme && ['light', 'sepia', 'dark'].includes(cloudData.settings.theme)) {
        setTheme(cloudData.settings.theme);
      }
      if (cloudData.settings.readingMode && ['zen', 'study'].includes(cloudData.settings.readingMode)) {
        setReadingMode(cloudData.settings.readingMode);
      }
    }
  };

  const syncWithCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const payload = gatherClientDataForMerge();
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          applyCloudDataToClient(result.data);
        }
      }
    } catch (err) {
      console.warn('[Sync] Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAuthSuccess = (loggedUser: AuthUser, syncedData?: any) => {
    setUser(loggedUser);
    if (syncedData) {
      applyCloudDataToClient(syncedData);
    } else {
      syncWithCloud();
    }
  };

  const navigateToView = useCallback(
    (
      newView: 'welcome' | 'reader' | 'bookshelf',
      bookId?: string,
      replace: boolean = false
    ) => {
      setActiveView(newView);
      const targetId = bookId || currentBookId;

      if (bookId) {
        const validBookId = bookId === 'the-little-prince' ? 'the-great-gatsby' : bookId;
        setCurrentBookId(validBookId);
        if (BOOKS_DATABASE[validBookId]) {
          setCurrentBook(BOOKS_DATABASE[validBookId]);
        }
        if (typeof window !== 'undefined') {
          const savedChap = parseInt(localStorage.getItem(`er_chap_${validBookId}`) || '0', 10);
          const savedPage = parseInt(localStorage.getItem(`er_page_${validBookId}`) || '0', 10);
          setCurrentChapterIndex(savedChap);
          setCurrentPage(savedPage);
        }
      }

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (newView === 'welcome') {
          url.searchParams.delete('view');
          url.searchParams.delete('book');
        } else if (newView === 'bookshelf') {
          url.searchParams.set('view', 'bookshelf');
          url.searchParams.delete('book');
        } else if (newView === 'reader') {
          url.searchParams.set('view', 'reader');
          url.searchParams.set('book', targetId);
        }

        const state = {
          view: newView,
          bookId: targetId,
        };

        const targetPath = url.pathname + (url.search ? url.search : '');
        if (replace) {
          window.history.replaceState(state, '', targetPath);
        } else {
          window.history.pushState(state, '', targetPath);
        }
      }
    },
    [currentBookId]
  );

  const handleGoBookshelf = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'bookshelf') {
      window.history.back();
    } else {
      navigateToView('bookshelf');
    }
  }, [navigateToView]);

  const handleGoWelcome = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'welcome') {
      window.history.back();
    } else {
      navigateToView('welcome');
    }
  }, [navigateToView]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    navigateToView('welcome', undefined, true);
  };

  const persistVocabItems = (items: VocabularyItem[]) => {
    setVocabItems(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('er_vocab_items', JSON.stringify(items));
      } catch (e) {}
    }
    if (user) {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientVocab: items }),
      }).catch((e) => console.warn('[VocabSync] Warning:', e));
    }
  };

  // Restore last read book, position, settings, and vocabulary on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasActive = localStorage.getItem('er_last_read_active') === 'true';
      const savedBookId = localStorage.getItem('er_last_book_id');
      if (hasActive && savedBookId) {
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
      const savedVocab = localStorage.getItem('er_vocab_items');
      if (savedVocab) {
        try {
          const parsed = JSON.parse(savedVocab);
          if (Array.isArray(parsed)) {
            setVocabItems(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  // Initialize view from URL if present, and handle browser back/forward (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as 'welcome' | 'reader' | 'bookshelf' | null;
    const bookParam = params.get('book');

    if (viewParam === 'reader' && bookParam) {
      const validBookId = bookParam === 'the-little-prince' ? 'the-great-gatsby' : bookParam;
      setCurrentBookId(validBookId);
      if (BOOKS_DATABASE[validBookId]) {
        setCurrentBook(BOOKS_DATABASE[validBookId]);
      }
      const savedChap = parseInt(localStorage.getItem(`er_chap_${validBookId}`) || '0', 10);
      const savedPage = parseInt(localStorage.getItem(`er_page_${validBookId}`) || '0', 10);
      setCurrentChapterIndex(savedChap);
      setCurrentPage(savedPage);
      setActiveView('reader');
      window.history.replaceState({ view: 'reader', bookId: validBookId }, '', window.location.href);
    } else if (viewParam === 'bookshelf') {
      setActiveView('bookshelf');
      window.history.replaceState({ view: 'bookshelf' }, '', window.location.href);
    } else {
      window.history.replaceState({ view: 'welcome' }, '', window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      const currentParams = new URLSearchParams(window.location.search);
      const curView = currentParams.get('view') as 'welcome' | 'reader' | 'bookshelf' | null;
      const curBook = currentParams.get('book');

      const targetView = curView || event.state?.view || 'welcome';
      const targetBook = curBook || event.state?.bookId;

      setActiveView(targetView);
      if (targetBook) {
        const validBookId = targetBook === 'the-little-prince' ? 'the-great-gatsby' : targetBook;
        setCurrentBookId(validBookId);
        if (BOOKS_DATABASE[validBookId]) {
          setCurrentBook(BOOKS_DATABASE[validBookId]);
        }
        const savedChap = parseInt(localStorage.getItem(`er_chap_${validBookId}`) || '0', 10);
        const savedPage = parseInt(localStorage.getItem(`er_page_${validBookId}`) || '0', 10);
        setCurrentChapterIndex(savedChap);
        setCurrentPage(savedPage);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check user session and sync cloud data on mount
  useEffect(() => {
    let isMounted = true;
    async function checkUserSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
            // Only auto-switch to bookshelf if no explicit view is specified in URL
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              if (!params.get('view')) {
                navigateToView('bookshelf', undefined, true);
              }
            }
            const syncRes = await fetch('/api/user/sync');
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (isMounted && syncData.data) {
                applyCloudDataToClient(syncData.data);
              }
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[Auth] Check session error:', err);
      }

      if (isMounted) {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (!params.get('view')) {
            setActiveView('welcome');
          }
        }
      }
    }
    checkUserSession();
    return () => {
      isMounted = false;
    };
  }, [navigateToView]);


  // Save current progress to localStorage and cloud ONLY when user is actively inside the reader
  useEffect(() => {
    if (typeof window !== 'undefined' && activeView === 'reader' && currentBookId) {
      localStorage.setItem('er_last_read_active', 'true');
      localStorage.setItem('er_last_book_id', currentBookId);
      localStorage.setItem(`er_chap_${currentBookId}`, String(currentChapterIndex));
      localStorage.setItem(`er_page_${currentBookId}`, String(currentPage));

      if (user) {
        fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: currentBookId,
            chapterIndex: currentChapterIndex,
            pageIndex: currentPage,
          }),
        }).catch((e) => console.warn('[ProgressSync] Warning:', e));
      }
    }
  }, [activeView, currentBookId, currentChapterIndex, currentPage, user]);

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
        if (currentBookId === 'the-little-prince') {
          setCurrentBookId('the-great-gatsby');
          return;
        }
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

  const handleSelectFontFamily = (serif: boolean) => {
    setIsSerif(serif);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('er_is_serif', String(serif));
      } catch (e) {}
    }
  };

  const handleToggleFontFamily = () => {
    handleSelectFontFamily(!isSerif);
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
      persistVocabItems(vocabItems.filter((_, idx) => idx !== existingIndex));
    } else {
      const newItem: VocabularyItem = {
        id: `vocab-${Date.now()}`,
        word: entry.word,
        phonetic: entry.phonetic,
        pos: entry.pos,
        translation: entry.translation,
        contextSentence: activeSentence?.rawText || '',
        bookTitle: currentBook.title,
        chapterTitle: currentChapter.title,
        addedAt: new Date().toISOString().split('T')[0],
        level: entry.level,
        status: 'learning',
      };
      persistVocabItems([newItem, ...vocabItems]);
    }
  };

  const isCurrentWordSaved = popoverState
    ? vocabItems.some((v) => v.word.toLowerCase() === popoverState.wordEntry.word.toLowerCase())
    : false;

  // Capture drag & highlight text selections across words and sentences
  useEffect(() => {
    if (activeView !== 'reader') return;

    const handleSelectionCheck = () => {
      if (typeof window === 'undefined') return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      if (!text || text.length === 0) return;

      // Ignore selection if inside an input, dialog, button or popover
      const anchor = selection.anchorNode;
      const element = anchor instanceof HTMLElement ? anchor : anchor?.parentElement;
      if (element?.closest('input, textarea, button, [role="dialog"], .select-none')) {
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const placeAbove = rect.top > 220;
        setSelectionPopoverState({
          text,
          position: {
            x: rect.left + rect.width / 2,
            y: placeAbove ? rect.top - 10 : rect.bottom + 10,
            placeAbove,
          },
        });
        setPopoverState(null);
      } catch (err) {}
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionCheck, 15);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [activeView]);

  const handleSaveSelectionToVocab = (text: string, translation: string) => {
    const isSingleWord = !text.includes(' ') && text.length < 25;
    const newItem: VocabularyItem = {
      id: `vocab-sel-${Date.now()}`,
      word: isSingleWord ? text : (text.length > 36 ? text.slice(0, 36) + '...' : text),
      phonetic: '',
      pos: isSingleWord ? 'word' : 'phrase',
      translation,
      contextSentence: text,
      bookTitle: currentBook.chineseTitle ? `${currentBook.chineseTitle} (${currentBook.title})` : currentBook.title,
      chapterTitle: currentChapter.title,
      addedAt: new Date().toISOString().split('T')[0],
      status: 'learning',
    };
    persistVocabItems([newItem, ...vocabItems]);
  };

  const handleDeepAnalyzeSelection = (text: string) => {
    const customSentence: SentenceAnalysis = {
      id: `custom-${Date.now()}`,
      paragraphIndex: 0,
      rawText: text,
      chineseTranslation: '',
      difficultyTag: text.length > 80 ? '长难句' : '中等',
      grammarComponents: [],
      coreKeywords: [],
    };
    setActiveSentence(customSentence);
    setSelectionPopoverState(null);
  };

  const handleOpenQuoteCard = useCallback(
    (custom?: {
      quote?: string;
      translation?: string;
      bookTitle?: string;
      chineseTitle?: string;
      author?: string;
      chapterTitle?: string;
    }) => {
      if (custom?.quote) {
        setQuoteCardState({
          quote: custom.quote,
          translation: custom.translation,
          bookTitle: custom.bookTitle || currentBook.title,
          chineseTitle: custom.chineseTitle || currentBook.chineseTitle,
          author: custom.author || currentBook.author,
          chapterTitle: custom.chapterTitle || currentChapter.title,
        });
        return;
      }

      if (activeSentence) {
        setQuoteCardState({
          quote: activeSentence.rawText,
          translation: activeSentence.chineseTranslation,
          bookTitle: currentBook.title,
          chineseTitle: currentBook.chineseTitle,
          author: currentBook.author,
          chapterTitle: currentChapter.title,
        });
        return;
      }

      const firstSent = currentChapter.sentences?.[0];
      if (firstSent) {
        setQuoteCardState({
          quote: firstSent.rawText,
          translation: firstSent.chineseTranslation,
          bookTitle: currentBook.title,
          chineseTitle: currentBook.chineseTitle,
          author: currentBook.author,
          chapterTitle: currentChapter.title,
        });
        return;
      }

      setQuoteCardState({
        quote: 'The artist is the creator of beautiful things. To reveal art and conceal the artist is art’s aim.',
        translation: '艺术家是美妙事物的创造者。展现艺术而隐藏艺术家，乃是艺术的宗旨。',
        bookTitle: 'The Picture of Dorian Gray',
        chineseTitle: '道林·格雷的画像',
        author: 'Oscar Wilde',
        chapterTitle: 'Preface',
      });
    },
    [activeSentence, currentBook, currentChapter]
  );

  // View 0: Exquisite Welcome Gateway & Archival Manifest
  if (activeView === 'welcome') {
    return (
      <>
        <WelcomeView
          onEnterBookshelf={() => navigateToView('bookshelf')}
          onSelectBook={(bookId) => navigateToView('reader', bookId)}
          user={user}
          onAuthSuccess={(loggedUser, syncedData) => {
            handleAuthSuccess(loggedUser, syncedData);
            navigateToView('bookshelf');
          }}
          onLogout={handleLogout}
          clientDataToMerge={gatherClientDataForMerge()}
          onOpenAIConfig={() => setIsAIConfigOpen(true)}
          onOpenQuoteCard={handleOpenQuoteCard}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          clientDataToMerge={gatherClientDataForMerge()}
        />
        <AIConfigModal
          isOpen={isAIConfigOpen}
          onClose={() => setIsAIConfigOpen(false)}
        />
        {quoteCardState && (
          <QuoteCardModal
            isOpen={Boolean(quoteCardState)}
            onClose={() => setQuoteCardState(null)}
            quote={quoteCardState.quote}
            initialTranslation={quoteCardState.translation}
            bookTitle={quoteCardState.bookTitle || currentBook.title}
            chineseTitle={quoteCardState.chineseTitle || currentBook.chineseTitle}
            author={quoteCardState.author || currentBook.author}
            chapterTitle={quoteCardState.chapterTitle || currentChapter.title}
          />
        )}
      </>
    );
  }

  // View 1: WeChat Read Styled Bookshelf & Library
  if (activeView === 'bookshelf') {
    return (
      <>
        <BookshelfView
          onSelectBook={(bookId) => navigateToView('reader', bookId)}
          onGoWelcome={handleGoWelcome}
          onOpenAIConfig={() => setIsAIConfigOpen(true)}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onManualSync={syncWithCloud}
          isSyncing={isSyncing}
          onOpenQuoteCard={() => handleOpenQuoteCard()}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          clientDataToMerge={gatherClientDataForMerge()}
        />
        <AIConfigModal
          isOpen={isAIConfigOpen}
          onClose={() => setIsAIConfigOpen(false)}
        />
        {quoteCardState && (
          <QuoteCardModal
            isOpen={Boolean(quoteCardState)}
            onClose={() => setQuoteCardState(null)}
            quote={quoteCardState.quote}
            initialTranslation={quoteCardState.translation}
            bookTitle={quoteCardState.bookTitle || currentBook.title}
            chineseTitle={quoteCardState.chineseTitle || currentBook.chineseTitle}
            author={quoteCardState.author || currentBook.author}
            chapterTitle={quoteCardState.chapterTitle || currentChapter.title}
          />
        )}
      </>
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
          if (mode === 'study') {
            if (readingMode === 'study') {
              setIsStudySidebarOpen((prev) => !prev);
            } else {
              setReadingMode('study');
              setIsStudySidebarOpen(true);
            }
          } else {
            setReadingMode('zen');
          }
          setPopoverState(null);
        }}
        bookTitle={currentBook.title}
        chineseTitle={currentBook.chineseTitle}
        chapterTitle={currentChapter.title}
        onGoBookshelf={handleGoBookshelf}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onManualSync={syncWithCloud}
        isSyncing={isSyncing}
        isControlsVisible={isControlsVisible}
        onOpenAIConfig={() => setIsAIConfigOpen(true)}
        onOpenQuoteCard={handleOpenQuoteCard}
      />

      {/* 2. Main Reader Canvas with Optional Study Sidebar */}
      <main
        className="flex-1 flex overflow-hidden cursor-default"
        onClick={(e) => {
          if (selectionPopoverState) {
            setSelectionPopoverState(null);
            return;
          }
          if (popoverState) {
            setPopoverState(null);
            return;
          }
          const target = e.target as HTMLElement;
          if (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('[role="dialog"]')
          ) {
            return;
          }
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            return;
          }
          setIsControlsVisible((prev) => !prev);
        }}
      >
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
        {readingMode === 'study' && isStudySidebarOpen && (
          <StudySidebar
            stats={currentChapter.stats}
            selectedLevelFilter={selectedLevelFilter}
            onSelectLevelFilter={setSelectedLevelFilter}
            onSelectWord={handleSelectWordFromSidebar}
            onClose={() => setIsStudySidebarOpen(false)}
            onExitStudyMode={() => setReadingMode('zen')}
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
        onToggleReadingMode={(mode) => {
          setReadingMode(mode);
          if (mode === 'study') {
            setIsStudySidebarOpen(true);
          }
        }}
        isStudySidebarOpen={readingMode === 'study' && isStudySidebarOpen}
        onToggleStudySidebar={() => setIsStudySidebarOpen((prev) => !prev)}
        theme={theme}
        onSelectTheme={setTheme}
        fontSize={fontSize}
        onChangeFontSize={(delta) => handleSetFontSize(fontSize + delta)}
        onSetFontSize={handleSetFontSize}
        isSerif={isSerif}
        onToggleFontFamily={handleToggleFontFamily}
        onSelectFontFamily={handleSelectFontFamily}
        onOpenVocab={() => setIsVocabOpen(true)}
        onOpenTOC={() => setIsTOCOpen(true)}
        vocabCount={vocabItems.length}
        isControlsVisible={isControlsVisible}
        onToggleControls={() => setIsControlsVisible((prev) => !prev)}
        onOpenQuoteCard={handleOpenQuoteCard}
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
        chineseTitle={currentBook.chineseTitle}
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

      {/* 5b. Drag / Selection Translation Popover */}
      {selectionPopoverState && (
        <SelectionPopover
          selectedText={selectionPopoverState.text}
          position={selectionPopoverState.position}
          onClose={() => {
            setSelectionPopoverState(null);
            if (typeof window !== 'undefined') {
              window.getSelection()?.removeAllRanges();
            }
          }}
          onDeepAnalyze={handleDeepAnalyzeSelection}
          onSaveVocab={handleSaveSelectionToVocab}
          onGenerateCard={(quote, translation) => {
            setQuoteCardState({ quote, translation });
          }}
          bookTitle={currentBook.chineseTitle || currentBook.title}
          author={currentBook.author}
          onOpenAIConfig={() => setIsAIConfigOpen(true)}
        />
      )}

      {/* 6. Sentence Syntax & Cultural Breakdown Drawer */}
      <SentenceDrawer
        sentence={activeSentence}
        onClose={() => setActiveSentence(null)}
        onSelectWord={(kw) => {
          handleSelectWordFromSidebar(kw);
        }}
        onGenerateCard={(quote, translation) => {
          setQuoteCardState({ quote, translation });
        }}
        bookTitle={currentBook.chineseTitle || currentBook.title}
        author={currentBook.author}
        onOpenAIConfig={() => setIsAIConfigOpen(true)}
      />

      {/* 7. Vocabulary Drawer */}
      <VocabDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        vocabItems={vocabItems}
        onRemoveItem={(id) => persistVocabItems(vocabItems.filter((i) => i.id !== id))}
        onToggleStatus={(id) =>
          persistVocabItems(
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
        onGenerateCard={(quote, translation) => handleOpenQuoteCard({ quote, translation })}
      />

      {/* 8. User Auth & Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        clientDataToMerge={gatherClientDataForMerge()}
      />

      {/* 9. AI BYOK Configuration Modal */}
      <AIConfigModal
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
      />

      {/* 10. Archival Quote Bookmark & Card Modal */}
      {quoteCardState && (
        <QuoteCardModal
          isOpen={Boolean(quoteCardState)}
          onClose={() => setQuoteCardState(null)}
          quote={quoteCardState.quote}
          initialTranslation={quoteCardState.translation}
          bookTitle={quoteCardState.bookTitle || currentBook.title}
          chineseTitle={quoteCardState.chineseTitle || currentBook.chineseTitle}
          author={quoteCardState.author || currentBook.author}
          chapterTitle={quoteCardState.chapterTitle || currentChapter.title}
        />
      )}
    </div>
  );
}
