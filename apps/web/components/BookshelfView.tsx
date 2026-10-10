'use client';

import React, { useState } from 'react';
import { BookCardInfo } from '../lib/types';
import { LIBRARY_BOOKS } from '../lib/mockData';
import { Search, BookOpen, Clock, ChevronRight, Award, Compass, Sparkles, SlidersHorizontal } from 'lucide-react';

interface BookshelfViewProps {
  onSelectBook: (bookId: string) => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({ onSelectBook }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<string>('ALL');

  const filteredBooks = LIBRARY_BOOKS.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.chineseTitle.includes(searchQuery) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCefr =
      selectedCefr === 'ALL' ||
      (selectedCefr === 'B1' && (b.cefr === 'A2' || b.cefr === 'B1')) ||
      (selectedCefr === 'B2' && b.cefr === 'B2') ||
      (selectedCefr === 'C1' && (b.cefr === 'C1' || b.cefr === 'C2'));

    return matchesSearch && matchesCefr;
  });

  const currentlyReading = LIBRARY_BOOKS.find((b) => b.readingProgress > 0) || LIBRARY_BOOKS[0];

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
                  原著书架
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-stone-400">
            <span className="text-white font-semibold flex items-center gap-1.5 cursor-pointer">
              <BookOpen className="w-4 h-4 text-amber-500" />
              我的书架
            </span>
            <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              发现新书
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-900 font-bold text-xs flex items-center justify-center shadow-xs">
              M
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-10 space-y-12">
        {/* Currently Reading Featured Hero Card (微信读书今日在读) */}
        {currentlyReading && (
          <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl border border-stone-800/90 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
              <div className="flex items-center gap-6">
                {/* Book Spine / Cover Mockup */}
                <div
                  onClick={() => onSelectBook(currentlyReading.id)}
                  className={`w-28 sm:w-32 h-40 sm:h-44 rounded-xl bg-gradient-to-br ${currentlyReading.coverBg} p-3 flex flex-col justify-between shadow-2xl border border-white/10 shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200 relative`}
                >
                  <div className="text-[9px] uppercase tracking-wider text-amber-200/80 font-mono">
                    Standard Ebooks
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-white line-clamp-2 leading-tight">
                      {currentlyReading.title}
                    </h3>
                    <p className="text-[10px] text-stone-300 font-serif italic mt-0.5">
                      {currentlyReading.author}
                    </p>
                  </div>
                  <div className="text-[9px] font-sans text-amber-300/80">
                    {currentlyReading.chineseTitle}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      当前正在阅读
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getCefrBadgeStyle(currentlyReading.cefr)}`}>
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
                      阅读进度：<span className="font-semibold text-white">{currentlyReading.readingProgress}%</span>
                    </div>
                    <div className="w-28 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${currentlyReading.readingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectBook(currentlyReading.id)}
                className="w-full md:w-auto px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:gap-3 shrink-0"
              >
                <span>继续阅读 (Chapter I)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* 3. Search & CEFR Difficulty Filter Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索原著书名、中文名或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>

            {/* CEFR Level Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { label: '全部书库', value: 'ALL' },
                { label: '入门 A2/B1 · 四级', value: 'B1' },
                { label: '进阶 B2 · 六级/雅思', value: 'B2' },
                { label: '高阶 C1 · 考研/GRE', value: 'C1' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setSelectedCefr(pill.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
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

        {/* 4. Books Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">
              精选公版书分级文库 ({filteredBooks.length})
            </h3>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              已内置 77 万词条离线速查
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
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
                    <span className="text-[8px] text-amber-200/60 uppercase font-mono">Classic</span>
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
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${getCefrBadgeStyle(book.cefr)}`}>
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
                      推荐水平：{book.recommendedAudience}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Progress & Enter Button */}
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
      </main>
    </div>
  );
};
