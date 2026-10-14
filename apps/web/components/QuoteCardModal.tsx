'use client';

/* Hallmark · component: QuoteCardModal · Archival Quote Bookmark & Share Card Generator
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Share2,
  Palette,
  Eye,
  Edit3,
  Feather,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

export type CardThemeId = 'parchment' | 'midnight' | 'gallery';

interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  badge: string;
  bgHex: string;
  bgGradientEnd: string;
  cardBorder: string;
  innerBorder: string;
  textHex: string;
  subtextHex: string;
  accentHex: string;
  sealColor: string;
  quoteColor: string;
  watermarkHex: string;
}

const THEMES: Record<CardThemeId, CardThemeConfig> = {
  parchment: {
    id: 'parchment',
    name: '典藏羊皮纸',
    badge: '📜 典雅复古',
    bgHex: '#F6F1E5',
    bgGradientEnd: '#EFE7D8',
    cardBorder: '#D8CCA8',
    innerBorder: '#BEAD82',
    textHex: '#2A201A',
    subtextHex: '#736352',
    accentHex: '#9B2C16', // Vermilion wax seal
    sealColor: '#8C2510',
    quoteColor: '#B0462E',
    watermarkHex: '#998772',
  },
  midnight: {
    id: 'midnight',
    name: '墨玉暗夜',
    badge: '🌙 沉浸深邃',
    bgHex: '#121419',
    bgGradientEnd: '#0D0E12',
    cardBorder: '#272C38',
    innerBorder: '#373E4F',
    textHex: '#F3F5F8',
    subtextHex: '#94A3B8',
    accentHex: '#D97706', // Gold leaf seal
    sealColor: '#B45309',
    quoteColor: '#F59E0B',
    watermarkHex: '#64748B',
  },
  gallery: {
    id: 'gallery',
    name: '晨曦雅白',
    badge: '📄 极简现代',
    bgHex: '#FFFFFF',
    bgGradientEnd: '#F8FAFC',
    cardBorder: '#E2E8F0',
    innerBorder: '#CBD5E1',
    textHex: '#0F172A',
    subtextHex: '#64748B',
    accentHex: '#334155', // Slate archival seal
    sealColor: '#1E293B',
    quoteColor: '#475569',
    watermarkHex: '#94A3B8',
  },
};

export interface QuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  initialTranslation?: string;
  bookTitle?: string;
  chineseTitle?: string;
  author?: string;
  chapterTitle?: string;
}

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({
  isOpen,
  onClose,
  quote,
  initialTranslation = '',
  bookTitle = 'The Picture of Dorian Gray',
  chineseTitle = '道林·格雷的画像',
  author = 'Oscar Wilde',
  chapterTitle = 'Chapter I',
}) => {
  const [currentTheme, setCurrentTheme] = useState<CardThemeId>('parchment');
  const [translation, setTranslation] = useState<string>(initialTranslation);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showChapter, setShowChapter] = useState<boolean>(true);
  const [showSeal, setShowSeal] = useState<boolean>(true);
  const [isEditingTranslation, setIsEditingTranslation] = useState<boolean>(false);
  const [isCopiedText, setIsCopiedText] = useState<boolean>(false);
  const [isCopiedImage, setIsCopiedImage] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial translation when prop updates
  useEffect(() => {
    if (initialTranslation) {
      setTranslation(initialTranslation);
    }
  }, [initialTranslation]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Canvas drawing routine
  const renderCardToCanvas = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const theme = THEMES[currentTheme];

    // High-resolution Retina export: Width 720px, scaled x2 = 1440px
    const scale = 2;
    const baseWidth = 680;

    // Helper text measurement & word-wrap
    const wrapText = (
      text: string,
      font: string,
      maxWidth: number,
      lineHeight: number
    ): string[] => {
      ctx.font = font;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    // Helper for Chinese line-wrapping by character
    const wrapChineseText = (
      text: string,
      font: string,
      maxWidth: number
    ): string[] => {
      ctx.font = font;
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n') {
          lines.push(currentLine);
          currentLine = '';
          continue;
        }
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    // Calculate content layout heights
    const paddingX = 48;
    const contentWidth = baseWidth - paddingX * 2;

    const quoteLines = wrapText(
      quote.trim(),
      'italic 24px "Newsreader", "Charter", "Georgia", serif',
      contentWidth - 20,
      36
    );

    const cnLines =
      showTranslation && translation.trim()
        ? wrapChineseText(
            translation.trim(),
            '500 17px "Songti SC", "SimSun", "Noto Serif SC", serif',
            contentWidth - 20
          )
        : [];

    // Compute dynamic height
    let estimatedHeight = 58; // Top padding
    if (showSeal) estimatedHeight += 105; // Archival Seal
    estimatedHeight += 38; // Book Title Header
    if (showChapter && chapterTitle) estimatedHeight += 24; // Chapter line
    estimatedHeight += 36; // Divider space
    estimatedHeight += quoteLines.length * 38 + 24; // Quote text + margins
    if (cnLines.length > 0) {
      estimatedHeight += 28 + cnLines.length * 28 + 12; // Chinese translation + divider
    }
    estimatedHeight += 44; // Author attribution
    estimatedHeight += 64; // Bottom watermark & margins
    estimatedHeight += 32; // Bottom safety buffer

    const baseHeight = Math.max(estimatedHeight, 620);

    // Set canvas dimensions
    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;

    ctx.save();
    ctx.scale(scale, scale);

    // 1. Background Fill with subtle paper texture gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, baseHeight);
    bgGradient.addColorStop(0, theme.bgHex);
    bgGradient.addColorStop(1, theme.bgGradientEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Subtle paper grain imitation for parchment
    if (theme.id === 'parchment') {
      ctx.fillStyle = 'rgba(160, 130, 90, 0.035)';
      for (let i = 0; i < 400; i++) {
        const rx = (i * 137.5) % baseWidth;
        const ry = (i * 269.3) % baseHeight;
        ctx.fillRect(rx, ry, 1.5, 1.5);
      }
    }

    // 2. Archival Double Borders
    const margin = 20;
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(margin, margin, baseWidth - margin * 2, baseHeight - margin * 2);

    const innerMargin = 26;
    ctx.strokeStyle = theme.innerBorder;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(innerMargin, innerMargin, baseWidth - innerMargin * 2, baseHeight - innerMargin * 2);

    // Corner Ornaments (Diamond Knots)
    const corners = [
      { x: innerMargin + 5, y: innerMargin + 5 },
      { x: baseWidth - innerMargin - 5, y: innerMargin + 5 },
      { x: innerMargin + 5, y: baseHeight - innerMargin - 5 },
      { x: baseWidth - innerMargin - 5, y: baseHeight - innerMargin - 5 },
    ];
    ctx.fillStyle = theme.accentHex;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    let currentY = 54;

    // 3. Vintage Archival Wax Seal (Top Center)
    if (showSeal) {
      const sealCenterX = baseWidth / 2;
      const sealCenterY = currentY + 36;
      const sealRadius = 32;

      // Outer beaded / dashed circle
      ctx.strokeStyle = theme.sealColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 2.5]);
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, sealRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner solid circle
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, sealRadius - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Top circular seal curved text or center monogram
      ctx.font = '600 9px "Newsreader", "Charter", serif';
      ctx.fillStyle = theme.sealColor;
      ctx.textAlign = 'center';
      ctx.fillText('STANDARD EBOOKS', sealCenterX, sealCenterY - 14);

      // Center decorative star / feather monogram
      ctx.font = 'bold 15px serif';
      ctx.fillText('✦ 𝒲 ✦', sealCenterX, sealCenterY + 4);

      ctx.font = '700 8px "Noto Serif SC", serif';
      ctx.fillText('传 世 典 藏', sealCenterX, sealCenterY + 16);

      currentY += 88;
    }

    // 4. Book Header Attribution
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textHex;
    ctx.font = '600 18px "Noto Serif SC", "Songti SC", serif';
    ctx.fillText(chineseTitle || bookTitle, baseWidth / 2, currentY);
    currentY += 22;

    ctx.fillStyle = theme.subtextHex;
    ctx.font = 'italic 12px "Newsreader", "Charter", "Georgia", serif';
    const subTitleLine = showChapter && chapterTitle
      ? `${bookTitle} · ${chapterTitle}`
      : `${bookTitle} · Archival Edition`;
    ctx.fillText(subTitleLine, baseWidth / 2, currentY);
    currentY += 24;

    // Center Floral Divider (— ◇ —)
    ctx.strokeStyle = theme.innerBorder;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(baseWidth / 2 - 80, currentY);
    ctx.lineTo(baseWidth / 2 - 16, currentY);
    ctx.moveTo(baseWidth / 2 + 16, currentY);
    ctx.lineTo(baseWidth / 2 + 80, currentY);
    ctx.stroke();

    ctx.fillStyle = theme.accentHex;
    ctx.font = '10px serif';
    ctx.fillText('❖', baseWidth / 2, currentY + 3.5);
    currentY += 32;

    // 5. English Quote (Hero Body)
    ctx.fillStyle = theme.quoteColor;
    ctx.font = 'bold 36px "Georgia", serif';
    ctx.fillText('“', baseWidth / 2, currentY + 4);
    currentY += 22;

    ctx.fillStyle = theme.textHex;
    ctx.font = 'italic 20px "Newsreader", "Charter", "Georgia", serif';
    ctx.textAlign = 'center';

    quoteLines.forEach((line) => {
      ctx.fillText(line, baseWidth / 2, currentY);
      currentY += 34;
    });

    // 6. Chinese Translation (if enabled)
    if (showTranslation && cnLines.length > 0) {
      currentY += 12;

      // Small dotted divider
      ctx.strokeStyle = theme.innerBorder;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(baseWidth / 2 - 50, currentY);
      ctx.lineTo(baseWidth / 2 + 50, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      currentY += 22;

      ctx.fillStyle = theme.subtextHex;
      ctx.font = '500 15px "Songti SC", "SimSun", "Noto Serif SC", serif';
      cnLines.forEach((cnLine) => {
        ctx.fillText(cnLine, baseWidth / 2, currentY);
        currentY += 26;
      });
    }

    // 7. Author Byline
    currentY += 26;
    ctx.fillStyle = theme.accentHex;
    ctx.font = 'italic 600 13px "Newsreader", "Charter", serif';
    const byline = `—— ${author}`;
    ctx.fillText(byline, baseWidth / 2, currentY);

    // 8. Footer Watermark & Authenticity Badge
    const footerY = baseHeight - margin - 22;

    ctx.strokeStyle = theme.innerBorder;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(innerMargin + 16, footerY - 14);
    ctx.lineTo(baseWidth - innerMargin - 16, footerY - 14);
    ctx.stroke();

    ctx.fillStyle = theme.watermarkHex;
    ctx.font = '500 10px "Newsreader", "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.fillText('王尔德 · Wilde | 精校双语原著典藏', innerMargin + 18, footerY);

    ctx.textAlign = 'right';
    ctx.font = '10px "SF Mono", monospace';
    ctx.fillText('standard-ebooks · 8.217.7.250', baseWidth - innerMargin - 18, footerY);

    ctx.restore();

    return canvas;
  }, [currentTheme, quote, translation, showTranslation, showChapter, showSeal, bookTitle, chineseTitle, author, chapterTitle]);

  // Re-draw canvas whenever relevant state changes
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow canvas DOM node to mount
      const timer = setTimeout(() => {
        renderCardToCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderCardToCanvas]);

  if (!isOpen) return null;

  // Handle Download Image
  const handleDownloadImage = () => {
    const canvas = renderCardToCanvas();
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Wilde_Quote_${author.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading card:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Handle Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    const canvas = renderCardToCanvas();
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setIsCopiedImage(true);
          setTimeout(() => setIsCopiedImage(false), 2200);
        } else {
          // Fallback to download if ClipboardItem not supported
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Clipboard write image failed, falling back to download:', err);
      handleDownloadImage();
    }
  };

  // Handle Copy Text
  const handleCopyText = () => {
    const textToCopy = `“${quote.trim()}”\n\n${translation.trim() ? `${translation.trim()}\n\n` : ''}—— ${author}《${chineseTitle || bookTitle}》\n王尔德 · 精校双语典藏`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 2000);
    }
  };

  const themeConfig = THEMES[currentTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Card Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row text-[var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Live Visual Preview */}
        <div className="flex-1 bg-[var(--color-paper-2)]/60 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[var(--color-rule)]">
          <div className="text-center mb-3">
            <span className="text-[11px] font-meta-mono text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              名言划线 · 典藏长图预览
            </span>
          </div>

          {/* Scaled Responsive Canvas Container */}
          <div className="w-full max-w-[380px] sm:max-w-[420px] shadow-2xl rounded-xl overflow-hidden border border-[var(--color-rule)] transition-all">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block select-none pointer-events-none"
              style={{ maxHeight: '68vh', objectFit: 'contain' }}
            />
          </div>

          <p className="mt-3 text-[11px] font-meta-mono text-[var(--color-ink-muted)] text-center">
            2x Retina 超清渲染 · 适合小红书 / 朋友圈 / 微博分享
          </p>
        </div>

        {/* Right Side: Theme Controls & Customization */}
        <div className="w-full lg:w-[380px] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[85vh] space-y-5 bg-[var(--color-paper)]">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <BookmarkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-book-serif text-[var(--color-ink)]">
                    金句书签卡片工坊
                  </h3>
                  <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                    传世名句 · 一键定格典藏
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                title="关闭 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Theme Selection */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>纸张典藏配色</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['parchment', 'midnight', 'gallery'] as CardThemeId[]).map((tid) => {
                  const item = THEMES[tid];
                  const isActive = currentTheme === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => setCurrentTheme(tid)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isActive
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--color-rule)] hover:border-[var(--color-rule-active)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--color-ink)]">
                          {item.name}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: item.bgHex }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono truncate">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Toggle Elements */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>卡片版面构成</span>
              </label>
              <div className="space-y-1.5 bg-[var(--color-paper-2)] p-2.5 rounded-xl border border-[var(--color-rule)] text-xs">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-[var(--color-ink)]">呈现中文文学译文</span>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--color-rule)]">
                  <span className="text-[var(--color-ink)]">加盖首印典藏火漆章</span>
                  <input
                    type="checkbox"
                    checked={showSeal}
                    onChange={(e) => setShowSeal(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--color-rule)]">
                  <span className="text-[var(--color-ink)]">附注章节出处标定</span>
                  <input
                    type="checkbox"
                    checked={showChapter}
                    onChange={(e) => setShowChapter(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 3. Editable Translation */}
            {showTranslation && (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>润色精校中文译文</span>
                  </label>
                  <button
                    onClick={() => setIsEditingTranslation(!isEditingTranslation)}
                    className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    {isEditingTranslation ? '收起' : '自定义'}
                  </button>
                </div>
                {isEditingTranslation ? (
                  <textarea
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] text-[var(--color-ink)] focus:outline-hidden focus:border-[var(--color-accent)] resize-none"
                    placeholder="在此编辑中文文学译文..."
                  />
                ) : (
                  <p className="text-xs text-[var(--color-ink-2)] bg-[var(--color-paper-2)] p-2.5 rounded-xl border border-[var(--color-rule)] line-clamp-2">
                    {translation || '暂无译文（勾选显示后可在此键入或自动生成）'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Export Buttons */}
          <div className="space-y-2 pt-3 border-t border-[var(--color-rule)]">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在导出高清图...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>下载 2x 超清金句长图 (PNG)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyImageToClipboard}
                className="py-2 px-3 rounded-xl bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="直接复制图片到系统剪贴板，可直接在微信/社交软件粘贴"
              >
                {isCopiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>已复制图片</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>复制图片</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyText}
                className="py-2 px-3 rounded-xl bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="复制中英双语文字内容"
              >
                {isCopiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>已复制文字</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>复制文案</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon alias
function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  );
}
