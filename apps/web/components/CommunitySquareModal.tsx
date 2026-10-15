'use client';

/* Hallmark · component: CommunitySquareModal · Archival Literary Salon & Quote Stream
 * features: real-time SSE updates · quote card showcase · likes & discussion · one-click card crafting
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  MessageSquare,
  Copy,
  Check,
  Share2,
  RefreshCw,
  BookOpen,
  Filter,
  Feather,
} from 'lucide-react';
import { AuthUser } from '../lib/auth';

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  bookId?: string | null;
  bookTitle?: string | null;
  author?: string | null;
  quoteText: string;
  chineseTranslation?: string | null;
  thought?: string | null;
  cardImageUrl?: string | null;
  cardLayout?: string | null;
  createdAt: number;
  likesCount: number;
  isLikedByMe?: boolean;
}

interface CommunitySquareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onCraftCardFromQuote?: (quote: string, translation?: string, bookTitle?: string, author?: string) => void;
  onOpenWorkshop?: () => void;
}

export const CommunitySquareModal: React.FC<CommunitySquareModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onCraftCardFromQuote,
  onOpenWorkshop,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'cards'>('all');
  const [isLive, setIsLive] = useState<boolean>(true);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/community/posts?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.warn('[CommunitySquare] Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  // Connect to SSE stream
  useEffect(() => {
    if (!isOpen) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/community/stream');

      eventSource.onopen = () => {
        setIsLive(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'new_post') {
            const incoming: CommunityPost = event.payload;
            setPosts((prev) => {
              if (prev.some((p) => p.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
          } else if (event.type === 'like_post') {
            const { postId, likesCount, userId: likeUserId, isLikedByMe } = event.payload;
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id === postId) {
                  return {
                    ...p,
                    likesCount,
                    isLikedByMe: user?.id === likeUserId ? isLikedByMe : p.isLikedByMe,
                  };
                }
                return p;
              })
            );
          }
        } catch {}
      };

      eventSource.onerror = () => {
        setIsLive(false);
      };
    } catch {
      setIsLive(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Toggle like on a post
  const handleToggleLike = async (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.warn('[Like] Failed to like post:', err);
    }
  };

  // Copy quote text
  const handleCopy = (post: CommunityPost) => {
    const textToCopy = `“${post.quoteText}”\n\n${
      post.chineseTranslation ? `${post.chineseTranslation}\n\n` : ''
    }—— ${post.author || '文学名家'}《${post.bookTitle || '原著典藏'}》\n王尔德 · 精校双语原著共读社区`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 1800);
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

  const filteredPosts = posts.filter((p) => {
    if (filterMode === 'cards') return Boolean(p.cardImageUrl);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-[var(--color-rule)] flex items-center justify-between shrink-0 bg-[var(--color-paper-2)]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold font-book-serif text-[var(--color-ink)]">
                  书友广场 · 金句动态
                </h3>
                {isLive && (
                  <span className="text-[10px] font-meta-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    实时推送中
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                书友共读心得 · 典藏卡片流转 · 思想同频共振
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchPosts();
              }}
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
              title="刷新最新动态"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-4 sm:px-6 py-2.5 bg-[var(--color-paper)] border-b border-[var(--color-rule)] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterMode === 'all'
                  ? 'bg-[var(--color-accent)] text-white shadow-2xs'
                  : 'bg-[var(--color-paper-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              全部动态 ({posts.length})
            </button>
            <button
              onClick={() => setFilterMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterMode === 'cards'
                  ? 'bg-[var(--color-accent)] text-white shadow-2xs'
                  : 'bg-[var(--color-paper-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              唯美画报名画 ({posts.filter((p) => p.cardImageUrl).length})
            </button>
          </div>

          {onOpenWorkshop && (
            <button
              onClick={() => {
                onClose();
                onOpenWorkshop();
              }}
              className="px-3 py-1 rounded-lg border border-[var(--color-accent)]/50 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>制作并发布我的金句</span>
            </button>
          )}
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-ink-muted)] space-y-2">
              <div className="w-7 h-7 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-meta-mono">正在加载书友金句广场...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-ink-muted)] space-y-2">
              <p className="text-sm">暂无匹配的广场动态</p>
              <p className="text-xs font-meta-mono">在阅读时打开金句卡片工坊，点击「发布到书友广场」即可上榜！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-accent)]/40 transition-all p-4.5 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-2xs group"
                >
                  <div className="space-y-3">
                    {/* User & Book Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-2xs"
                          style={{ backgroundColor: post.avatarColor }}
                        >
                          {post.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[var(--color-ink)] text-xs block leading-tight">
                            {post.username}
                          </span>
                          <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono">
                            {formatTime(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      {post.bookTitle && (
                        <span className="text-[10px] font-meta-mono text-[var(--color-accent)] bg-[var(--color-paper)] px-2 py-0.5 rounded-md border border-[var(--color-rule)] truncate max-w-[150px]">
                          《{post.bookTitle}》
                        </span>
                      )}
                    </div>

                    {/* Image Preview (if provided) */}
                    {post.cardImageUrl && (
                      <div className="rounded-xl overflow-hidden border border-[var(--color-rule)] bg-black/10 max-h-56 relative group/img">
                        <img
                          src={post.cardImageUrl}
                          alt="Quote card preview"
                          className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Quote & Translation Body */}
                    <div className="space-y-1.5 border-l-2 border-[var(--color-accent)] pl-3">
                      <p className="font-book-serif italic text-sm text-[var(--color-ink)] leading-relaxed select-text">
                        “{post.quoteText}”
                      </p>
                      {post.chineseTranslation && (
                        <p className="text-xs text-[var(--color-ink-2)] font-medium leading-relaxed select-text">
                          {post.chineseTranslation}
                        </p>
                      )}
                    </div>

                    {/* Personal Reflection Thought */}
                    {post.thought && (
                      <div className="p-2.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)]/70 text-xs text-[var(--color-ink-2)] leading-relaxed font-book-sans">
                        <span className="text-[var(--color-accent)] font-semibold mr-1">✦ 心得:</span>
                        {post.thought}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2.5 border-t border-[var(--color-rule)]/60 flex items-center justify-between text-xs font-meta-mono">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          post.isLikedByMe
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                            : 'text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-[var(--color-paper-3)]'
                        }`}
                        title="点赞金句"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            post.isLikedByMe ? 'fill-rose-500' : ''
                          }`}
                        />
                        <span>{post.likesCount > 0 ? post.likesCount : '赞'}</span>
                      </button>

                      {/* Copy Text */}
                      <button
                        onClick={() => handleCopy(post)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                        title="复制双语文案"
                      >
                        {copiedPostId === post.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Craft identical quote card */}
                    {onCraftCardFromQuote && (
                      <button
                        onClick={() => {
                          onClose();
                          onCraftCardFromQuote(
                            post.quoteText,
                            post.chineseTranslation || undefined,
                            post.bookTitle || undefined,
                            post.author || undefined
                          );
                        }}
                        className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline cursor-pointer text-xs"
                        title="以该金句开启工坊排版定制"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>做同款卡</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
