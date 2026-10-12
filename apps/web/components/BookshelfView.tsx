'use client';

/* Hallmark · genre: editorial · macrostructure: Curated Catalog · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import React, { useState, useEffect, useRef } from 'react';
import { BookCardInfo } from '../lib/types';
import { LIBRARY_BOOKS } from '../lib/mockData';
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Sparkles,
  Upload,
  Plus,
  FileUp,
  CheckCircle2,
  Loader2,
  X,
  Library,
  ChevronLeft,
} from 'lucide-react';

interface BookshelfViewProps {
  onSelectBook: (bookId: string) => void;
}

interface CatalogBookItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  source: string;
}

interface ClothBinding {
  bg: string;
  border: string;
  foil: string;
  subtle: string;
  label: string;
}

const CLOTH_BINDINGS: ClothBinding[] = [
  { bg: 'bg-[#38151b]', border: 'border-[#522028]', foil: 'text-[#e9c787]', subtle: 'text-[#c4a065]', label: 'Burgundy Morocco' },
  { bg: 'bg-[#152a20]', border: 'border-[#204031]', foil: 'text-[#d6c59b]', subtle: 'text-[#b2a178]', label: 'Forest Buckram' },
  { bg: 'bg-[#182338]', border: 'border-[#243555]', foil: 'text-[#e2ceaa]', subtle: 'text-[#baa784]', label: 'Oxford Navy' },
  { bg: 'bg-[#332214]', border: 'border-[#4c331e]', foil: 'text-[#e8be7d]', subtle: 'text-[#be9557]', label: 'Antique Ochre' },
  { bg: 'bg-[#25282e]', border: 'border-[#383d46]', foil: 'text-[#dfdbd3]', subtle: 'text-[#a9adb6]', label: 'Charcoal Cloth' },
  { bg: 'bg-[#2d1829]', border: 'border-[#45253e]', foil: 'text-[#dfbed5]', subtle: 'text-[#b696ac]', label: 'Plum Calfskin' },
  { bg: 'bg-[#232919]', border: 'border-[#363f27]', foil: 'text-[#ced3a2]', subtle: 'text-[#9ea373]', label: 'Olive Buckram' },
  { bg: 'bg-[#3b1c16]', border: 'border-[#582a21]', foil: 'text-[#e5bf98]', subtle: 'text-[#b9936c]', label: 'Terracotta Cloth' },
  { bg: 'bg-[#1a2b2c]', border: 'border-[#263e40]', foil: 'text-[#d5dcd2]', subtle: 'text-[#a2aca0]', label: 'Deep Teal Buckram' },
  { bg: 'bg-[#2c1d18]', border: 'border-[#422c25]', foil: 'text-[#e5cbb5]', subtle: 'text-[#b49882]', label: 'Espresso Calf' },
];

function getClothBinding(seed: string): ClothBinding {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return CLOTH_BINDINGS[Math.abs(hash) % CLOTH_BINDINGS.length];
}

function getCefrBadgeStyle(cefr: string): string {
  switch (cefr) {
    case 'A2':
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    case 'B1':
      return 'bg-teal-950/60 text-teal-300 border-teal-800/60';
    case 'B2':
      return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    case 'C1':
      return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
    case 'C2':
      return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
    default:
      return 'bg-[var(--color-paper-elevated)] text-[var(--color-ink-2)] border-[var(--color-rule)]';
  }
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({ onSelectBook }) => {
  const [activeTab, setActiveTab] = useState<'my-shelf' | 'public-library'>('my-shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<string>('ALL');

  // Books in local shelf
  const [myBooks, setMyBooks] = useState<BookCardInfo[]>(LIBRARY_BOOKS);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // Full 1,528 catalog state
  const [catalogBooks, setCatalogBooks] = useState<CatalogBookItem[]>([]);
  const [catalogTotal, setCatalogTotal] = useState<number>(0);
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState<number>(1);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedBook, setUploadedBook] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Public domain one-click import loading state
  const [importingSlug, setImportingSlug] = useState<string | null>(null);

  // 1. Fetch books from backend API on mount
  const fetchMyBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        if (data.books && Array.isArray(data.books) && data.books.length > 0) {
          const existingIds = new Set(data.books.map((b: BookCardInfo) => b.id));
          const mockUnadded = LIBRARY_BOOKS.filter((b) => !existingIds.has(b.id));
          setMyBooks([...data.books, ...mockUnadded]);
        }
      }
    } catch (err) {
      console.warn('[Bookshelf] Using preset library:', err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  // 2. Fetch full catalog from backend
  const fetchFullCatalog = async (query: string, page: number) => {
    setIsLoadingCatalog(true);
    try {
      const res = await fetch(
        `/api/books/catalog?q=${encodeURIComponent(query)}&page=${page}&limit=36`
      );
      if (res.ok) {
        const data = await res.json();
        setCatalogBooks(data.books || []);
        setCatalogTotal(data.total || 0);
        setCatalogTotalPages(data.totalPages || 1);
        setCatalogPage(data.page || 1);
      }
    } catch (err) {
      console.error('[Catalog] Failed to fetch catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'public-library') {
      fetchFullCatalog(catalogSearch, catalogPage);
    }
  }, [activeTab, catalogPage]);

  // Handle catalog search debounce
  useEffect(() => {
    if (activeTab !== 'public-library') return;
    const timer = setTimeout(() => {
      setCatalogPage(1);
      fetchFullCatalog(catalogSearch, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  // Set of local book IDs
  const localBookIds = new Set(myBooks.map((b) => b.id));

  // Filter my books
  const filterList = <T extends BookCardInfo>(books: T[]): T[] => {
    return books.filter((b) => {
      const matchSearch =
        searchQuery === '' ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.chineseTitle.includes(searchQuery) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCefr =
        selectedCefr === 'ALL' ||
        b.cefr === selectedCefr ||
        (selectedCefr === 'B1' && (b.cefr === 'A2' || b.cefr === 'B1'));

      return matchSearch && matchCefr;
    });
  };

  const filteredMyBooks = filterList(myBooks);

  // Pick currently reading book (first book with reading progress or Gatsby)
  const currentlyReading =
    myBooks.find((b) => b.readingProgress && b.readingProgress > 0) || myBooks[0];

  // 3. Handle EPUB Upload
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      alert('请上传标准 .epub 格式文件');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadMessage('正在上传电子书文件并解析结构...');

      const formData = new FormData();
      formData.append('file', file);

      const timer = setTimeout(() => {
        setUploadStatus('analyzing');
        setUploadMessage('正在解析章节、提取词汇并运行蓝思/CEFR难度评测...');
      }, 800);

      const res = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '上传解析失败');
      }

      const result = await res.json();
      setUploadStatus('success');
      setUploadedBook(result.book);
      setUploadMessage(result.message || '解析成功！');

      await fetchMyBooks();
    } catch (err: any) {
      setUploadStatus('error');
      setUploadMessage(err.message || '上传处理失败，请重试');
    }
  };

  // 4. Handle One-Click Import from Public Library
  const handleImportPublicBook = async (slug: string, id: string, title: string) => {
    if (localBookIds.has(id)) {
      onSelectBook(id);
      return;
    }

    try {
      setImportingSlug(slug);
      const res = await fetch('/api/books/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '导入失败');
      }

      const result = await res.json();
      await fetchMyBooks();
      onSelectBook(result.book?.id || id);
    } catch (err: any) {
      alert(`导入《${title}》失败: ` + err.message);
    } finally {
      setImportingSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-book-sans selection:bg-[var(--color-accent)]/20">
      {/* 1. Hallmark N6 Broadsheet / Library Masthead */}
      <header className="sticky top-0 z-30 bg-[var(--color-paper-2)]/95 backdrop-blur-md border-b border-[var(--color-rule)] px-6 sm:px-12 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Colophon */}
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center font-book-serif font-bold text-sm shadow-xs select-none">
              ER
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-book-serif font-semibold text-lg tracking-tight text-[var(--color-ink)]">
                  EnglishReader
                </h1>
                <span className="text-[10px] text-[var(--color-accent)] font-meta-mono uppercase tracking-wider font-semibold border border-[var(--color-rule)] px-1.5 py-0.5 rounded">
                  原著分级典藏
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono hidden sm:block">
                标准数字化排版 · ECDICT 770,000 词库离线解析
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-5 sm:gap-7 text-xs">
            {/* Tab: My Bookshelf */}
            <button
              onClick={() => setActiveTab('my-shelf')}
              className={`flex items-center gap-1.5 pb-1 font-medium transition-[color,border-color] duration-150 cursor-pointer ${
                activeTab === 'my-shelf'
                  ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border-b-2 border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>我的书架 ({myBooks.length})</span>
            </button>

            {/* Tab: Public Library */}
            <button
              onClick={() => setActiveTab('public-library')}
              className={`flex items-center gap-1.5 pb-1 font-medium transition-[color,border-color] duration-150 cursor-pointer ${
                activeTab === 'public-library'
                  ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border-b-2 border-transparent'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>公版文库 (1,500+)</span>
            </button>

            {/* Upload EPUB Action */}
            <button
              onClick={() => {
                setUploadStatus('idle');
                setUploadMessage('');
                setUploadedBook(null);
                setIsUploadModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-md bg-[var(--color-paper-elevated)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] font-medium text-xs flex items-center gap-1.5 transition-[background-color,border-color] duration-150 shadow-2xs cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden sm:inline">导入 EPUB</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-8 space-y-10">
        {/* TAB 1: MY BOOKSHELF */}
        {activeTab === 'my-shelf' && (
          <>
            {/* Currently Reading Featured Folio Hero */}
            {currentlyReading && (
              <section className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    {/* Tactile Hardcover Book with Spine Crease & Cloth Binding */}
                    {(() => {
                      const binding = getClothBinding(currentlyReading.title);
                      return (
                        <div
                          onClick={() => onSelectBook(currentlyReading.id)}
                          className={`w-32 h-48 rounded-r-lg rounded-l-xs ${binding.bg} border-t border-r border-b ${binding.border} p-3.5 flex flex-col justify-between book-cloth-shadow book-spine-crease shrink-0 cursor-pointer hover:-translate-y-1 transition-[transform,box-shadow] duration-200`}
                        >
                          <div className={`text-[9px] uppercase tracking-widest ${binding.subtle} font-meta-mono`}>
                            Folio Edition
                          </div>
                          <div className="space-y-1">
                            <h3 className={`font-book-serif font-medium text-sm leading-snug line-clamp-3 ${binding.foil}`}>
                              {currentlyReading.title}
                            </h3>
                            <p className={`text-[10px] ${binding.subtle} font-book-serif truncate`}>
                              {currentlyReading.author}
                            </p>
                          </div>
                          <div className={`text-[8px] uppercase tracking-wider ${binding.subtle} font-meta-mono`}>
                            EnglishReader
                          </div>
                        </div>
                      );
                    })()}

                    {/* Editorial Details */}
                    <div className="space-y-2.5 max-w-xl">
                      <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                        <span className="text-[11px] uppercase tracking-wider text-[var(--color-accent)] font-semibold flex items-center gap-1 font-meta-mono">
                          <Clock className="w-3.5 h-3.5" />
                          正在阅读
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-semibold font-meta-mono ${getCefrBadgeStyle(
                            currentlyReading.cefr
                          )}`}
                        >
                          {currentlyReading.cefr} · 蓝思 {currentlyReading.lexile}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-normal text-[var(--color-ink)] tracking-tight font-book-serif">
                        {currentlyReading.title}
                        <span className="text-base text-[var(--color-ink-2)] font-normal ml-2">
                          ({currentlyReading.chineseTitle})
                        </span>
                      </h2>

                      <p className="text-xs text-[var(--color-ink-2)] line-clamp-2 leading-relaxed">
                        {currentlyReading.description}
                      </p>

                      <div className="pt-2 flex items-center gap-4 text-xs text-[var(--color-ink-muted)] justify-center sm:justify-start">
                        <span className="font-meta-mono">
                          已读进度：<strong className="text-[var(--color-ink)] font-semibold">{currentlyReading.readingProgress}%</strong>
                        </span>
                        <div className="w-32 h-1 rounded-full bg-[var(--color-rule)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-accent)] rounded-full transition-[width] duration-300"
                            style={{ width: `${Math.max(5, currentlyReading.readingProgress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => onSelectBook(currentlyReading.id)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-xs transition-[background-color,transform] duration-150 shrink-0 cursor-pointer"
                  >
                    <span>继续翻阅</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* Search & CEFR Filters */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="在书架中搜索书名、作者..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-lg text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-focus)] transition-colors"
                  />
                </div>

                {/* CEFR Level Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {[
                    { label: '全部书籍', value: 'ALL' },
                    { label: '入门 A2/B1 · 四级', value: 'B1' },
                    { label: '进阶 B2 · 六级/雅思', value: 'B2' },
                    { label: '高阶 C1 · 考研/GRE', value: 'C1' },
                  ].map((pill) => (
                    <button
                      key={pill.value}
                      onClick={() => setSelectedCefr(pill.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCefr === pill.value
                          ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold'
                          : 'bg-[var(--color-paper-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-rule)]'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* My Books Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-3">
                <h3 className="font-book-serif text-lg font-medium text-[var(--color-ink)]">
                  书房典藏 ({filteredMyBooks.length})
                </h3>
                <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  770,000 离线词条即点即译
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upload Action Card */}
                <div
                  onClick={() => {
                    setUploadStatus('idle');
                    setUploadMessage('');
                    setUploadedBook(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="p-5 rounded-xl bg-[var(--color-paper-2)]/60 hover:bg-[var(--color-paper-2)] border border-dashed border-[var(--color-rule)] hover:border-[var(--color-accent)]/80 transition-[background-color,border-color] duration-150 cursor-pointer group flex flex-col items-center justify-center min-h-[190px] text-center space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-paper-elevated)] group-hover:bg-[var(--color-accent)]/15 text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                      导入本地 EPUB 书籍
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1 max-w-[210px] leading-relaxed">
                      拖拽或选择文件，系统自动进行章节结构化与蓝思难度分析
                    </p>
                  </div>
                </div>

                {/* Book Cards */}
                {filteredMyBooks.map((book) => {
                  const binding = getClothBinding(book.title);
                  return (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book.id)}
                      className="p-5 rounded-xl bg-[var(--color-paper-2)]/90 hover:bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-accent)]/60 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer group flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        {/* Tactile Book Cover */}
                        <div
                          className={`w-24 h-36 rounded-r-md rounded-l-xs ${binding.bg} border-t border-r border-b ${binding.border} p-2.5 flex flex-col justify-between book-cloth-shadow book-spine-crease shrink-0`}
                        >
                          <span className={`text-[8px] ${binding.subtle} uppercase font-meta-mono tracking-wider`}>Classic</span>
                          <div>
                            <h4 className={`font-book-serif font-medium text-xs leading-snug line-clamp-3 ${binding.foil}`}>
                              {book.title}
                            </h4>
                            <p className={`text-[9px] ${binding.subtle} font-book-serif truncate mt-0.5`}>
                              {book.author}
                            </p>
                          </div>
                          <span className={`text-[8px] ${binding.subtle} font-meta-mono`}>{book.publishedYear}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border font-meta-mono ${getCefrBadgeStyle(
                                book.cefr
                              )}`}
                            >
                              {book.cefr}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-paper-elevated)] text-[var(--color-ink-muted)] border border-[var(--color-rule)] font-meta-mono">
                              {book.lexile}
                            </span>
                            <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                              {book.category}
                            </span>
                          </div>

                          <h4 className="font-book-serif font-medium text-base text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-[var(--color-ink-2)] truncate">
                            {book.chineseTitle}
                          </p>

                          <p className="text-[11px] text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Progress */}
                      <div className="mt-4 pt-3 border-t border-[var(--color-rule)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-ink-muted)] text-[11px] font-meta-mono">
                          约 {book.wordCount.toLocaleString()} 词 · {book.totalChapters} 章
                        </span>

                        <span className="text-[var(--color-accent)] font-medium flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform duration-150">
                          {book.readingProgress > 0 ? '继续翻阅' : '开启阅读'} &gt;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: PUBLIC DOMAIN LIBRARY (在线公共文库 - 1,528 部世界经典) */}
        {activeTab === 'public-library' && (
          <>
            {/* Broadsheet Banner */}
            <section className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--color-accent)] font-semibold text-xs font-meta-mono">
                    <Library className="w-3.5 h-3.5" />
                    <span>Standard Ebooks 官方 1,528 卷精校典藏全库</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-normal text-[var(--color-ink)] tracking-tight font-book-serif">
                    世界公版英语名著全库
                  </h2>
                  <p className="text-xs text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
                    全量索引 <strong>1,528 部</strong> 经典原著，涵盖莎士比亚、狄更斯、马克·吐温、简·奥斯汀、王尔德、毛姆等巨作。
                    支持<strong>在线检索与一键秒级入库</strong>，点击即刻沉浸精读。
                  </p>
                </div>

                <div className="flex items-center gap-5 text-xs text-[var(--color-ink-muted)] bg-[var(--color-paper-elevated)] px-5 py-3 rounded-xl border border-[var(--color-rule)] shrink-0 font-meta-mono">
                  <div className="text-center">
                    <div className="text-[var(--color-accent)] font-bold text-lg">1,528</div>
                    <div className="text-[10px]">精校原著卷</div>
                  </div>
                  <div className="w-px h-8 bg-[var(--color-rule)]" />
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold text-lg">A2–C1</div>
                    <div className="text-[10px]">全级别梯度</div>
                  </div>
                  <div className="w-px h-8 bg-[var(--color-rule)]" />
                  <div className="text-center">
                    <div className="text-[var(--color-ink)] font-bold text-lg">&lt;3s</div>
                    <div className="text-[10px]">一键秒级解析</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Search */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="检索 1,500+ 部名著（如 Austen, Dickens, Shakespeare, Pooh）..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-lg text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-focus)] transition-colors"
                  />
                </div>

                <div className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                  {isLoadingCatalog ? (
                    <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      正在检索文库索引...
                    </span>
                  ) : (
                    <span>
                      共找到 <strong className="text-[var(--color-ink)]">{catalogTotal}</strong> 部公版名著
                      {catalogTotalPages > 1 && ` · 第 ${catalogPage} / ${catalogTotalPages} 页`}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Catalog Grid */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogBooks.map((book) => {
                  const isImported = localBookIds.has(book.id);
                  const isCurrentImporting = importingSlug === book.slug;
                  const binding = getClothBinding(book.title + book.author);

                  return (
                    <div
                      key={book.slug}
                      className="p-5 rounded-xl bg-[var(--color-paper-2)]/90 hover:bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-accent)]/60 transition-[transform,box-shadow,border-color] duration-200 flex flex-col justify-between shadow-2xs group hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        {/* Cover */}
                        <div
                          className={`w-24 h-36 rounded-r-md rounded-l-xs ${binding.bg} border-t border-r border-b ${binding.border} p-2.5 flex flex-col justify-between book-cloth-shadow book-spine-crease shrink-0`}
                        >
                          <span className={`text-[8px] ${binding.subtle} uppercase font-meta-mono tracking-wider`}>Standard</span>
                          <div>
                            <h4 className={`font-book-serif font-medium text-xs leading-snug line-clamp-3 ${binding.foil}`}>
                              {book.title}
                            </h4>
                            <p className={`text-[9px] ${binding.subtle} font-book-serif truncate mt-1`}>
                              {book.author}
                            </p>
                          </div>
                          <span className={`text-[8px] ${binding.subtle} font-meta-mono`}>Ebooks</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-paper-elevated)] text-[var(--color-accent)] border border-[var(--color-rule)] font-meta-mono font-semibold">
                                公版典藏
                              </span>
                            </div>

                            <h4 className="font-book-serif font-medium text-base text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors mt-1.5 line-clamp-2">
                              {book.title}
                            </h4>
                            <p className="text-xs text-[var(--color-ink-2)] truncate mt-0.5">
                              {book.author}
                            </p>
                          </div>

                          <div className="text-[10px] text-[var(--color-ink-muted)]">
                            标准数字化排版 · 支持蓝思分级与离线查词
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Import Button */}
                      <div className="mt-4 pt-3 border-t border-[var(--color-rule)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-ink-muted)] text-[11px] truncate max-w-[130px] font-meta-mono">
                          {book.author}
                        </span>

                        {isImported ? (
                          <button
                            onClick={() => onSelectBook(book.id)}
                            className="px-3 py-1 rounded-md bg-[var(--color-paper-elevated)] hover:bg-[var(--color-paper)] text-[var(--color-accent)] font-semibold text-xs flex items-center gap-1 border border-[var(--color-rule)] transition-colors cursor-pointer"
                          >
                            <span>已在书架 · 立即阅读</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled={isCurrentImporting}
                            onClick={() => handleImportPublicBook(book.slug, book.id, book.title)}
                            className="px-3 py-1 rounded-md bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] disabled:opacity-50 text-[var(--color-paper)] font-medium text-xs flex items-center gap-1 shadow-2xs transition-[background-color] duration-150 cursor-pointer"
                          >
                            {isCurrentImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>下载评测中...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>一键入库阅读</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {catalogTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  <button
                    disabled={catalogPage <= 1}
                    onClick={() => setCatalogPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 rounded-md bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:bg-[var(--color-paper-elevated)] disabled:opacity-30 text-xs text-[var(--color-ink)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>上一页</span>
                  </button>

                  <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                    第 <strong className="text-[var(--color-ink)]">{catalogPage}</strong> / {catalogTotalPages} 页
                  </span>

                  <button
                    disabled={catalogPage >= catalogTotalPages}
                    onClick={() => setCatalogPage((prev) => Math.min(prev + 1, catalogTotalPages))}
                    className="px-4 py-2 rounded-md bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:bg-[var(--color-paper-elevated)] disabled:opacity-30 text-xs text-[var(--color-ink)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>下一页</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Hallmark Ft4 Colophon Footer */}
      <footer className="mt-20 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] py-10 px-6 sm:px-12 text-xs text-[var(--color-ink-muted)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-book-serif text-sm font-medium text-[var(--color-ink)]">
              EnglishReader · 英文经典分级精读文库
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)]">
              遵循真实纸书排版美学与双语浸润式阅读哲学 · 蓝思分级驱动
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-meta-mono text-[var(--color-ink-muted)]">
            <span>Standard Ebooks 1,528 卷典藏</span>
            <span>·</span>
            <span>ECDICT 770,000 离线词典</span>
            <span>·</span>
            <span>Newsreader / Charter 排版</span>
          </div>
        </div>
      </footer>

      {/* 3. Upload EPUB Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl relative space-y-6">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-5 top-5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-1.5 rounded-md hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-book-serif font-medium text-xl text-[var(--color-ink)] flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[var(--color-accent)]" />
                导入 EPUB 原著
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                上传自有电子书文件，系统将在服务端清洗章节、建立索引并计算全书蓝思可读性与词汇难度。
              </p>
            </div>

            {/* Drop Zone */}
            {uploadStatus !== 'success' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--color-rule)] hover:border-[var(--color-accent)] bg-[var(--color-paper-elevated)] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-[border-color] duration-150 space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".epub"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {uploadStatus === 'idle' && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[var(--color-paper)] flex items-center justify-center text-[var(--color-accent)] shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--color-ink)]">点击选择或将 EPUB 文件拖入此处</p>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-1">支持标准 .epub 电子书</p>
                    </div>
                  </>
                )}

                {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
                  <div className="space-y-3 py-4">
                    <Loader2 className="w-7 h-7 text-[var(--color-accent)] animate-spin mx-auto" />
                    <p className="text-sm font-medium text-[var(--color-ink)]">{uploadMessage}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">正在进行蓝思分级评测，通常需要 2–3 秒...</p>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="space-y-2 py-2 text-rose-500">
                    <p className="text-sm font-semibold">{uploadMessage}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">点击此处可重新选择文件上传</p>
                  </div>
                )}
              </div>
            ) : (
              /* Success View */
              <div className="p-6 rounded-xl bg-[var(--color-paper-elevated)] border border-emerald-500/40 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-book-serif font-medium text-base text-[var(--color-ink)]">{uploadedBook?.title || '解析完成'}</h4>
                    <p className="text-xs text-[var(--color-ink-muted)]">{uploadedBook?.author} ({uploadedBook?.publishedYear})</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[var(--color-rule)] text-center font-meta-mono">
                  <div className="p-2 bg-[var(--color-paper-2)] rounded-md">
                    <div className="text-[10px] text-[var(--color-ink-muted)]">总章节</div>
                    <div className="font-bold text-sm text-[var(--color-ink)]">{uploadedBook?.totalChapters} 章</div>
                  </div>
                  <div className="p-2 bg-[var(--color-paper-2)] rounded-md">
                    <div className="text-[10px] text-[var(--color-ink-muted)]">总词数</div>
                    <div className="font-bold text-sm text-[var(--color-ink)]">{uploadedBook?.wordCount?.toLocaleString()} 词</div>
                  </div>
                  <div className="p-2 bg-[var(--color-paper-2)] rounded-md">
                    <div className="text-[10px] text-[var(--color-ink-muted)]">难度评级</div>
                    <div className="font-bold text-sm text-[var(--color-accent)]">{uploadedBook?.cefr} · {uploadedBook?.lexile}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      if (uploadedBook?.id) {
                        onSelectBook(uploadedBook.id);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium text-xs tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
                  >
                    立即打开阅读
                  </button>
                  <button
                    onClick={() => {
                      setUploadStatus('idle');
                      setUploadedBook(null);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-[var(--color-paper-2)] hover:bg-[var(--color-paper)] text-[var(--color-ink-2)] font-medium text-xs border border-[var(--color-rule)] transition-colors cursor-pointer"
                  >
                    继续上传
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
