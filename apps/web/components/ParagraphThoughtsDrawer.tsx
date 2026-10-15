'use client';

/* Hallmark · component: ParagraphThoughtsDrawer · Archival Reader Annotations & Thoughts
 * features: real-time thoughts stream · sentence breakdown · interactive likes · instant submission
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Heart,
  Send,
  Sparkles,
  BookOpen,
  Check,
  Radio,
  Feather,
} from 'lucide-react';
import { AuthUser } from '../lib/auth';

export interface CommunityThought {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  bookId: string;
  chapterIndex: number;
  sentenceId?: string | null;
  quoteText: string;
  chineseTranslation?: string | null;
  content: string;
  createdAt: number;
  likesCount: number;
  isLikedByMe?: boolean;
}

interface ParagraphThoughtsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle?: string;
  chapterIndex: number;
  chapterTitle?: string;
  sentenceId?: string | null;
  quoteText: string;
  chineseTranslation?: string;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onGenerateCard?: (quote: string, translation?: string) => void;
}

export const ParagraphThoughtsDrawer: React.FC<ParagraphThoughtsDrawerProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle = '传世典藏',
  chapterIndex,
  chapterTitle = '本章',
  sentenceId,
  quoteText,
  chineseTranslation,
  user,
  onOpenAuth,
  onGenerateCard,
}) => {
  const [thoughts, setThoughts] = useState<CommunityThought[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newContent, setNewContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const thoughtsEndRef = useRef<HTMLDivElement>(null);

  // Fetch thoughts for this chapter/sentence
  const fetchThoughts = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/community/thoughts', window.location.origin);
      url.searchParams.set('bookId', bookId);
      url.searchParams.set('chapterIndex', String(chapterIndex));
      if (sentenceId) {
        url.searchParams.set('sentenceId', sentenceId);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setThoughts(data.thoughts || []);
      }
    } catch (err) {
      console.warn('[ThoughtsDrawer] Failed to fetch thoughts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchThoughts();
    }
  }, [isOpen, bookId, chapterIndex, sentenceId]);

  // Connect to SSE stream for real-time thoughts & likes
  useEffect(() => {
    if (!isOpen) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/community/stream');

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'new_thought') {
            const incoming: CommunityThought = event.payload;
            // Only append if it belongs to this book and chapter
            if (incoming.bookId === bookId && incoming.chapterIndex === chapterIndex) {
              if (!sentenceId || incoming.sentenceId === sentenceId) {
                setThoughts((prev) => {
                  if (prev.some((t) => t.id === incoming.id)) return prev;
                  return [...prev, incoming];
                });
              }
            }
          } else if (event.type === 'like_thought') {
            const { thoughtId, likesCount, userId: likeUserId, isLikedByMe } = event.payload;
            setThoughts((prev) =>
              prev.map((t) => {
                if (t.id === thoughtId) {
                  return {
                    ...t,
                    likesCount,
                    isLikedByMe: user?.id === likeUserId ? isLikedByMe : t.isLikedByMe,
                  };
                }
                return t;
              })
            );
          }
        } catch {}
      };

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, bookId, chapterIndex, sentenceId, user]);

  // Scroll to bottom when thoughts change
  useEffect(() => {
    if (thoughts.length > 0) {
      thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thoughts.length]);

  if (!isOpen) return null;

  // Toggle Like on thought
  const handleToggleLike = async (thoughtId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    // Optimistic UI update
    setThoughts((prev) =>
      prev.map((t) => {
        if (t.id === thoughtId) {
          const nextLiked = !t.isLikedByMe;
          return {
            ...t,
            isLikedByMe: nextLiked,
            likesCount: nextLiked ? t.likesCount + 1 : Math.max(0, t.likesCount - 1),
          };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/community/thoughts/${thoughtId}/like`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('[Like] Failed to like thought:', err);
    }
  };

  // Submit new thought
  const handleSubmitThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    const trimmed = newContent.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/community/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapterIndex,
          sentenceId: sentenceId || null,
          quoteText,
          chineseTranslation,
          content: trimmed,
        }),
      });

      if (res.ok) {
        setNewContent('');
        const data = await res.json();
        if (data.thought) {
          setThoughts((prev) => {
            if (prev.some((t) => t.id === data.thought.id)) return prev;
            return [...prev, data.thought];
          });
        }
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || '发表失败，请重试');
      }
    } catch {
      setSubmitError('网络连接异常，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return '刚刚';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className="relative z-10 w-full max-w-lg bg-[var(--color-paper-elevated)] border-l border-[var(--color-rule)] shadow-2xl flex flex-col h-full text-[var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--color-rule)] flex items-center justify-between shrink-0 bg-[var(--color-paper-2)]/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold font-book-serif text-[var(--color-ink)]">
                  读友共读想法
                </h3>
                <span className="text-[10px] font-meta-mono px-1.5 py-0.2 rounded-full border border-[var(--color-rule)] text-[var(--color-ink-muted)]">
                  {thoughts.length} 条
                </span>
                {isLiveConnected && (
                  <span className="text-[9px] font-meta-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    实时连线
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono truncate max-w-[260px]">
                《{bookTitle}》 · {chapterTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Quote Banner */}
        <div className="p-4 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="border-l-2 border-[var(--color-accent)] pl-2.5 space-y-1">
              <p className="font-book-serif italic text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed select-text">
                “{quoteText}”
              </p>
              {chineseTranslation && (
                <p className="text-xs text-[var(--color-ink-2)] font-medium leading-relaxed select-text">
                  {chineseTranslation}
                </p>
              )}
            </div>

            {onGenerateCard && (
              <button
                type="button"
                onClick={() => onGenerateCard(quoteText, chineseTranslation)}
                className="shrink-0 p-1.5 rounded-lg text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 transition-all cursor-pointer font-medium flex items-center gap-1 shadow-2xs"
                title="将该句段排版制成金句卡片"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-meta-mono hidden sm:inline">做金句卡</span>
              </button>
            )}
          </div>
        </div>

        {/* Thoughts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--color-ink-muted)] space-y-2">
              <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-meta-mono">正在加载读友真知灼见...</p>
            </div>
          ) : thoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--color-ink-muted)] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-accent)]">
                <Feather className="w-5 h-5 opacity-80" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-ink)]">
                  这处段落暂无读友想法
                </p>
                <p className="text-[11px] font-meta-mono max-w-[240px]">
                  写下你对这句英文的词汇巧思、文学隐喻或独到对译吧！
                </p>
              </div>
            </div>
          ) : (
            thoughts.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]/70 hover:bg-[var(--color-paper-2)] transition-all space-y-2.5 shadow-2xs group"
              >
                {/* User Head */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-2xs"
                      style={{ backgroundColor: item.avatarColor }}
                    >
                      {item.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-medium text-[var(--color-ink)] text-xs">
                      {item.username}
                    </span>
                    {user?.id === item.userId && (
                      <span className="text-[9px] font-meta-mono text-[var(--color-accent)] px-1 rounded border border-[var(--color-accent)]/30">
                        我
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono">
                    {formatTime(item.createdAt)}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed select-text whitespace-pre-wrap font-book-sans">
                  {item.content}
                </p>

                {/* Action Row */}
                <div className="pt-2 border-t border-[var(--color-rule)]/60 flex items-center justify-end text-xs">
                  <button
                    onClick={() => handleToggleLike(item.id)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-meta-mono transition-colors cursor-pointer ${
                      item.isLikedByMe
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                        : 'text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-[var(--color-paper-3)]'
                    }`}
                    title={item.isLikedByMe ? '取消赞' : '点赞该读友想法'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        item.isLikedByMe ? 'fill-rose-500' : ''
                      }`}
                    />
                    <span>{item.likesCount > 0 ? item.likesCount : '赞'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
          <div ref={thoughtsEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--color-rule)] bg-[var(--color-paper)] shrink-0">
          {submitError && (
            <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmitThought} className="space-y-2">
            <div className="relative">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={
                  user
                    ? '写下你对本句的文学理解、时代隐喻或词汇感悟...'
                    : '登录后即可发表读友想法，与共读者思想碰撞...'
                }
                rows={2}
                maxLength={800}
                className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] resize-none focus:outline-hidden focus:border-[var(--color-accent)] focus:bg-[var(--color-paper-elevated)] transition-colors"
                onFocus={() => {
                  if (!user) {
                    onOpenAuth();
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-meta-mono">
              <span className="text-[var(--color-ink-muted)]">
                {newContent.length > 0 ? `${newContent.length}/800 字` : '支持全网书友实时共赏'}
              </span>

              <div className="flex items-center gap-2">
                {!user ? (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white font-medium cursor-pointer transition-all shadow-2xs"
                  >
                    登录后发表
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !newContent.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 active:scale-95 disabled:opacity-40 text-white font-medium cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmitting ? '发送中...' : '发表想法'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
