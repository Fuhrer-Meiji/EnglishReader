'use client';

/* Astryx · component: SentenceDrawer · integrated with Meta Astryx Badge and IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  Lightbulb,
  ChevronRight,
  Loader2,
  Key,
  Quote,
  Feather,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { SentenceAnalysis } from '../lib/types';
import { DICTIONARY_DATABASE } from '../lib/mockData';
import { Badge, IconButton } from '@astryxdesign/core';
import { loadAIConfig } from '../lib/aiConfig';

interface AISentenceResult {
  literaryTranslation: string;
  syntaxHierarchy: {
    component: string;
    content: string;
    explanation: string;
  }[];
  literaryNotes: string;
  keyExpressions: {
    expression: string;
    meaning: string;
  }[];
}

interface SentenceDrawerProps {
  sentence: SentenceAnalysis | null;
  onClose: () => void;
  onSelectWord: (word: string) => void;
  onGenerateCard?: (quote: string, translation: string) => void;
  bookTitle?: string;
  author?: string;
  onOpenAIConfig?: () => void;
}

export const SentenceDrawer: React.FC<SentenceDrawerProps> = ({
  sentence,
  onClose,
  onSelectWord,
  onGenerateCard,
  bookTitle = '传世原著',
  author = '文学名家',
  onOpenAIConfig,
}) => {
  const [aiResult, setAiResult] = useState<AISentenceResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Reset AI result when sentence changes
    setAiResult(null);
    setAiError(null);
    if (typeof window !== 'undefined') {
      const cfg = loadAIConfig();
      setHasApiKey(Boolean(cfg.apiKey && cfg.apiKey.trim()));
    }
  }, [sentence?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!sentence) return null;

  const playSentenceAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.rawText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRunAIAnalysis = async () => {
    const cfg = loadAIConfig();
    if (!cfg.apiKey || !cfg.apiKey.trim()) {
      onOpenAIConfig?.();
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'sentence',
          apiBaseUrl: cfg.apiBaseUrl,
          apiKey: cfg.apiKey,
          model: cfg.model,
          sentence: sentence.rawText,
          context: '',
          bookTitle,
          author,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI 分析失败');
      }

      if (data.data) {
        setAiResult(data.data);
      }
    } catch (err: any) {
      setAiError(err.message || '请求失败，请检查 API 配置');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border-l border-[var(--color-rule)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-rule)] flex items-center justify-between bg-[var(--color-paper-2)]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--color-paper)] text-[var(--color-accent)] border border-[var(--color-rule)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-book-serif font-medium text-[var(--color-ink)] text-sm">
                  句法成分与原著深度拆解
                </h3>
                <Badge label={sentence.difficultyTag} variant="purple" />
              </div>
              <span className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                长难句解构 · 语法成分逐级剖析
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] transition-all cursor-pointer shadow-2xs group"
            title="关闭抽屉 (Esc)"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>关闭</span>
          </button>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Original Sentence Card */}
        <div className="rounded-xl p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="font-book-serif text-base sm:text-lg text-[var(--color-ink)] leading-relaxed font-normal">
              {sentence.rawText}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {onGenerateCard && (
                <button
                  onClick={() => {
                    onGenerateCard(
                      sentence.rawText,
                      aiResult?.literaryTranslation || sentence.chineseTranslation || ''
                    );
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  title="生成典藏羊皮纸质感金句长图"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>生成金句卡片</span>
                </button>
              )}
              <IconButton
                label="整句朗读"
                icon={<Volume2 className="w-4 h-4" />}
                variant="secondary"
                size="sm"
                onClick={playSentenceAudio}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[var(--color-rule)]">
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              {aiResult?.literaryTranslation || sentence.chineseTranslation}
            </p>
          </div>
        </div>

        {/* AI Analysis Trigger Bar */}
        <div className="p-3.5 rounded-xl bg-linear-to-r from-[var(--color-accent)]/10 via-[var(--color-paper-2)] to-[var(--color-paper-2)] border border-[var(--color-accent)]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <Feather className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-ink)] truncate font-book-serif">
                王尔德 AI 文学级深度伴读
              </p>
              <p className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono truncate">
                {hasApiKey ? '大模型已连接 · 一键剖析修辞典故与复杂句式' : '自主配置 DeepSeek/OpenAI Key 开启大模型'}
              </p>
            </div>
          </div>

          <button
            onClick={hasApiKey ? handleRunAIAnalysis : onOpenAIConfig}
            disabled={isAiLoading}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>研读中...</span>
              </>
            ) : hasApiKey ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiResult ? '重新分析' : 'AI 深度剖析'}</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>配置 API</span>
              </>
            )}
          </button>
        </div>

        {/* AI Error Warning */}
        {aiError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{aiError}</span>
            {onOpenAIConfig && (
              <button
                onClick={onOpenAIConfig}
                className="underline text-[11px] font-medium shrink-0 ml-2 cursor-pointer"
              >
                检查 API 设置
              </button>
            )}
          </div>
        )}

        {/* AI Literary Notes (if generated) */}
        {aiResult?.literaryNotes && (
          <div className="rounded-xl p-4 bg-[var(--color-paper-2)] border border-[var(--color-accent)]/40 space-y-2 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] font-meta-mono">
              <Quote className="w-3.5 h-3.5" />
              <span>王尔德 AI · 文学隐喻与时代修辞</span>
            </div>
            <p className="text-xs text-[var(--color-ink)] leading-relaxed font-book-serif">
              {aiResult.literaryNotes}
            </p>
          </div>
        )}

        {/* Grammar Tree Breakdown (AI or Presets) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-accent)] font-meta-mono uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{aiResult ? 'AI 句法成分层级拆解' : '句法成分层级拆解'}</span>
            </div>
            {aiResult && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                ✓ 大模型增强
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {aiResult && aiResult.syntaxHierarchy && aiResult.syntaxHierarchy.length > 0 ? (
              aiResult.syntaxHierarchy.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge label={comp.component} variant="teal" />
                  </div>
                  {comp.content && (
                    <p className="font-book-serif text-sm font-medium text-[var(--color-ink)] bg-[var(--color-paper-elevated)] px-2.5 py-1.5 rounded border border-[var(--color-rule)]/60">
                      {comp.content}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                    {comp.explanation}
                  </p>
                </div>
              ))
            ) : (
              sentence.grammarComponents.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge label={comp.role} variant="teal" />
                  </div>
                  <p className="font-book-serif text-sm font-medium text-[var(--color-ink)] bg-[var(--color-paper-elevated)] px-2.5 py-1.5 rounded border border-[var(--color-rule)]/60">
                    {comp.content}
                  </p>
                  <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                    {comp.explanation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Key Expressions (if available) */}
        {aiResult?.keyExpressions && aiResult.keyExpressions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] font-meta-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 提炼重点习语与表达</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {aiResult.keyExpressions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1"
                >
                  <span className="font-book-serif font-medium text-sm text-[var(--color-ink)]">
                    {item.expression}
                  </span>
                  <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cultural & Literary Notes (Standard fallback) */}
        {!aiResult && sentence.culturalNote && (
          <div className="rounded-xl p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] font-meta-mono">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>时代文化与文学典故注脚</span>
            </div>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              {sentence.culturalNote}
            </p>
          </div>
        )}

        {/* Core Words in Sentence */}
        {sentence.coreKeywords && sentence.coreKeywords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] font-meta-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>句中考点词汇清单</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sentence.coreKeywords.map((kw, idx) => {
                const entry = DICTIONARY_DATABASE[kw.toLowerCase()];
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectWord(kw)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-rule)] hover:border-[var(--color-accent)]/50 bg-[var(--color-paper-2)] transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-book-serif font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                          {kw}
                        </span>
                        {entry?.phonetic && (
                          <span className="text-xs text-[var(--color-ink-muted)] font-meta-mono">
                            {entry.phonetic}
                          </span>
                        )}
                        {entry?.level && (
                          <Badge label={entry.level} variant="neutral" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-ink-muted)] truncate max-w-[340px] mt-0.5">
                        {entry?.translation || '点击查看词义与搭配'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
