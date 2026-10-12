'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookCardInfo } from '../lib/types';
import { LIBRARY_BOOKS } from '../lib/mockData';
import { PUBLIC_CATALOG_BOOKS, PublicCatalogBook } from '../lib/publicCatalog';
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Compass,
  Sparkles,
  Upload,
  Plus,
  FileUp,
  CheckCircle2,
  Loader2,
  X,
  Library,
  ChevronLeft,
  Flame,
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

const COVER_GRADIENTS = [
  'from-amber-600 via-amber-800 to-stone-900',
  'from-emerald-600 via-teal-800 to-stone-900',
  'from-purple-700 via-purple-900 to-stone-950',
  'from-rose-700 via-amber-900 to-stone-950',
  'from-cyan-900 via-stone-900 to-black',
  'from-red-900 via-stone-900 to-stone-950',
  'from-blue-900 via-indigo-950 to-stone-900',
  'from-slate-800 via-stone-900 to-black',
  'from-emerald-950 via-stone-900 to-zinc-950',
  'from-amber-900 via-stone-900 to-slate-900',
  'from-sky-700 via-indigo-900 to-stone-900',
];

function getCoverGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
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
  const [catalogViewMode, setCatalogViewMode] = useState<'featured' | 'full'>('full');

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
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.chineseTitle.includes(q) ||
        b.author.toLowerCase().includes(q);

      const matchesCefr =
        selectedCefr === 'ALL' ||
        (selectedCefr === 'B1' && (b.cefr === 'A2' || b.cefr === 'B1')) ||
        (selectedCefr === 'B2' && b.cefr === 'B2') ||
        (selectedCefr === 'C1' && (b.cefr === 'C1' || b.cefr === 'C2'));

      return matchesSearch && matchesCefr;
    });
  };

  const filteredMyBooks = filterList(myBooks);
  const currentlyReading = myBooks.find((b) => b.readingProgress > 0) || myBooks[0];

  const getCefrBadgeStyle = (cefr: string) => {
    switch (cefr) {
      case 'C1':
      case 'C2':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'B2':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'B1':
      case 'A2':
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  // 3. Handle EPUB upload
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setUploadStatus('error');
      setUploadMessage('仅支持上传 .epub 格式的电子书文件');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadMessage(`正在上传《${file.name}》...`);

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
    <div className="min-h-screen bg-[#1c1c1e] text-[#ededed] font-sans">
      {/* 1. WeChat Read Top Bar */}
      <header className="sticky top-0 z-30 bg-[#1c1c1e]/90 backdrop-blur-md border-b border-stone-800/80 px-6 sm:px-12 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              ER
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                EnglishReader
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/40">
                  原著分级阅读
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {/* Tab: My Bookshelf */}
            <button
              onClick={() => setActiveTab('my-shelf')}
              className={`flex items-center gap-1.5 transition-colors font-medium cursor-pointer ${
                activeTab === 'my-shelf' ? 'text-amber-400 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              我的书架 ({myBooks.length})
            </button>

            {/* Tab: Public Library */}
            <button
              onClick={() => setActiveTab('public-library')}
              className={`flex items-center gap-1.5 transition-colors font-medium cursor-pointer ${
                activeTab === 'public-library' ? 'text-amber-400 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Library className="w-4 h-4" />
              公共文库 (1,500+)
            </button>

            {/* Upload Button */}
            <button
              onClick={() => {
                setUploadStatus('idle');
                setUploadMessage('');
                setUploadedBook(null);
                setIsUploadModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700/80 text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>导入 EPUB</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-8 space-y-10">
        {/* TAB 1: MY BOOKSHELF */}
        {activeTab === 'my-shelf' && (
          <>
            {/* Currently Reading Featured Hero Card */}
            {currentlyReading && (
              <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl border border-stone-800/90 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
                  <div className="flex items-center gap-6">
                    {/* Book Spine / Cover */}
                    <div
                      onClick={() => onSelectBook(currentlyReading.id)}
                      className={`w-28 sm:w-32 h-40 sm:h-44 rounded-xl bg-gradient-to-br ${currentlyReading.coverBg} p-3 flex flex-col justify-between shadow-2xl border border-white/10 shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200`}
                    >
                      <div className="text-[9px] uppercase tracking-wider text-amber-200/80 font-mono">
                        EnglishReader
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-white line-clamp-2 leading-tight">
                          {currentlyReading.title}
                        </h3>
                        <p className="text-[10px] text-stone-300 font-serif italic mt-0.5 truncate">
                          {currentlyReading.author}
                        </p>
                      </div>
                      <div className="text-[9px] font-sans text-amber-300/80 truncate">
                        {currentlyReading.chineseTitle}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          当前在读
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getCefrBadgeStyle(
                            currentlyReading.cefr
                          )}`}
                        >
                          {currentlyReading.cefr} · 蓝思 {currentlyReading.lexile}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-book-serif">
                        {currentlyReading.title}
                        <span className="text-lg text-stone-400 font-normal ml-2">
                          ({currentlyReading.chineseTitle})
                        </span>
                      </h2>

                      <p className="text-xs text-stone-400 max-w-xl line-clamp-2">
                        {currentlyReading.description}
                      </p>

                      <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
                        <div>
                          已读进度：<span className="font-semibold text-white">{currentlyReading.readingProgress}%</span>
                        </div>
                        <div className="w-28 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.max(5, currentlyReading.readingProgress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectBook(currentlyReading.id)}
                    className="w-full md:w-auto px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:gap-3 shrink-0 cursor-pointer"
                  >
                    <span>继续阅读</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* Search & CEFR Filters */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="在我的书架中搜索书名、作者..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition-colors"
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        selectedCefr === pill.value
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">
                  我的书架 ({filteredMyBooks.length})
                </h3>
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  已内置 770,000 离线词条极速点词
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
                  className="p-5 rounded-2xl bg-stone-900/40 hover:bg-stone-900 border border-dashed border-stone-750 hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px] text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-800 group-hover:bg-amber-500/20 text-stone-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      导入本地 EPUB 书籍
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-[200px]">
                      支持拖拽上传，系统自动提取章节、句子并计算蓝思难度
                    </p>
                  </div>
                </div>

                {/* Book Cards */}
                {filteredMyBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book.id)}
                    className="p-5 rounded-2xl bg-stone-900/60 hover:bg-stone-850/80 border border-stone-800/80 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
                  >
                    <div className="flex gap-4">
                      {/* Cover */}
                      <div
                        className={`w-24 h-34 rounded-lg bg-gradient-to-br ${book.coverBg} p-2.5 flex flex-col justify-between shadow-md border border-white/10 shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <span className="text-[8px] text-amber-200/60 uppercase font-mono">Book</span>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-white line-clamp-2 leading-tight">
                            {book.title}
                          </h4>
                          <p className="text-[9px] text-stone-300 font-serif italic mt-0.5 truncate">
                            {book.author}
                          </p>
                        </div>
                        <span className="text-[8px] text-stone-300">{book.publishedYear}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${getCefrBadgeStyle(
                              book.cefr
                            )}`}
                          >
                            {book.cefr}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-stone-700">
                            {book.lexile}
                          </span>
                          <span className="text-[9px] text-stone-400 font-medium">
                            {book.category}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-400 font-medium truncate">
                          {book.chineseTitle}
                        </p>

                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>

                        <div className="pt-1 text-[10px] text-amber-500/80 font-medium">
                          推荐读者：{book.recommendedAudience}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Progress */}
                    <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs">
                      <span className="text-stone-500 text-[11px]">
                        约 {book.wordCount.toLocaleString()} 词 · {book.totalChapters} 章节
                      </span>

                      <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs">
                        {book.readingProgress > 0 ? '继续阅读' : '开始阅读'} &gt;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: PUBLIC DOMAIN LIBRARY (在线公共文库 - 1,528 部世界经典) */}
        {activeTab === 'public-library' && (
          <>
            {/* Banner */}
            <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Compass className="w-4 h-4" />
                    <span>Standard Ebooks 官方 1,500+ 精校典藏公开全库</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-book-serif">
                    世界公版英语名著全库
                  </h2>
                  <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                    已全量索引 <strong>1,528 部</strong> 世界文学经典，涵盖莎士比亚、狄更斯、马克·吐温、简·奥斯汀、王尔德、毛姆等所有经典巨作。
                    支持<strong>在线搜索与一键秒级入库</strong>，点击即刻开始双栏沉浸式阅读。
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-400 bg-stone-900/80 px-4 py-3 rounded-2xl border border-stone-800 shrink-0">
                  <div className="text-center">
                    <div className="text-amber-400 font-bold text-lg">1,528</div>
                    <div className="text-[10px]">精校原著全集</div>
                  </div>
                  <div className="w-px h-8 bg-stone-800" />
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold text-lg">A2-C1</div>
                    <div className="text-[10px]">全级别难度</div>
                  </div>
                  <div className="w-px h-8 bg-stone-800" />
                  <div className="text-center">
                    <div className="text-purple-400 font-bold text-lg">&lt;3s</div>
                    <div className="text-[10px]">一键秒级入库</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Search & Mode Tabs */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索 1,500+ 部名著（如 Austen, Dickens, Shakespeare, Pooh）..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="text-xs text-stone-400">
                  {isLoadingCatalog ? (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      正在检索公版文库...
                    </span>
                  ) : (
                    <span>
                      共找到 <strong className="text-white">{catalogTotal}</strong> 部公版名著
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
                  const coverBg = getCoverGradient(book.title + book.author);

                  return (
                    <div
                      key={book.slug}
                      className="p-5 rounded-2xl bg-stone-900/60 hover:bg-stone-850/80 border border-stone-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg group"
                    >
                      <div className="flex gap-4">
                        {/* Cover */}
                        <div
                          className={`w-24 h-34 rounded-lg bg-gradient-to-br ${coverBg} p-2.5 flex flex-col justify-between shadow-md border border-white/10 shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          <span className="text-[8px] text-amber-200/60 uppercase font-mono">Classic</span>
                          <div>
                            <h4 className="font-serif font-bold text-xs text-white line-clamp-3 leading-tight">
                              {book.title}
                            </h4>
                            <p className="text-[9px] text-stone-300 font-serif italic mt-1 truncate">
                              {book.author}
                            </p>
                          </div>
                          <span className="text-[8px] text-stone-400">Standard Ebooks</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700 font-semibold">
                                公版经典
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors mt-1.5 line-clamp-2">
                              {book.title}
                            </h4>
                            <p className="text-xs text-stone-400 font-medium truncate mt-0.5">
                              {book.author}
                            </p>
                          </div>

                          <div className="text-[10px] text-stone-500">
                            标准数字化排版 · 支持蓝思分级与点词查词
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Import Button */}
                      <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs">
                        <span className="text-stone-500 text-[11px] truncate max-w-[120px]">
                          {book.author}
                        </span>

                        {isImported ? (
                          <button
                            onClick={() => onSelectBook(book.id)}
                            className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-750 text-amber-400 font-semibold text-xs flex items-center gap-1 border border-stone-700 transition-colors cursor-pointer"
                          >
                            <span>已在书架 · 立即阅读</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled={isCurrentImporting}
                            onClick={() => handleImportPublicBook(book.slug, book.id, book.title)}
                            className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 disabled:text-stone-500 font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            {isCurrentImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>下载分级中...</span>
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
                    className="px-4 py-2 rounded-full bg-stone-900 border border-stone-800 hover:bg-stone-800 disabled:opacity-40 text-xs text-white flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>上一页</span>
                  </button>

                  <span className="text-xs text-stone-400">
                    第 <strong className="text-amber-400">{catalogPage}</strong> / {catalogTotalPages} 页
                  </span>

                  <button
                    disabled={catalogPage >= catalogTotalPages}
                    onClick={() => setCatalogPage((prev) => Math.min(prev + 1, catalogTotalPages))}
                    className="px-4 py-2 rounded-full bg-stone-900 border border-stone-800 hover:bg-stone-800 disabled:opacity-40 text-xs text-white flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>下一页</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* 3. Upload EPUB Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#242426] border border-stone-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-5 top-5 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800/80 hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-amber-400" />
                导入 EPUB 原著
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                上传你自己的英文电子书，后台将自动清洗章节并完成全书词汇与可读性评测。
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
                className="border-2 border-dashed border-stone-600 hover:border-amber-500/80 bg-stone-900/60 hover:bg-stone-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
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
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">点击选择或将 EPUB 文件拖入此处</p>
                      <p className="text-xs text-stone-500 mt-1">支持标准 .epub 格式电子书</p>
                    </div>
                  </>
                )}

                {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
                  <div className="space-y-3 py-4">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-sm font-medium text-white">{uploadMessage}</p>
                    <p className="text-xs text-stone-500">正在分析难度分级，可能需要数秒...</p>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="space-y-2 py-2 text-rose-400">
                    <p className="text-sm font-semibold">{uploadMessage}</p>
                    <p className="text-xs text-stone-400">点击此处可重新选择文件上传</p>
                  </div>
                )}
              </div>
            ) : (
              /* Success View */
              <div className="p-6 rounded-2xl bg-stone-900/80 border border-emerald-500/40 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-white">{uploadedBook?.title || '解析完成'}</h4>
                    <p className="text-xs text-stone-400">{uploadedBook?.author} ({uploadedBook?.publishedYear})</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-800 text-center">
                  <div className="p-2 bg-stone-850 rounded-lg">
                    <div className="text-[10px] text-stone-400">总章节</div>
                    <div className="font-bold text-sm text-white">{uploadedBook?.totalChapters} 章</div>
                  </div>
                  <div className="p-2 bg-stone-850 rounded-lg">
                    <div className="text-[10px] text-stone-400">预估词数</div>
                    <div className="font-bold text-sm text-white">{uploadedBook?.wordCount?.toLocaleString()} 词</div>
                  </div>
                  <div className="p-2 bg-stone-850 rounded-lg">
                    <div className="text-[10px] text-stone-400">难度评级</div>
                    <div className="font-bold text-sm text-amber-400">{uploadedBook?.cefr} · {uploadedBook?.lexile}</div>
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
                    className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    立即打开阅读
                  </button>
                  <button
                    onClick={() => {
                      setUploadStatus('idle');
                      setUploadedBook(null);
                    }}
                    className="px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-colors cursor-pointer"
                  >
                    继续上传其他书
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
