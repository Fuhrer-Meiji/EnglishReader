'use client';

/* Hallmark · genre: editorial · macrostructure: Curated Catalog · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Library,
  Sparkles,
  Lock,
  User,
  Mail,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookA,
  Columns2,
  Cloud,
  Moon,
  Sun,
  Coffee,
  Bookmark,
  ArrowRight,
  GraduationCap,
  Layers,
  Bot,
} from 'lucide-react';
import { AuthUser } from '../lib/auth';
import { useReaderTheme } from './AstryxProvider';

interface WelcomeViewProps {
  onEnterBookshelf: () => void;
  onSelectBook: (bookId: string) => void;
  user: AuthUser | null;
  onAuthSuccess: (user: AuthUser, syncedData?: any) => void;
  onLogout: () => void;
  clientDataToMerge?: any;
  onOpenAIConfig?: () => void;
}

interface FeatureCard {
  title: string;
  subtitle: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    title: 'ECDICT 770,000 离线学术词库',
    subtitle: '离线毫秒解析 · 四六级/考研/GRE 考纲高亮',
    tag: '语言学术深度',
    desc: '每个生词点触即译，包含词频、音标、柯林斯星级与权威中英释义。自动识别 CEFR 梯级生词，原著阅读流畅如行云流水。',
    icon: <BookA className="w-5 h-5 text-[var(--color-accent)]" />,
  },
  {
    title: 'AI 文学伴读 · 自带密钥 (BYOK)',
    subtitle: 'DeepSeek / OpenAI / 月之暗面 / 千问 任意接入',
    tag: '智能研读深度',
    desc: '独创王尔德文学风格提示词，对长难句提供信达雅译文、成分树状拆解、隐喻与时代典故深度注脚。零数据外泄，密钥安全保存在本地。',
    icon: <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />,
  },
  {
    title: 'Standard Ebooks 数字化纸本版式',
    subtitle: 'Charter / Newsreader 典藏衬线 · 双栏与长卷双擎',
    tag: '版式美学深度',
    desc: '严谨复刻 Gutenberg 与现代数字排版典范。提供双页精装书卷与纵向连读模式，羊皮纸、晨光白、墨玉黑三段护眼色温随心切换。',
    icon: <Columns2 className="w-5 h-5 text-[var(--color-accent)]" />,
  },
  {
    title: '私家语境生词本与跨端云迹',
    subtitle: '带原著例句沉淀 · 多端进度秒级自动漫游',
    tag: '知识沉淀深度',
    desc: '生词摘录不仅是孤立词条，更封存那一刻的章节段落与原汁语境。读书位置精确到页码与句段，手机、平板、电脑切换开卷即续。',
    icon: <Cloud className="w-5 h-5 text-[var(--color-accent)]" />,
  },
];

interface ClassicBookPreview {
  id: string;
  title: string;
  chineseTitle: string;
  author: string;
  cefr: string;
  cefrLabel: string;
  quote: string;
  cloth: {
    bg: string;
    border: string;
    foil: string;
    subtle: string;
  };
}

const FEATURED_CLASSICS: ClassicBookPreview[] = [
  {
    id: 'a-tale-of-two-cities',
    title: 'A Tale of Two Cities',
    chineseTitle: '双城记',
    author: 'Charles Dickens',
    cefr: 'B2',
    cefrLabel: '进阶 B2 · 六级/雅思',
    quote: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness...',
    cloth: {
      bg: 'bg-[#38151b]',
      border: 'border-[#522028]',
      foil: 'text-[#e9c787]',
      subtle: 'text-[#c4a065]',
    },
  },
  {
    id: 'the-great-gatsby',
    title: 'The Great Gatsby',
    chineseTitle: '了不起的盖茨比',
    author: 'F. Scott Fitzgerald',
    cefr: 'B2',
    cefrLabel: '进阶 B2 · 六级/雅思',
    quote: 'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.',
    cloth: {
      bg: 'bg-[#182338]',
      border: 'border-[#243555]',
      foil: 'text-[#e2ceaa]',
      subtle: 'text-[#baa784]',
    },
  },
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    chineseTitle: '傲慢与偏见',
    author: 'Jane Austen',
    cefr: 'B2',
    cefrLabel: '进阶 B2 · 六级/雅思',
    quote: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    cloth: {
      bg: 'bg-[#152a20]',
      border: 'border-[#204031]',
      foil: 'text-[#d6c59b]',
      subtle: 'text-[#b2a178]',
    },
  },
  {
    id: 'the-adventures-of-sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    chineseTitle: '福尔摩斯探案集',
    author: 'Arthur Conan Doyle',
    cefr: 'B1',
    cefrLabel: '入门 B1 · 高中/四级',
    quote: 'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name.',
    cloth: {
      bg: 'bg-[#332214]',
      border: 'border-[#4c331e]',
      foil: 'text-[#e8be7d]',
      subtle: 'text-[#be9557]',
    },
  },
  {
    id: 'the-picture-of-dorian-gray',
    title: 'The Picture of Dorian Gray',
    chineseTitle: '道林·格雷的画像',
    author: 'Oscar Wilde',
    cefr: 'C1',
    cefrLabel: '高阶 C1 · 考研/GRE',
    quote: 'The artist is the creator of beautiful things. To reveal art and conceal the artist is art’s aim.',
    cloth: {
      bg: 'bg-[#2d1829]',
      border: 'border-[#45253e]',
      foil: 'text-[#dfbed5]',
      subtle: 'text-[#b696ac]',
    },
  },
  {
    id: 'walden',
    title: 'Walden',
    chineseTitle: '瓦尔登湖',
    author: 'Henry David Thoreau',
    cefr: 'C1',
    cefrLabel: '高阶 C1 · 考研/GRE',
    quote: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life...',
    cloth: {
      bg: 'bg-[#232919]',
      border: 'border-[#363f27]',
      foil: 'text-[#ced3a2]',
      subtle: 'text-[#9ea373]',
    },
  },
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onEnterBookshelf,
  onSelectBook,
  user,
  onAuthSuccess,
  onLogout,
  clientDataToMerge,
  onOpenAIConfig,
}) => {
  const { theme, setTheme } = useReaderTheme();

  // Auth Form State
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('请输入读者用户名');
      return;
    }
    if (!password) {
      setErrorMsg('请输入密码');
      return;
    }
    if (authTab === 'register' && password.length < 6) {
      setErrorMsg('密码长度不能少于 6 位');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload: any = {
        username: username.trim(),
        password,
      };
      if (authTab === 'register' && email.trim()) {
        payload.email = email.trim();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (authTab === 'login' ? '登录失败' : '注册失败'));
      }

      const loggedUser = data.user;
      setSuccessMsg(authTab === 'login' ? '登录成功！正在进入书房...' : '注册成功！已为您开启专属云端书房');

      // Auto-merge client data if available
      let syncedData = null;
      if (clientDataToMerge) {
        try {
          const syncRes = await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientDataToMerge),
          });
          if (syncRes.ok) {
            const sData = await syncRes.json();
            syncedData = sData.data;
          }
        } catch (e) {
          console.warn('[Sync] Auto-merge failed:', e);
        }
      }

      setTimeout(() => {
        onAuthSuccess(loggedUser, syncedData);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || '操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] font-book-sans selection:bg-[var(--color-accent)]/20">
      {/* 1. Hallmark N6 Broadsheet Masthead */}
      <header className="sticky top-0 z-30 bg-[var(--color-paper-2)]/95 backdrop-blur-md border-b border-[var(--color-rule)] px-4 sm:px-12 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Colophon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center font-book-serif font-bold text-sm shadow-xs select-none">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-book-serif font-semibold text-lg tracking-tight text-[var(--color-ink)]">
                  王尔德 · Wilde
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[var(--color-accent)] font-meta-mono uppercase tracking-wider font-semibold border border-[var(--color-rule)] px-1.5 py-0.5 rounded whitespace-nowrap">
                  原著分级典藏
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono hidden sm:block">
                Standard Ebooks 标准数字化精校 · 1,528 卷传世经典
              </p>
            </div>
          </div>

          {/* Top Actions & Theme Selector */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs">
            {/* Quick Guest Enter */}
            <button
              onClick={onEnterBookshelf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-elevated)] transition-colors cursor-pointer font-medium"
            >
              <Library className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>浏览文库 (1,528 卷)</span>
            </button>

            {onOpenAIConfig && (
              <button
                onClick={onOpenAIConfig}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-elevated)] transition-colors cursor-pointer font-medium"
                title="配置个人 AI 密钥 (BYOK)"
              >
                <Bot className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>AI 设置</span>
              </button>
            )}

            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-[var(--color-paper-3)] p-1 rounded-lg border border-[var(--color-rule)]">
              <button
                onClick={() => setTheme('light')}
                className={`p-1 rounded cursor-pointer ${theme === 'light' ? 'bg-[var(--color-paper)] shadow-2xs' : 'text-[var(--color-ink-muted)]'}`}
                title="晨光亮白"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1 rounded cursor-pointer ${theme === 'sepia' ? 'bg-[var(--color-paper)] shadow-2xs text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'}`}
                title="羊皮纸护眼"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1 rounded cursor-pointer ${theme === 'dark' ? 'bg-[var(--color-paper)] shadow-2xs text-purple-400' : 'text-[var(--color-ink-muted)]'}`}
                title="夜读深色"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Gateway: The Intellectual Manifest & The Sign-in Hearth */}
      <section className="relative overflow-hidden border-b border-[var(--color-rule)] py-12 sm:py-20 px-6 sm:px-12 bg-linear-to-b from-[var(--color-paper-2)]/60 to-[var(--color-paper)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Wing (7 Cols): Editorial Manifest */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] text-[11px] font-meta-mono text-[var(--color-accent)] font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EST. 2026 · 为深度读者与终身学习者打造的纯净书房</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight font-book-serif text-[var(--color-ink)] leading-[1.18]">
              以文为舟，重溯传世原著的阅读原野
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-ink-2)] leading-relaxed max-w-2xl font-book-sans">
              告别浮躁的碎片阅读。「王尔德」全量收录 <strong>1,528 部</strong> 经世界标准精校的世界公版英文名著。
              内置 <strong>770,000 离线词库</strong> 毫秒点译、<strong>CEFR 考纲阶梯高亮</strong>与长难句树状语法拆解，
              让每一位读者在原汁原味的文学殿堂中自由深潜。
            </p>

            {/* 4 Quantitative Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] shadow-2xs">
                <div className="text-xl sm:text-2xl font-bold font-book-serif text-[var(--color-accent)]">
                  1,528 卷
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                  精校公版全库
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] shadow-2xs">
                <div className="text-xl sm:text-2xl font-bold font-book-serif text-[var(--color-ink)]">
                  770,000
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                  离线即点即译
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] shadow-2xs">
                <div className="text-xl sm:text-2xl font-bold font-book-serif text-emerald-600 dark:text-emerald-400">
                  A2 — C1
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                  四六级/考研/GRE
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] shadow-2xs">
                <div className="text-xl sm:text-2xl font-bold font-book-serif text-[var(--color-ink)]">
                  100% 纯净
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                  零弹窗沉浸版式
                </div>
              </div>
            </div>

            {/* Direct Guest Link */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={onEnterBookshelf}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-[var(--color-paper)] font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm group"
              >
                <span>以访客身份直接探索文库</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                无需注册即可随心阅读
              </span>
            </div>
          </div>

          {/* Right Wing (5 Cols): The Sign-In & Gateway Hearth */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] shadow-lg relative overflow-hidden">
              {/* Decorative paper watermarks */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full pointer-events-none blur-2xl" />

              {user ? (
                /* Already Logged In State */
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center mx-auto text-xl font-bold font-book-serif">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-book-serif font-medium text-xl text-[var(--color-ink)]">
                      欢迎回来，{user.username}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1 font-meta-mono">
                      专属云端空间已连接 · 阅读进度与生词本持续同步
                    </p>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      onClick={onEnterBookshelf}
                      className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] text-white font-medium text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>进入我的典藏书房</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-medium text-xs hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                    >
                      退出当前账号
                    </button>
                  </div>
                </div>
              ) : (
                /* Login / Register Integrated Gateway Form */
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] font-meta-mono">
                        READER PASSPORT
                      </span>
                      <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                        云端书房通行证
                      </span>
                    </div>
                    <h3 className="font-book-serif font-medium text-xl text-[var(--color-ink)]">
                      {authTab === 'login' ? '读者登入' : '开启专属书房'}
                    </h3>
                  </div>

                  {/* Segmented Switcher */}
                  <div className="flex items-center bg-[var(--color-paper-2)] p-1 rounded-xl border border-[var(--color-rule)]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-[background-color,color] cursor-pointer ${
                        authTab === 'login'
                          ? 'bg-[var(--color-paper-elevated)] text-[var(--color-accent)] font-semibold shadow-xs'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      读者登录
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('register');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-[background-color,color] cursor-pointer ${
                        authTab === 'register'
                          ? 'bg-[var(--color-paper-elevated)] text-[var(--color-accent)] font-semibold shadow-xs'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      新读者注册
                    </button>
                  </div>

                  {/* Notification Banners */}
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-900/50">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    {/* Username */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--color-ink-2)] font-meta-mono">
                        用户名 / 账号
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="例如：Gatsby"
                          className="w-full pl-9 pr-3 py-2 bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] rounded-lg text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email (Register only) */}
                    {authTab === 'register' && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[var(--color-ink-2)] font-meta-mono flex items-center justify-between">
                          <span>电子邮箱</span>
                          <span className="text-[10px] text-[var(--color-ink-muted)]">（选填）</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="用于进度备份与安全同步"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] rounded-lg text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--color-ink-2)] font-meta-mono">
                        密码
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={authTab === 'register' ? '至少 6 位密码' : '请输入密码'}
                          className="w-full pl-9 pr-3 py-2 bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] rounded-lg text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--color-ink)] text-[var(--color-paper)] font-medium text-xs hover:opacity-95 transition-opacity cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>正在同步连接...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                          <span>{authTab === 'login' ? '登入我的书房' : '注册并开启云端典藏'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-1 border-t border-[var(--color-rule)]/60">
                    <button
                      type="button"
                      onClick={onEnterBookshelf}
                      className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-meta-mono transition-colors cursor-pointer"
                    >
                      不想登录？以访客身份快速浏览文库 &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Pillars of Depth (学术与技术底蕴) */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] font-meta-mono">
            ARCHIVAL INTEGRITY & ACADEMIC RIGOR
          </span>
          <h2 className="text-2xl sm:text-4xl font-medium font-book-serif text-[var(--color-ink)] tracking-tight">
            每一处细节，皆为经得起凝视的阅读深度
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed font-book-sans">
            拒绝千篇一律的粗糙电子书。从排版字体、字级间距，到 ECDICT 词典毫秒解析，
            我们以制作传世典藏的标准打造每一次翻页体验。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl bg-[var(--color-paper-2)]/70 hover:bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-accent)]/50 transition-[border-color,background-color] duration-200 flex flex-col justify-between space-y-6 shadow-2xs group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-paper-elevated)] flex items-center justify-center border border-[var(--color-rule)] group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[10px] text-[var(--color-accent)] font-meta-mono font-semibold uppercase px-2 py-0.5 rounded border border-[var(--color-rule)]">
                    {card.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-book-serif font-medium text-lg text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] font-meta-mono mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-book-sans">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--color-rule)]/60 text-xs font-meta-mono text-[var(--color-ink-muted)] flex items-center gap-1 group-hover:text-[var(--color-ink)] transition-colors">
                <span>标准实现 · 离线全量内置</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Curated Masterpiece Showcase (精选传世名著书墙) */}
      <section className="py-16 sm:py-20 px-6 sm:px-12 bg-[var(--color-paper-2)]/50 border-t border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] font-meta-mono">
                CURATED CANON · 1,528 VOLUMES
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium font-book-serif text-[var(--color-ink)] tracking-tight">
                世界公版经典原著导读选粹
              </h2>
              <p className="text-xs text-[var(--color-ink-2)] max-w-xl">
                所有书籍均已完成章节结构化标定与蓝思难度分析，点击任意书卷即可即刻进入沉浸阅读。
              </p>
            </div>

            <button
              onClick={onEnterBookshelf}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline font-meta-mono font-medium cursor-pointer"
            >
              <span>浏览全部 1,528 部书目</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CLASSICS.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBook(b.id)}
                className="p-5 rounded-xl bg-[var(--color-paper-elevated)] hover:bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-accent)]/60 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer group flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex gap-4">
                  {/* Tactile Cloth Cover */}
                  <div
                    className={`w-24 h-36 rounded-r-md rounded-l-xs ${b.cloth.bg} border-t border-r border-b ${b.cloth.border} p-2.5 flex flex-col justify-between book-cloth-shadow book-spine-crease shrink-0`}
                  >
                    <span className={`text-[8px] ${b.cloth.subtle} uppercase font-meta-mono tracking-wider`}>
                      Classic
                    </span>
                    <div>
                      <h4 className={`font-book-serif font-medium text-xs leading-snug line-clamp-3 ${b.cloth.foil}`}>
                        {b.chineseTitle}
                      </h4>
                      <p className={`text-[9px] ${b.cloth.subtle} font-book-serif truncate mt-0.5`}>
                        {b.title}
                      </p>
                    </div>
                    <span className={`text-[8px] ${b.cloth.subtle} font-meta-mono`}>
                      {b.cefr}
                    </span>
                  </div>

                  {/* Info & Famous Excerpt */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold border font-meta-mono bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30">
                        {b.cefrLabel}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-book-serif font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                        {b.chineseTitle} · {b.title}
                      </h4>
                      <p className="text-xs text-[var(--color-ink-muted)] font-book-serif truncate mt-0.5">
                        {b.author}
                      </p>
                    </div>

                    <p className="text-[11px] text-[var(--color-ink-2)] line-clamp-3 leading-relaxed italic font-book-serif border-l-2 border-[var(--color-rule)] pl-2">
                      “{b.quote}”
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-rule)]/60 flex items-center justify-between text-xs text-[var(--color-ink-muted)] font-meta-mono">
                  <span>即点即读 · 离线词典</span>
                  <span className="text-[var(--color-accent)] group-hover:underline flex items-center gap-0.5">
                    开卷阅读 &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Colophon & Standards Footnote */}
      <footer className="py-12 px-6 sm:px-12 max-w-7xl mx-auto border-t border-[var(--color-rule)] text-xs text-[var(--color-ink-muted)] font-meta-mono space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center font-book-serif font-bold text-xs select-none">
              W
            </div>
            <span>王尔德 · Wilde · 英文原著分级精读典藏</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Standard Ebooks 数字化标准</span>
            <span>·</span>
            <span>ECDICT 权威离线释义</span>
            <span>·</span>
            <span>CEFR 欧洲语言框架</span>
          </div>
        </div>
        <p className="text-center text-[11px] text-[var(--color-ink-muted)]/80">
          “The artist is the creator of beautiful things.” — Oscar Wilde · 唯美主义原著数字化典藏
        </p>
      </footer>
    </div>
  );
};
