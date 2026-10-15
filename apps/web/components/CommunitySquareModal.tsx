'use client';

/* Hallmark · component: CommunitySquareModal · Literary Salon, Live Chat & Community Discussions
 * features:
 * 1. 实时书友茶室 (Live Salon Chat) - real-time SSE stream, instant messaging, reading context badge, quick topic tags
 * 2. 动态与深度讨论 (Community Posts & Comments) - post discussion topics, quote cards, like, threaded replies/comments
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Heart,
  MessageSquare,
  Copy,
  Check,
  Send,
  RefreshCw,
  BookOpen,
  Filter,
  Feather,
  Users,
  Compass,
  CornerDownRight,
  Smile,
  Hash,
  PlusCircle,
  ChevronDown,
  ChevronUp,
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
  commentsCount?: number;
  isLikedByMe?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  content: string;
  readingContext?: string | null;
  createdAt: number;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatarColor: string;
  content: string;
  replyToUsername?: string | null;
  createdAt: number;
}

interface CommunitySquareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  currentBookTitle?: string;
  onCraftCardFromQuote?: (quote: string, translation?: string, bookTitle?: string, author?: string) => void;
  onOpenWorkshop?: () => void;
}

const QUICK_TOPICS = [
  '#共读打卡',
  '#向书友求教',
  '#翻译探讨',
  '#读后感',
  '#名家金句',
];

export const CommunitySquareModal: React.FC<CommunitySquareModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  currentBookTitle = '典藏名著',
  onCraftCardFromQuote,
  onOpenWorkshop,
}) => {
  // Active Tab: 'chat' (实时茶室) vs 'posts' (动态与讨论)
  const [activeTab, setActiveTab] = useState<'chat' | 'posts'>('chat');

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Posts & Discussion State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'cards'>('all');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Create New Topic in Square
  const [isCreatingTopic, setIsCreatingTopic] = useState<boolean>(false);
  const [newTopicThought, setNewTopicThought] = useState<string>('');
  const [newTopicQuote, setNewTopicQuote] = useState<string>('');
  const [isSubmittingTopic, setIsSubmittingTopic] = useState<boolean>(false);

  // Threaded Comments on Posts
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [replyToUser, setReplyToUser] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Connection & Activity
  const [isLive, setIsLive] = useState<boolean>(true);

  // Scroll to bottom of chat
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Fetch initial chat messages
  const fetchChatMessages = async () => {
    try {
      const res = await fetch('/api/community/chat?limit=60');
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
        setTimeout(() => scrollToBottom('auto'), 80);
      }
    } catch (e) {
      console.warn('[Chat] Failed to load messages:', e);
    }
  };

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const res = await fetch('/api/community/posts?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.warn('[CommunitySquare] Failed to fetch posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch comments for a specific post
  const fetchCommentsForPost = async (postId: string) => {
    try {
      setLoadingCommentsPostId(postId);
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: data.comments || [],
        }));
      }
    } catch (e) {
      console.warn('[Comments] Failed to load comments:', e);
    } finally {
      setLoadingCommentsPostId(null);
    }
  };

  // Initialize data on open
  useEffect(() => {
    if (isOpen) {
      fetchChatMessages();
      fetchPosts();
    }
  }, [isOpen]);

  // Connect to SSE stream for live updates
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
          if (event.type === 'chat_message') {
            const incoming: ChatMessage = event.payload;
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
            setTimeout(() => scrollToBottom('smooth'), 60);
          } else if (event.type === 'new_post') {
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
          } else if (event.type === 'new_comment') {
            const incoming: PostComment = event.payload;
            setCommentsByPost((prev) => {
              const current = prev[incoming.postId] || [];
              if (current.some((c) => c.id === incoming.id)) return prev;
              return {
                ...prev,
                [incoming.postId]: [...current, incoming],
              };
            });
            // Update commentsCount on post
            setPosts((prev) =>
              prev.map((p) =>
                p.id === incoming.postId
                  ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
                  : p
              )
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

  // Send a chat message
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = chatInput.trim();
    if (!text || isSendingChat) return;

    setIsSendingChat(true);
    try {
      const res = await fetch('/api/community/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          readingContext: `正在读《${currentBookTitle}》`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          setChatInput('');
          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      }
    } catch (err) {
      console.warn('[Chat] Send error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Submit a new discussion topic to the square
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    const thought = newTopicThought.trim();
    if (!thought) return;

    setIsSubmittingTopic(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thought,
          quoteText: newTopicQuote.trim() || thought,
          bookTitle: currentBookTitle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) => [data.post, ...prev]);
          setNewTopicThought('');
          setNewTopicQuote('');
          setIsCreatingTopic(false);
        }
      }
    } catch (err) {
      console.warn('[Topic] Post error:', err);
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // Toggle comments expand
  const handleToggleComments = (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      setCommentInput('');
      setReplyToUser(null);
    } else {
      setExpandedCommentsPostId(postId);
      setCommentInput('');
      setReplyToUser(null);
      if (!commentsByPost[postId]) {
        fetchCommentsForPost(postId);
      }
    }
  };

  // Submit a comment on a post
  const handleSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = commentInput.trim();
    if (!text || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          replyToUsername: replyToUser,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), data.comment],
          }));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
            )
          );
          setCommentInput('');
          setReplyToUser(null);
        }
      }
    } catch (err) {
      console.warn('[Comment] Submit error:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

      {/* Main Modal Window */}
      <div
        className="relative z-10 w-full max-w-4xl h-[92vh] max-h-[860px] bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header with Dual Tabs */}
        <div className="px-4 sm:px-6 py-3 border-b border-[var(--color-rule)] flex items-center justify-between shrink-0 bg-[var(--color-paper-2)]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold font-book-serif text-[var(--color-ink)]">
                  书友交流广场
                </h3>
                {isLive && (
                  <span className="text-[10px] font-meta-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    实时在线
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                书友共读聊天室 · 思想碰撞与研读沙龙
              </p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--color-paper-3)]/80 rounded-xl border border-[var(--color-rule)]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-book-serif flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[var(--color-paper)] text-[var(--color-accent)] shadow-xs font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>实时茶室</span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-book-serif flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-[var(--color-paper)] text-[var(--color-accent)] shadow-xs font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>动态与讨论</span>
              {posts.length > 0 && (
                <span className="text-[10px] font-meta-mono px-1.5 py-0.2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  {posts.length}
                </span>
              )}
            </button>
          </div>

          {/* Close button */}
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. TAB 1: 实时书友茶室 (Live Salon Chat) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-paper)]">
            {/* Quick Topic Prompts Bar */}
            <div className="px-4 py-2 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono shrink-0 flex items-center gap-1">
                <Hash className="w-3 h-3 text-[var(--color-accent)]" />
                话题快捷键:
              </span>
              {QUICK_TOPICS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setChatInput((prev) => (prev ? `${tag} ${prev}` : `${tag} `));
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-book-serif bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
            >
              {chatMessages.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mx-auto mb-3">
                    <Feather className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold font-book-serif text-[var(--color-ink)]">
                    书友茶室虚位以待
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1 font-book-serif">
                    大家都在这里交流读书感悟，快来发第一句问候吧～
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = user?.id === msg.userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ring-2 ring-[var(--color-paper)]"
                        style={{ backgroundColor: msg.avatarColor || '#b45309' }}
                      >
                        {msg.username.slice(0, 1).toUpperCase()}
                      </div>

                      {/* Content Bubble */}
                      <div className={`space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2 text-[11px] font-meta-mono text-[var(--color-ink-muted)]">
                          <span className="font-medium text-[var(--color-ink)]">
                            {msg.username}
                          </span>
                          {msg.readingContext && (
                            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-paper-3)] text-[var(--color-ink-muted)] border border-[var(--color-rule)]">
                              📖 {msg.readingContext}
                            </span>
                          )}
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-sm font-book-serif leading-relaxed shadow-xs inline-block break-words max-w-full select-text text-left ${
                            isMe
                              ? 'bg-[var(--color-accent)] text-white rounded-tr-xs'
                              : 'bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded-tl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]/60">
              {user ? (
                <form
                  onSubmit={handleSendChatMessage}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`以「${user.username}」的身份参与书友交流... (按 Enter 发送)`}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-[var(--color-paper)] border border-[var(--color-rule)] focus:border-[var(--color-accent)] focus:outline-hidden text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] font-book-serif transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSendingChat}
                    className="px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold font-book-serif hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>发送</span>
                  </button>
                </form>
              ) : (
                <div
                  onClick={onOpenAuth}
                  className="p-3 rounded-xl bg-[var(--color-paper)] border border-dashed border-[var(--color-rule)] flex items-center justify-between cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all text-xs font-book-serif text-[var(--color-ink-muted)]"
                >
                  <span className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-[var(--color-accent)]" />
                    登录账号即可与全站书友实时打字互动、探讨名著名句～
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium">
                    立即登录
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TAB 2: 动态与深度讨论 (Community Posts & Comments) */}
        {activeTab === 'posts' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-paper)]">
            {/* Toolbar: Post Topic Button + Filter */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreatingTopic((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium font-book-serif hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>发起话题讨论</span>
                </button>
                {onOpenWorkshop && (
                  <button
                    onClick={onOpenWorkshop}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-xs font-medium font-book-serif transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>制作金句卡分享</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-xs border border-[var(--color-rule)] rounded-lg overflow-hidden bg-[var(--color-paper)]">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 transition-colors cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
                        : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    全部讨论
                  </button>
                  <button
                    onClick={() => setFilterMode('cards')}
                    className={`px-2.5 py-1 transition-colors cursor-pointer ${
                      filterMode === 'cards'
                        ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] font-semibold'
                        : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    金句卡片
                  </button>
                </div>
                <button
                  onClick={fetchPosts}
                  className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                  title="刷新动态"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Create Topic Collapsible Box */}
            {isCreatingTopic && (
              <form
                onSubmit={handleCreateTopic}
                className="p-4 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/70 animate-in slide-in-from-top-2 duration-150 space-y-3 shrink-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-book-serif text-[var(--color-ink)] flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    发表读书讨论或提问
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingTopic(false)}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newTopicThought}
                  onChange={(e) => setNewTopicThought(e.target.value)}
                  placeholder="写下你对本书的见解、疑问或想和书友讨论的话题..."
                  className="w-full p-3 rounded-xl text-xs bg-[var(--color-paper)] border border-[var(--color-rule)] focus:border-[var(--color-accent)] focus:outline-hidden text-[var(--color-ink)] font-book-serif resize-none"
                />
                <input
                  type="text"
                  value={newTopicQuote}
                  onChange={(e) => setNewTopicQuote(e.target.value)}
                  placeholder="可选：附带原著引句（如：“We are all in the gutter...”）"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--color-paper)] border border-[var(--color-rule)] focus:border-[var(--color-accent)] focus:outline-hidden text-[var(--color-ink)] font-book-serif"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                    将关联出处：《{currentBookTitle}》
                  </span>
                  <button
                    type="submit"
                    disabled={!newTopicThought.trim() || isSubmittingTopic}
                    className="px-4 py-1.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium font-book-serif disabled:opacity-40 cursor-pointer"
                  >
                    {isSubmittingTopic ? '发布中...' : '发布话题'}
                  </button>
                </div>
              </form>
            )}

            {/* Posts Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="py-20 text-center">
                  <BookOpen className="w-10 h-10 mx-auto text-[var(--color-ink-muted)]/40 mb-2" />
                  <p className="text-sm font-book-serif text-[var(--color-ink-muted)]">
                    暂无动态，点击上方按钮发起第一条讨论吧
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isCommentsExpanded = expandedCommentsPostId === post.id;
                  const comments = commentsByPost[post.id] || [];
                  const isLoadingThisComments = loadingCommentsPostId === post.id;

                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] shadow-xs hover:border-[var(--color-rule-subtle)] transition-all space-y-3"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                            style={{ backgroundColor: post.avatarColor || '#b45309' }}
                          >
                            {post.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold font-book-serif text-[var(--color-ink)]">
                              {post.username}
                            </div>
                            <div className="text-[10px] font-meta-mono text-[var(--color-ink-muted)]">
                              {formatTime(post.createdAt)}
                              {post.bookTitle && ` · 《${post.bookTitle}》`}
                            </div>
                          </div>
                        </div>

                        {/* Top-right card badge */}
                        {post.cardImageUrl && (
                          <span className="text-[10px] font-meta-mono px-2 py-0.5 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                            典藏卡片
                          </span>
                        )}
                      </div>

                      {/* Quote Content (if provided) */}
                      {post.quoteText && post.quoteText !== post.thought && (
                        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-rule)]/80 space-y-1.5">
                          <p className="text-xs sm:text-sm font-book-serif italic text-[var(--color-ink)] leading-relaxed select-text">
                            “{post.quoteText}”
                          </p>
                          {post.chineseTranslation && (
                            <p className="text-xs font-book-serif text-[var(--color-ink-muted)] select-text">
                              {post.chineseTranslation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Card Preview Image if exists */}
                      {post.cardImageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-[var(--color-rule)] max-h-60 bg-[var(--color-paper)] flex items-center justify-center">
                          <img
                            src={post.cardImageUrl}
                            alt="Quote Card"
                            className="max-h-60 w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Thought / Discussion Content */}
                      {post.thought && (
                        <div className="text-xs sm:text-sm font-book-serif text-[var(--color-ink)] leading-relaxed select-text whitespace-pre-wrap">
                          {post.thought}
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="pt-2 border-t border-[var(--color-rule)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {/* Like Button */}
                          <button
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              post.isLikedByMe
                                ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
                                : 'text-[var(--color-ink-muted)] hover:text-red-500 hover:bg-[var(--color-paper-3)]'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                post.isLikedByMe ? 'fill-current' : ''
                              }`}
                            />
                            <span className="font-meta-mono text-xs">{post.likesCount}</span>
                          </button>

                          {/* Comments Button (Thread Toggle) */}
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              isCommentsExpanded
                                ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10 font-medium'
                                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-meta-mono text-xs">
                              {post.commentsCount || 0} 条讨论
                            </span>
                            {isCommentsExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy quote text */}
                          {post.quoteText && (
                            <button
                              onClick={() => handleCopy(post)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer text-xs"
                              title="复制双语名句"
                            >
                              {copiedPostId === post.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">已复制</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>复制名句</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Craft card */}
                          {onCraftCardFromQuote && post.quoteText && (
                            <button
                              onClick={() => {
                                onCraftCardFromQuote(
                                  post.quoteText,
                                  post.chineseTranslation || undefined,
                                  post.bookTitle || undefined,
                                  post.author || undefined
                                );
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors cursor-pointer text-xs font-book-serif"
                            >
                              <Feather className="w-3.5 h-3.5" />
                              <span>做同款卡</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 4. Threaded Comments Section */}
                      {isCommentsExpanded && (
                        <div className="pt-3 border-t border-[var(--color-rule)] space-y-3 animate-in fade-in duration-150">
                          {isLoadingThisComments ? (
                            <div className="py-4 text-center text-xs text-[var(--color-ink-muted)] font-book-serif">
                              加载讨论中...
                            </div>
                          ) : comments.length === 0 ? (
                            <div className="py-3 text-center text-xs text-[var(--color-ink-muted)] font-book-serif">
                              还没有书友评论，快来抢沙发发表你的见解吧～
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-rule)]/60 text-xs font-book-serif space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                        style={{ backgroundColor: comment.avatarColor || '#b45309' }}
                                      >
                                        {comment.username.slice(0, 1).toUpperCase()}
                                      </div>
                                      <span className="font-semibold text-[var(--color-ink)]">
                                        {comment.username}
                                      </span>
                                      {comment.replyToUsername && (
                                        <span className="text-[var(--color-ink-muted)] text-[11px]">
                                          回复 @{comment.replyToUsername}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-meta-mono text-[var(--color-ink-muted)]">
                                        {formatTime(comment.createdAt)}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setReplyToUser(comment.username);
                                          setCommentInput(`@${comment.username} `);
                                        }}
                                        className="text-[10px] text-[var(--color-accent)] hover:underline cursor-pointer"
                                      >
                                        回复
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[var(--color-ink)] leading-relaxed select-text pl-6.5">
                                    {comment.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Write Comment Form */}
                          <form
                            onSubmit={(e) => handleSubmitComment(post.id, e)}
                            className="flex items-center gap-2 pt-2"
                          >
                            <input
                              type="text"
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder={
                                replyToUser
                                  ? `回复 @${replyToUser}...`
                                  : '参与讨论，写下你的见解...'
                              }
                              className="flex-1 px-3 py-2 rounded-xl text-xs bg-[var(--color-paper)] border border-[var(--color-rule)] focus:border-[var(--color-accent)] focus:outline-hidden text-[var(--color-ink)] font-book-serif"
                            />
                            {replyToUser && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyToUser(null);
                                  setCommentInput('');
                                }}
                                className="text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] px-1"
                              >
                                取消
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={!commentInput.trim() || isSubmittingComment}
                              className="px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold font-book-serif disabled:opacity-40 cursor-pointer shadow-xs"
                            >
                              发送
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
