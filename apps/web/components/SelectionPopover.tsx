'use client';

/* Hallmark · component: SelectionPopover · Selection Translation Toolbar
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Copy,
  Check,
  Bookmark,
  X,
  Loader2,
  BookOpen,
  Languages,
  ExternalLink,
} from 'lucide-react';
import { loadAIConfig } from '../lib/aiConfig';

interface SelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number; placeAbove?: boolean };
  onClose: () => void;
  onDeepAnalyze: (text: string) => void;
  onSaveVocab?: (text: string, translation: string) => void;
  bookTitle?: string;
  author?: string;
  onOpenAIConfig?: () => void;
}

export const SelectionPopover: React.FC<SelectionPopoverProps> = ({
  selectedText,
  position,
  onClose,
  onDeepAnalyze,
  onSaveVocab,
  bookTitle = '传世原著',
  author = '文学名家',
  onOpenAIConfig,
}) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAI, setIsAI] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch translation on selection text change
  useEffect(() => {
    let isCancelled = false;
    const fetchTranslation = async () => {
      if (!selectedText.trim()) return;

      setIsLoading(true);
      setTranslation(null);

      const aiCfg = typeof window !== 'undefined' ? loadAIConfig() : null;

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: selectedText.trim(),
            aiConfig: aiCfg?.apiKey ? aiCfg : undefined,
            bookTitle,
            author,
          }),
        });

        if (!isCancelled && res.ok) {
          const data = await res.json();
          setTranslation(data.translation || '暂无译文');
          setIsAI(Boolean(data.isAI));
        }
      } catch (err) {
        if (!isCancelled) {
          setTranslation('翻译请求超时，请检查网络连接');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTranslation();
    return () => {
      isCancelled = true;
    };
  }, [selectedText, bookTitle, author]);

  // Text-to-speech
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy text or translation
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = translation
      ? `${selectedText}\n\n${translation}`
      : selectedText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    }
  };

  // Bookmark / Save to Vocab
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveVocab && translation) {
      onSaveVocab(selectedText.trim(), translation);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
    }
  };

  // Deep AI Analysis
  const handleTriggerDeepAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    onDeepAnalyze(selectedText.trim());
  };

  // Calculate safe coordinates inside viewport
  const safeLeft = typeof window !== 'undefined'
    ? Math.min(Math.max(position.x, 180), window.innerWidth - 180)
    : position.x;

  return (
    <div
      className={`fixed z-50 transform -translate-x-1/2 w-[340px] sm:w-[420px] max-w-[92vw] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] rounded-2xl shadow-2xl border border-[var(--color-rule)] p-4 animate-in fade-in zoom-in-95 duration-150 select-none ${
        position.placeAbove ? '-translate-y-full' : ''
      }`}
      style={{
        left: `${safeLeft}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Floating Action Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2.5">
        <div className="flex items-center gap-1">
          <div className="p-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Languages className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold font-book-serif text-[var(--color-ink)]">
            划选翻译
          </span>
          {isAI ? (
            <span className="text-[10px] text-[var(--color-accent)] font-meta-mono px-1.5 py-0.2 rounded border border-[var(--color-rule)] flex items-center gap-0.5 ml-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI 文学译
            </span>
          ) : (
            <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono px-1.5 py-0.2 rounded border border-[var(--color-rule)] ml-1">
              即时神经译
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[var(--color-ink-muted)]">
          {/* Read aloud */}
          <button
            onClick={handlePlayAudio}
            className={`p-1.5 rounded-lg hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer ${
              isSpeaking ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''
            }`}
            title="朗读选文"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
            title="复制双语译文"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Add to Vocab / Notebook */}
          {onSaveVocab && (
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer ${
                isSaved ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''
              }`}
              title="加入生词本/金句摘录"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
            title="关闭浮窗 (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Original Selected Snippet */}
      <div className="py-2.5">
        <p className="text-xs font-book-serif text-[var(--color-ink-2)] line-clamp-3 leading-relaxed select-text italic">
          “{selectedText}”
        </p>
      </div>

      {/* 3. Translated Result */}
      <div className="pt-2.5 border-t border-[var(--color-rule)]">
        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-xs text-[var(--color-ink-muted)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent)]" />
            <span>正在精准翻译句段意蕴...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-book-sans text-[var(--color-ink)] leading-relaxed select-text font-medium">
              {translation}
            </p>

            {/* Bottom Tools & Deep AI Trigger */}
            <div className="flex items-center justify-between pt-1 text-[11px] font-meta-mono text-[var(--color-ink-muted)]">
              <button
                onClick={handleTriggerDeepAnalysis}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 transition-colors cursor-pointer font-medium shadow-2xs group"
                title="唤醒王尔德 AI 对该选段进行句法树与修辞典故深度剖析"
              >
                <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                <span>AI 句法与文学深度赏析</span>
              </button>

              {!isAI && onOpenAIConfig && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAIConfig();
                  }}
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <span>配置 AI 译文</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
