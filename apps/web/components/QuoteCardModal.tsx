'use client';

/* Hallmark · component: QuoteCardModal · Archival & Bespoke Quote Card Generator
 * genre: editorial · tactile aesthetic
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Palette,
  Edit3,
  Feather,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Sliders,
  Trash2,
  Layers,
} from 'lucide-react';

export type CardLayoutId = 'polaroid' | 'editorial' | 'cinematic' | 'ex-libris' | 'midnight';
export type CardAspectRatio = 'portrait' | 'classic' | 'square';
export type CardThemeId = 'parchment' | 'obsidian' | 'gallery' | 'sage' | 'terracotta';
export type ImageFilterId = 'natural' | 'sepia' | 'noir';

interface PresetImage {
  id: string;
  name: string;
  label: string;
  url: string;
  thumb: string;
  artist: string;
}

const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'wilde-portrait',
    name: '王尔德肖像',
    label: '萨罗尼 1882 · 文豪本尊',
    artist: 'Napoleon Sarony',
    url: '/presets/wilde-portrait.jpg',
    thumb: '/presets/wilde-portrait.jpg',
  },
  {
    id: 'starry-night',
    name: '星月夜',
    label: '梵高 · 仰望星空',
    artist: 'Vincent van Gogh',
    url: '/presets/starry-night.jpg',
    thumb: '/presets/starry-night.jpg',
  },
  {
    id: 'wanderer',
    name: '雾海旅人',
    label: '弗里德里希 · 浪漫幽远',
    artist: 'Caspar David Friedrich',
    url: '/presets/wanderer.jpg',
    thumb: '/presets/wanderer.jpg',
  },
  {
    id: 'water-lilies',
    name: '睡莲池',
    label: '莫奈 · 印象光影',
    artist: 'Claude Monet',
    url: '/presets/water-lilies.jpg',
    thumb: '/presets/water-lilies.jpg',
  },
];

interface ThemePalette {
  id: CardThemeId;
  name: string;
  bgHex: string;
  bgGradientEnd: string;
  cardBorder: string;
  innerBorder: string;
  textHex: string;
  subtextHex: string;
  accentHex: string;
  quoteColor: string;
  stampBorder: string;
}

const PALETTES: Record<CardThemeId, ThemePalette> = {
  parchment: {
    id: 'parchment',
    name: '暖阳羊皮纸',
    bgHex: '#F6F1E5',
    bgGradientEnd: '#ECE4D2',
    cardBorder: '#D2C4A2',
    innerBorder: '#BBAA80',
    textHex: '#251E17',
    subtextHex: '#6F604F',
    accentHex: '#9B2C16',
    quoteColor: '#B0462E',
    stampBorder: '#8A2512',
  },
  obsidian: {
    id: 'obsidian',
    name: '墨玉黑曜',
    bgHex: '#121418',
    bgGradientEnd: '#0A0C0E',
    cardBorder: '#272C35',
    innerBorder: '#363D49',
    textHex: '#F3F5F8',
    subtextHex: '#929EAF',
    accentHex: '#D97706',
    quoteColor: '#F59E0B',
    stampBorder: '#B45309',
  },
  gallery: {
    id: 'gallery',
    name: '晨曦雅白',
    bgHex: '#FFFFFF',
    bgGradientEnd: '#F7F8FA',
    cardBorder: '#E2E6EA',
    innerBorder: '#CFD5DC',
    textHex: '#111827',
    subtextHex: '#586574',
    accentHex: '#334155',
    quoteColor: '#475569',
    stampBorder: '#1E293B',
  },
  sage: {
    id: 'sage',
    name: '鼠尾草绿',
    bgHex: '#ECEFEA',
    bgGradientEnd: '#DFE5DC',
    cardBorder: '#C1CCC0',
    innerBorder: '#A7B5A6',
    textHex: '#1C271E',
    subtextHex: '#556557',
    accentHex: '#2E5A36',
    quoteColor: '#3A6B44',
    stampBorder: '#23462A',
  },
  terracotta: {
    id: 'terracotta',
    name: '陶土红褐',
    bgHex: '#F7EFEA',
    bgGradientEnd: '#EFE2DB',
    cardBorder: '#DCC5BA',
    innerBorder: '#C8A99C',
    textHex: '#2B1C17',
    subtextHex: '#73574D',
    accentHex: '#A34228',
    quoteColor: '#B85034',
    stampBorder: '#8C351E',
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
  quote: propQuote,
  initialTranslation = '',
  bookTitle = 'The Picture of Dorian Gray',
  chineseTitle = '道林·格雷的画像',
  author = 'Oscar Wilde',
  chapterTitle = 'Chapter I',
}) => {
  // Configurable states
  const [layout, setLayout] = useState<CardLayoutId>('polaroid');
  const [aspectRatio, setAspectRatio] = useState<CardAspectRatio>('portrait');
  const [paletteId, setPaletteId] = useState<CardThemeId>('parchment');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('wilde-portrait');
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [filter, setFilter] = useState<ImageFilterId>('natural');
  const [overlayDarkness, setOverlayDarkness] = useState<number>(0.35); // 0.0 ~ 0.8
  const [showImage, setShowImage] = useState<boolean>(true);
  const [imageOffsetY, setImageOffsetY] = useState<number>(20); // 0 (top) ~ 100 (bottom), default 20% to frame portraits and art heads
  const [imageOffsetX, setImageOffsetX] = useState<number>(50); // 0 (left) ~ 100 (right), default 50%
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Editable text states
  const [quoteText, setQuoteText] = useState<string>(propQuote);
  const [translationText, setTranslationText] = useState<string>(initialTranslation);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [isEditingText, setIsEditingText] = useState<boolean>(false);

  // Status states
  const [isCopiedImage, setIsCopiedImage] = useState<boolean>(false);
  const [isCopiedText, setIsCopiedText] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeImageElementRef = useRef<HTMLImageElement | null>(null);

  // Sync props when opening/changing
  const [prevQuote, setPrevQuote] = useState<string>(propQuote);
  const [prevTranslation, setPrevTranslation] = useState<string>(initialTranslation);

  if (propQuote !== prevQuote || initialTranslation !== prevTranslation) {
    setPrevQuote(propQuote);
    setPrevTranslation(initialTranslation);
    setQuoteText(propQuote);
    setTranslationText(initialTranslation);
  }

  // Handle escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件 (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImageSrc(dataUrl);
      setShowImage(true);
    };
    reader.readAsDataURL(file);
  };

  // Helper: Wrap Text
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    font: string,
    maxWidth: number
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
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper: Wrap Chinese characters
  const wrapChineseText = (
    ctx: CanvasRenderingContext2D,
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
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper: Draw image with object-fit: cover and adjustable framing offset
  const drawCoverImage = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number = 0,
    offsetYPercent: number = imageOffsetY,
    offsetXPercent: number = imageOffsetX
  ) => {
    ctx.save();
    if (radius > 0) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.clip();
    }

    // Apply Filter
    if (filter === 'sepia') {
      ctx.filter = 'sepia(0.65) contrast(1.1) brightness(0.95)';
    } else if (filter === 'noir') {
      ctx.filter = 'grayscale(1) contrast(1.15) brightness(0.95)';
    } else {
      ctx.filter = 'none';
    }

    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sWidth = img.width;
    let sHeight = img.height;
    let sx = 0;
    let sy = 0;

    if (imgRatio > targetRatio) {
      sWidth = img.height * targetRatio;
      const maxSx = img.width - sWidth;
      sx = maxSx * (Math.min(Math.max(offsetXPercent, 0), 100) / 100);
    } else {
      sHeight = img.width / targetRatio;
      const maxSy = img.height - sHeight;
      sy = maxSy * (Math.min(Math.max(offsetYPercent, 0), 100) / 100);
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);

    // Apply Darkness Overlay
    if (overlayDarkness > 0) {
      ctx.filter = 'none';
      ctx.fillStyle = `rgba(0, 0, 0, ${overlayDarkness})`;
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  }, [filter, imageOffsetY, imageOffsetX, overlayDarkness]);

  // Main Canvas Render
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    const palette = PALETTES[paletteId];
    const scale = 2; // Retina 2x scale for razor-sharp text

    // Canvas Aspect Dimensions
    let baseWidth = 720;
    let baseHeight = 1120; // 9:16 approx
    if (aspectRatio === 'classic') {
      baseWidth = 720;
      baseHeight = 900; // 4:5
    } else if (aspectRatio === 'square') {
      baseWidth = 720;
      baseHeight = 720; // 1:1
    }

    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;

    ctx.save();
    ctx.scale(scale, scale);

    const activeImg = activeImageElementRef.current;

    // -------------------------------------------------------------
    // ARCHETYPE 1: POLAROID MEMORY (拍立得胶片风格)
    // -------------------------------------------------------------
    if (layout === 'polaroid') {
      // 1. Background Paper Fill
      const bgGrad = ctx.createLinearGradient(0, 0, 0, baseHeight);
      bgGrad.addColorStop(0, palette.bgHex);
      bgGrad.addColorStop(1, palette.bgGradientEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Fine outer border
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, baseWidth - 32, baseHeight - 32);

      // Polaroid Card Inset Frame
      const frameMargin = 38;
      const frameW = baseWidth - frameMargin * 2;
      const frameH = baseHeight - frameMargin * 2;

      // Polaroid Paper Shadow & Body
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(frameMargin, frameMargin, frameW, frameH);
      ctx.shadowColor = 'transparent'; // reset shadow

      // Thin hairline frame border
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(frameMargin, frameMargin, frameW, frameH);

      // Photo Section inside Polaroid (Top ~58% of Polaroid)
      const photoMargin = frameMargin + 20;
      const photoW = baseWidth - photoMargin * 2;
      const photoH = aspectRatio === 'square' ? frameH * 0.44 : frameH * 0.54;

      if (activeImg) {
        drawCoverImage(ctx, activeImg, photoMargin, photoMargin, photoW, photoH, 2);
      } else {
        // Fallback photo tint placeholder
        ctx.fillStyle = palette.bgGradientEnd;
        ctx.fillRect(photoMargin, photoMargin, photoW, photoH);
        ctx.fillStyle = palette.subtextHex;
        ctx.font = 'italic 14px "Newsreader", serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ Archival Literature Study ✦', baseWidth / 2, photoMargin + photoH / 2);
      }

      // Thin border around the photo
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(photoMargin, photoMargin, photoW, photoH);

      // Text Section Below Photo
      let textY = photoMargin + photoH + 34;

      // English Quote in Polaroid
      const quoteFontSize = aspectRatio === 'square' ? 17 : 20;
      ctx.fillStyle = '#111827';
      ctx.font = `italic 500 ${quoteFontSize}px "Newsreader", "Charter", "Georgia", serif`;
      ctx.textAlign = 'center';

      const quoteLines = wrapText(
        ctx,
        `“${quoteText.trim()}”`,
        `italic 500 ${quoteFontSize}px "Newsreader", "Charter", "Georgia", serif`,
        photoW - 16
      );

      quoteLines.slice(0, 5).forEach((line) => {
        ctx.fillText(line, baseWidth / 2, textY);
        textY += quoteFontSize * 1.5;
      });

      // Chinese Translation
      if (showTranslation && translationText.trim()) {
        textY += 10;
        ctx.fillStyle = '#4B5563';
        const cnFontSize = aspectRatio === 'square' ? 13 : 15;
        const cnLines = wrapChineseText(
          ctx,
          translationText.trim(),
          `500 ${cnFontSize}px "Songti SC", "SimSun", "Noto Serif SC", serif`,
          photoW - 20
        );
        cnLines.slice(0, 3).forEach((line) => {
          ctx.fillText(line, baseWidth / 2, textY);
          textY += cnFontSize * 1.55;
        });
      }

      // Bottom Metadata & Signature
      const footerY = frameMargin + frameH - 24;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 12px "Newsreader", "Charter", serif';
      ctx.textAlign = 'center';
      const metaLine = showMetadata
        ? `— ${author} · 《${chineseTitle || bookTitle}》`
        : `— ${author}`;
      ctx.fillText(metaLine, baseWidth / 2, footerY);

      // Bottom Tiny Watermark
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '9px "SF Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Wilde · Standard Ebooks', frameMargin + frameW - 14, footerY + 12);
    }

    // -------------------------------------------------------------
    // ARCHETYPE 2: EDITORIAL MONOGRAPH (名刊极简风格)
    // -------------------------------------------------------------
    else if (layout === 'editorial') {
      // 1. Clean Paper Surface
      ctx.fillStyle = palette.bgHex;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Fine editorial margins & rules
      const padX = 52;
      const contentW = baseWidth - padX * 2;
      let curY = 64;

      // Header Masthead
      ctx.fillStyle = palette.subtextHex;
      ctx.font = '600 11px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`VOL. I · CHAPTER ARCHIVE · ${new Date().getFullYear()}`, padX, curY);

      ctx.textAlign = 'right';
      ctx.fillText('ARCHIVAL MONOGRAPH', baseWidth - padX, curY);
      curY += 14;

      // Hairline Divider
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, curY);
      ctx.lineTo(baseWidth - padX, curY);
      ctx.stroke();
      curY += 34;

      // Optional Top Inset Photo Vignette
      if (activeImg && showImage) {
        const imgH = aspectRatio === 'square' ? 140 : 190;
        drawCoverImage(ctx, activeImg, padX, curY, contentW, imgH, 4);
        curY += imgH + 34;
      }

      // Giant Dropped Serif Quote Mark
      ctx.fillStyle = palette.accentHex;
      ctx.font = 'bold 54px "Georgia", serif';
      ctx.textAlign = 'left';
      ctx.fillText('“', padX - 4, curY + 10);
      curY += 28;

      // English Quote Body
      const qSize = aspectRatio === 'square' ? 20 : 23;
      ctx.fillStyle = palette.textHex;
      ctx.font = `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`;
      const qLines = wrapText(
        ctx,
        quoteText.trim(),
        `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`,
        contentW
      );
      qLines.forEach((line) => {
        ctx.fillText(line, padX, curY);
        curY += qSize * 1.55;
      });

      // Chinese Literary Translation
      if (showTranslation && translationText.trim()) {
        curY += 18;
        ctx.fillStyle = palette.subtextHex;
        const cnSize = 15;
        const cnLines = wrapChineseText(
          ctx,
          translationText.trim(),
          `500 ${cnSize}px "Songti SC", "SimSun", serif`,
          contentW
        );
        cnLines.forEach((line) => {
          ctx.fillText(line, padX, curY);
          curY += cnSize * 1.6;
        });
      }

      // Author Byline
      curY += 28;
      ctx.fillStyle = palette.accentHex;
      ctx.font = 'italic 600 14px "Newsreader", "Charter", serif';
      ctx.fillText(`—— ${author}`, padX, curY);

      if (showMetadata) {
        curY += 20;
        ctx.fillStyle = palette.subtextHex;
        ctx.font = '500 12px "Songti SC", serif';
        ctx.fillText(`《${chineseTitle || bookTitle}》 · ${chapterTitle}`, padX, curY);
      }

      // Footer Running Stamp
      const footY = baseHeight - 44;
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(padX, footY - 14);
      ctx.lineTo(baseWidth - padX, footY - 14);
      ctx.stroke();

      ctx.fillStyle = palette.subtextHex;
      ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('WILDE · STANDARD EBOOKS 精校典藏', padX, footY);

      ctx.textAlign = 'right';
      ctx.fillText('Standard Ebooks · Wilde', baseWidth - padX, footY);
    }

    // -------------------------------------------------------------
    // ARCHETYPE 3: CINEMATIC FULL-BLEED (全景电影海报风)
    // -------------------------------------------------------------
    else if (layout === 'cinematic') {
      // 1. Full-bleed background image or dark backdrop
      if (activeImg && showImage) {
        drawCoverImage(ctx, activeImg, 0, 0, baseWidth, baseHeight, 0);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, baseHeight);
        bgGrad.addColorStop(0, '#1E232A');
        bgGrad.addColorStop(1, '#0C0D10');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      }

      // Vignette & Frosted Gradient for Maximum Contrast
      const grad = ctx.createLinearGradient(0, 0, 0, baseHeight);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Fine golden double border
      const bMargin = 24;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bMargin, bMargin, baseWidth - bMargin * 2, baseHeight - bMargin * 2);

      // Top Centered Brand Monogram
      let cY = 74;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F59E0B';
      ctx.font = '600 11px "SF Mono", monospace';
      ctx.fillText('✦ WILDE CINEMATIC SELECTION ✦', baseWidth / 2, cY);
      cY += 34;

      // Book Title Header
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 16px "Noto Serif SC", serif';
      ctx.fillText(chineseTitle || bookTitle, baseWidth / 2, cY);
      cY += 22;

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 12px "Newsreader", serif';
      ctx.fillText(`${bookTitle} · ${chapterTitle}`, baseWidth / 2, cY);
      cY += 48;

      // English Hero Quote
      const qSize = aspectRatio === 'square' ? 22 : 26;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`;
      const qLines = wrapText(
        ctx,
        `“${quoteText.trim()}”`,
        `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`,
        baseWidth - 110
      );
      qLines.forEach((line) => {
        ctx.fillText(line, baseWidth / 2, cY);
        cY += qSize * 1.55;
      });

      // Golden Diamond Divider
      cY += 22;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(baseWidth / 2 - 60, cY);
      ctx.lineTo(baseWidth / 2 - 12, cY);
      ctx.moveTo(baseWidth / 2 + 12, cY);
      ctx.lineTo(baseWidth / 2 + 60, cY);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = '10px serif';
      ctx.fillText('◇', baseWidth / 2, cY + 3.5);
      cY += 32;

      // Chinese Translation
      if (showTranslation && translationText.trim()) {
        ctx.fillStyle = '#CBD5E1';
        const cnSize = 16;
        const cnLines = wrapChineseText(
          ctx,
          translationText.trim(),
          `500 ${cnSize}px "Songti SC", "SimSun", serif`,
          baseWidth - 120
        );
        cnLines.forEach((line) => {
          ctx.fillText(line, baseWidth / 2, cY);
          cY += cnSize * 1.6;
        });
      }

      // Author Signature
      cY += 30;
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'italic 600 14px "Newsreader", "Charter", serif';
      ctx.fillText(`—— ${author}`, baseWidth / 2, cY);

      // Bottom Clean Watermark
      const botY = baseHeight - bMargin - 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '10px "SF Mono", monospace';
      ctx.fillText('王尔德 · 精校双语原著典藏 · Standard Ebooks', baseWidth / 2, botY);
    }

    // -------------------------------------------------------------
    // ARCHETYPE 4: EX LIBRIS ARCHIVAL (复古藏书票卷轴)
    // -------------------------------------------------------------
    else if (layout === 'ex-libris') {
      // 1. Warm Antique Parchment
      ctx.fillStyle = palette.bgHex;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Archival Double Hairline Borders
      const m1 = 20;
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(m1, m1, baseWidth - m1 * 2, baseHeight - m1 * 2);

      const m2 = 28;
      ctx.strokeStyle = palette.innerBorder;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(m2, m2, baseWidth - m2 * 2, baseHeight - m2 * 2);

      // Ornate Corner Fleurons (❦)
      const corners = [
        { x: m2 + 8, y: m2 + 10 },
        { x: baseWidth - m2 - 8, y: m2 + 10 },
        { x: m2 + 8, y: baseHeight - m2 - 8 },
        { x: baseWidth - m2 - 8, y: baseHeight - m2 - 8 },
      ];
      ctx.fillStyle = palette.accentHex;
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      corners.forEach((c) => ctx.fillText('❖', c.x, c.y));

      let curY = 54;

      // Archival Circular Seal
      if (showStamp) {
        const sealX = baseWidth / 2;
        const sealY = curY + 36;
        const sealR = 34;

        ctx.strokeStyle = palette.stampBorder;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(sealX, sealY, sealR - 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '600 9px "Newsreader", serif';
        ctx.fillStyle = palette.stampBorder;
        ctx.fillText('STANDARD EBOOKS', sealX, sealY - 14);

        ctx.font = 'bold 15px serif';
        ctx.fillText('✦ 𝒲 ✦', sealX, sealY + 4);

        ctx.font = '700 8px "Noto Serif SC", serif';
        ctx.fillText('传 世 典 藏', sealX, sealY + 16);

        curY += 88;
      }

      // Inset Archival Woodcut / Photo
      if (activeImg && showImage) {
        const inW = baseWidth - 140;
        const inH = aspectRatio === 'square' ? 140 : 180;
        drawCoverImage(ctx, activeImg, (baseWidth - inW) / 2, curY, inW, inH, 2);
        ctx.strokeStyle = palette.innerBorder;
        ctx.lineWidth = 0.8;
        ctx.strokeRect((baseWidth - inW) / 2, curY, inW, inH);
        curY += inH + 24;
      }

      // Book Title
      ctx.textAlign = 'center';
      ctx.fillStyle = palette.textHex;
      ctx.font = '600 18px "Noto Serif SC", serif';
      ctx.fillText(chineseTitle || bookTitle, baseWidth / 2, curY);
      curY += 22;

      ctx.fillStyle = palette.subtextHex;
      ctx.font = 'italic 12px "Newsreader", serif';
      ctx.fillText(`${bookTitle} · ${chapterTitle}`, baseWidth / 2, curY);
      curY += 34;

      // English Quote Body
      const qSize = aspectRatio === 'square' ? 18 : 22;
      ctx.fillStyle = palette.textHex;
      ctx.font = `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`;
      const qLines = wrapText(
        ctx,
        `“${quoteText.trim()}”`,
        `italic 600 ${qSize}px "Newsreader", "Charter", "Georgia", serif`,
        baseWidth - 110
      );
      qLines.forEach((line) => {
        ctx.fillText(line, baseWidth / 2, curY);
        curY += qSize * 1.5;
      });

      // Chinese Translation
      if (showTranslation && translationText.trim()) {
        curY += 16;
        ctx.fillStyle = palette.subtextHex;
        const cnSize = 15;
        const cnLines = wrapChineseText(
          ctx,
          translationText.trim(),
          `500 ${cnSize}px "Songti SC", "SimSun", serif`,
          baseWidth - 120
        );
        cnLines.forEach((line) => {
          ctx.fillText(line, baseWidth / 2, curY);
          curY += cnSize * 1.6;
        });
      }

      // Byline
      curY += 24;
      ctx.fillStyle = palette.accentHex;
      ctx.font = 'italic 600 13px "Newsreader", serif';
      ctx.fillText(`—— ${author}`, baseWidth / 2, curY);

      // Watermark Footer
      const footY = baseHeight - m1 - 18;
      ctx.fillStyle = palette.subtextHex;
      ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('王尔德 · Wilde | 精校双语原著典藏 · Standard Ebooks', baseWidth / 2, footY);
    }

    // -------------------------------------------------------------
    // ARCHETYPE 5: MIDNIGHT OBSIDIAN (黑胶暗夜极简)
    // -------------------------------------------------------------
    else if (layout === 'midnight') {
      ctx.fillStyle = '#0F1115';
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Subtle technical grid accent
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 40; x < baseWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, baseHeight);
        ctx.stroke();
      }

      const pX = 54;
      let mY = 64;

      // Technical Header Stamp
      ctx.fillStyle = '#D97706';
      ctx.font = '600 11px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('WILDE OBSIDIAN / ARCHIVE № 8217', pX, mY);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(chapterTitle.toUpperCase(), baseWidth - pX, mY);
      mY += 16;

      ctx.strokeStyle = '#272C35';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX, mY);
      ctx.lineTo(baseWidth - pX, mY);
      ctx.stroke();
      mY += 34;

      // Inset image with cold dark border
      if (activeImg && showImage) {
        const iH = aspectRatio === 'square' ? 140 : 190;
        drawCoverImage(ctx, activeImg, pX, mY, baseWidth - pX * 2, iH, 4);
        ctx.strokeStyle = '#363D49';
        ctx.lineWidth = 1;
        ctx.strokeRect(pX, mY, baseWidth - pX * 2, iH);
        mY += iH + 34;
      }

      // Quote Body
      const qS = aspectRatio === 'square' ? 20 : 24;
      ctx.fillStyle = '#F3F5F8';
      ctx.font = `italic 600 ${qS}px "Newsreader", "Charter", "Georgia", serif`;
      ctx.textAlign = 'left';

      const lines = wrapText(
        ctx,
        `“${quoteText.trim()}”`,
        `italic 600 ${qS}px "Newsreader", "Charter", "Georgia", serif`,
        baseWidth - pX * 2
      );
      lines.forEach((l) => {
        ctx.fillText(l, pX, mY);
        mY += qS * 1.55;
      });

      // Translation
      if (showTranslation && translationText.trim()) {
        mY += 20;
        ctx.fillStyle = '#94A3B8';
        const cnS = 15;
        const cnL = wrapChineseText(
          ctx,
          translationText.trim(),
          `500 ${cnS}px "Songti SC", "SimSun", serif`,
          baseWidth - pX * 2
        );
        cnL.forEach((l) => {
          ctx.fillText(l, pX, mY);
          mY += cnS * 1.6;
        });
      }

      // Byline
      mY += 28;
      ctx.fillStyle = '#D97706';
      ctx.font = '600 13px "SF Mono", monospace';
      ctx.fillText(`— ${author} / 《${chineseTitle || bookTitle}》`, pX, mY);

      // Technical Footer
      const bY = baseHeight - 44;
      ctx.strokeStyle = '#272C35';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX, bY - 14);
      ctx.lineTo(baseWidth - pX, bY - 14);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px "SF Mono", monospace';
      ctx.fillText('STANDARD EBOOKS ARCHIVAL INTEGRITY', pX, bY);
      ctx.textAlign = 'right';
      ctx.fillText('WILDE CANON ARCHIVE', baseWidth - pX, bY);
    }

    ctx.restore();
    try {
      setPreviewDataUrl(canvas.toDataURL('image/png', 0.95));
    } catch {
      // ignore
    }
    setIsRendering(false);
  }, [
    layout,
    aspectRatio,
    paletteId,
    quoteText,
    translationText,
    showImage,
    filter,
    overlayDarkness,
    showTranslation,
    showMetadata,
    showStamp,
    bookTitle,
    chineseTitle,
    author,
    chapterTitle,
    drawCoverImage,
    imageOffsetY,
    imageOffsetX,
  ]);

  // Load image whenever source changes
  useEffect(() => {
    if (!showImage) {
      activeImageElementRef.current = null;
      renderCanvas();
      return;
    }

    const imageSource = customImageSrc || PRESET_IMAGES.find((p) => p.id === selectedPresetId)?.url;
    if (!imageSource) {
      activeImageElementRef.current = null;
      renderCanvas();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      activeImageElementRef.current = img;
      renderCanvas();
    };
    img.onerror = () => {
      console.warn('[QuoteCard] Failed to load remote image, rendering with fallback texture');
      activeImageElementRef.current = null;
      renderCanvas();
    };
    img.src = imageSource;
  }, [selectedPresetId, customImageSrc, showImage, renderCanvas]);

  // Re-render when config changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(renderCanvas, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderCanvas]);

  if (!isOpen) return null;

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Wilde_Card_${layout}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setIsCopiedImage(true);
          setTimeout(() => setIsCopiedImage(false), 2000);
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      handleDownload();
    }
  };

  // Copy Text
  const handleCopyText = () => {
    const textToCopy = `“${quoteText.trim()}”\n\n${
      translationText.trim() ? `${translationText.trim()}\n\n` : ''
    }—— ${author}《${chineseTitle || bookTitle}》\n王尔德 · 精校双语典藏`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none animate-in fade-in duration-200">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div
        className="relative z-10 w-full max-w-5xl max-h-[94vh] bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row text-[var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Real-Time Preview Area */}
        <div className="flex-1 bg-[var(--color-paper-2)]/60 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[var(--color-rule)]">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-[11px] font-meta-mono text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              卡片即时渲染预览
            </span>

            {/* Quick Aspect Ratio Selector */}
            <div className="flex items-center gap-1 bg-[var(--color-paper)] p-1 rounded-lg border border-[var(--color-rule)] text-[11px]">
              {(
                [
                  { id: 'portrait', label: '9:16 长图' },
                  { id: 'classic', label: '4:5 经典' },
                  { id: 'square', label: '1:1 方幅' },
                ] as const
              ).map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    aspectRatio === ar.id
                      ? 'bg-[var(--color-accent)] text-white font-medium'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas & Mobile-friendly Image Preview */}
          <div className="relative w-full max-w-[360px] sm:max-w-[400px] shadow-2xl rounded-xl overflow-hidden border border-[var(--color-rule)] bg-black/5 transition-all">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Wilde Quote Card Preview"
                className="w-full h-auto block select-auto"
                style={{ maxHeight: '64vh', objectFit: 'contain' }}
              />
            ) : null}
            <canvas
              ref={canvasRef}
              className={`w-full h-auto select-none pointer-events-none ${previewDataUrl ? 'hidden' : 'block'}`}
              style={{ maxHeight: '64vh', objectFit: 'contain' }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between w-full max-w-[400px] px-1 text-[11px] font-meta-mono text-[var(--color-ink-muted)]">
            <span>2x Retina 超清画质导出</span>
            <span className="text-[var(--color-accent)] font-medium">手机长按可直接存图</span>
          </div>
        </div>

        {/* Right Side: Rich Customization Workbench */}
        <div className="w-full lg:w-[420px] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[92vh] space-y-5 bg-[var(--color-paper)]">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
              <div>
                <h3 className="text-sm font-semibold font-book-serif text-[var(--color-ink)]">
                  金句卡片工坊
                </h3>
                <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                  多种装帧版面 · 支持自主配图
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                title="关闭 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Layout Template Archetype */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>装帧版式风格</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'polaroid', name: '拍立得光影', desc: '相纸边框 · 温暖感性' },
                    { id: 'editorial', name: '名刊极简', desc: '名作留白 · 大号引号' },
                    { id: 'cinematic', name: '全景大片', desc: '全幅插画 · 电影光影' },
                    { id: 'ex-libris', name: '典藏藏书票', desc: '双线角花 · 火漆徽印' },
                    { id: 'midnight', name: '墨玉黑胶', desc: '深邃暗夜 · 现代机巧' },
                  ] as { id: CardLayoutId; name: string; desc: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      layout === item.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]'
                        : 'border-[var(--color-rule)] hover:border-[var(--color-rule-active)] bg-[var(--color-paper-2)]'
                    }`}
                  >
                    <span className="text-xs font-medium text-[var(--color-ink)]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono truncate">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Photo / Background Selection (Upload or Presets) */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>画报插图 / 自主配图</span>
                </label>
                <label className="text-[11px] flex items-center gap-1 text-[var(--color-ink-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showImage}
                    onChange={(e) => setShowImage(e.target.checked)}
                    className="accent-[var(--color-accent)] w-3.5 h-3.5"
                  />
                  <span>启用插图</span>
                </label>
              </div>

              {showImage && (
                <div className="space-y-2.5 bg-[var(--color-paper-2)] p-3 rounded-xl border border-[var(--color-rule)]">
                  {/* Custom Upload Trigger */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-dashed border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{customImageSrc ? '更换自主上传照片' : '上传我的照片 / 手机相册'}</span>
                    </button>

                    {customImageSrc && (
                      <button
                        onClick={() => setCustomImageSrc(null)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="清除自定义照片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preset Fine Art Thumbnails */}
                  <div>
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono block mb-1.5">
                      或选择古典传世名画：
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setCustomImageSrc(null);
                            setSelectedPresetId(preset.id);
                          }}
                          className={`relative rounded-lg overflow-hidden border aspect-4/3 transition-all cursor-pointer group ${
                            !customImageSrc && selectedPresetId === preset.id
                              ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
                              : 'border-[var(--color-rule)] opacity-75 hover:opacity-100'
                          }`}
                          title={`${preset.name} - ${preset.artist}`}
                        >
                          <img
                            src={preset.thumb}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate text-center font-meta-mono">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Filters & Darkness Overlay */}
                  <div className="pt-2 border-t border-[var(--color-rule)] flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--color-ink-muted)] font-meta-mono">影调:</span>
                      {(['natural', 'sepia', 'noir'] as ImageFilterId[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                            filter === f
                              ? 'bg-[var(--color-accent)] text-white font-medium'
                              : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]'
                          }`}
                        >
                          {f === 'natural' ? '原色' : f === 'sepia' ? '暖棕' : '黑白'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-ink-muted)] font-meta-mono">遮罩:</span>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={overlayDarkness}
                        onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))}
                        className="w-18 accent-[var(--color-accent)] cursor-pointer"
                        title="调整背景变暗程度以确保文字清晰辨识"
                      />
                    </div>
                  </div>

                  {/* Photo Framing / Dual-Axis Position Offset */}
                  <div className="pt-2 border-t border-[var(--color-rule)] space-y-2">
                    {/* Vertical (Y) Offset */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                          <span className="text-[var(--color-ink)] font-meta-mono font-medium">垂直取景 (上下移动)</span>
                        </div>
                        <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono">
                          {imageOffsetY <= 25 ? '靠上 · 人像特写' : imageOffsetY >= 75 ? '靠下 · 全景远景' : '居中'} ({imageOffsetY}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setImageOffsetY(15)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetY <= 25
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="焦点靠上：呈现王尔德肖像面容、天空等核心细节"
                          >
                            靠上
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageOffsetY(50)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetY > 25 && imageOffsetY < 75
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="居中对称取景"
                          >
                            居中
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageOffsetY(85)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetY >= 75
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="焦点靠下"
                          >
                            靠下
                          </button>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={imageOffsetY}
                          onChange={(e) => setImageOffsetY(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[var(--color-accent)] cursor-pointer h-1.5"
                          title="自由滑动微调图片上下展示位置"
                        />
                      </div>
                    </div>

                    {/* Horizontal (X) Offset */}
                    <div className="space-y-1 pt-1.5 border-t border-[var(--color-rule)]/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-ink)] font-meta-mono font-medium">水平取景 (左右移动)</span>
                        <span className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono">
                          {imageOffsetX <= 25 ? '靠左' : imageOffsetX >= 75 ? '靠右' : '居中'} ({imageOffsetX}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setImageOffsetX(15)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetX <= 25
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="焦点靠左"
                          >
                            靠左
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageOffsetX(50)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetX > 25 && imageOffsetX < 75
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="居中对称取景"
                          >
                            居中
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageOffsetX(85)}
                            className={`px-2 py-0.5 rounded text-[10px] font-meta-mono cursor-pointer transition-colors ${
                              imageOffsetX >= 75
                                ? 'bg-[var(--color-accent)] text-white font-medium shadow-2xs'
                                : 'bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)]'
                            }`}
                            title="焦点靠右"
                          >
                            靠右
                          </button>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={imageOffsetX}
                          onChange={(e) => setImageOffsetX(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[var(--color-accent)] cursor-pointer h-1.5"
                          title="自由滑动微调横版图片左右展示位置"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Paper Tone Palettes */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>纸张色温</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.keys(PALETTES) as CardThemeId[]).map((tid) => {
                  const p = PALETTES[tid];
                  const isActive = paletteId === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => setPaletteId(tid)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isActive
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: p.bgHex }}
                      />
                      <span className="text-[10px] text-[var(--color-ink)] font-meta-mono truncate max-w-full">
                        {p.name.slice(0, 2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Text Content Customization */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-ink)] font-meta-mono flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>编辑金句与对译</span>
                </label>
                <button
                  onClick={() => setIsEditingText(!isEditingText)}
                  className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  {isEditingText ? '完成' : '编辑文本'}
                </button>
              </div>

              {isEditingText ? (
                <div className="space-y-2 bg-[var(--color-paper-2)] p-2.5 rounded-xl border border-[var(--color-rule)]">
                  <div>
                    <span className="text-[10px] text-[var(--color-ink-muted)] block mb-0.5">英文原句：</span>
                    <textarea
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] text-[var(--color-ink)] resize-none focus:outline-hidden focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-ink-muted)] block mb-0.5">中文译文：</span>
                    <textarea
                      value={translationText}
                      onChange={(e) => setTranslationText(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] text-[var(--color-ink)] resize-none focus:outline-hidden focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--color-paper-2)] p-2.5 rounded-xl border border-[var(--color-rule)] space-y-1">
                  <p className="text-xs font-book-serif text-[var(--color-ink)] line-clamp-2 italic">
                    “{quoteText}”
                  </p>
                  {translationText && (
                    <p className="text-xs text-[var(--color-ink-2)] line-clamp-2 font-medium">
                      {translationText}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 5. Toggles for translation & metadata */}
            <div className="mt-4 space-y-1.5 bg-[var(--color-paper-2)] p-2.5 rounded-xl border border-[var(--color-rule)] text-xs">
              <label className="flex items-center justify-between cursor-pointer py-0.5">
                <span className="text-[var(--color-ink)]">呈现中文文学译文</span>
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="accent-[var(--color-accent)] w-3.5 h-3.5 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 border-t border-[var(--color-rule)]">
                <span className="text-[var(--color-ink)]">附注章节与原著名目</span>
                <input
                  type="checkbox"
                  checked={showMetadata}
                  onChange={(e) => setShowMetadata(e.target.checked)}
                  className="accent-[var(--color-accent)] w-3.5 h-3.5 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 border-t border-[var(--color-rule)]">
                <span className="text-[var(--color-ink)]">印记火漆首印章</span>
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={(e) => setShowStamp(e.target.checked)}
                  className="accent-[var(--color-accent)] w-3.5 h-3.5 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="space-y-2 pt-3 border-t border-[var(--color-rule)]">
            <button
              onClick={handleDownload}
              disabled={isDownloading || isRendering}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-accent)] hover:opacity-90 active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
                onClick={handleCopyImage}
                className="py-2 px-3 rounded-xl bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] active:scale-[0.98] border border-[var(--color-rule)] text-[var(--color-ink)] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="直接复制图片到系统剪贴板，支持直接在微信、微信朋友圈、小红书网页端粘贴"
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
                className="py-2 px-3 rounded-xl bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] active:scale-[0.98] border border-[var(--color-rule)] text-[var(--color-ink)] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="复制中英双语文字文案"
              >
                {isCopiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>已复制文字</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>复制文字</span>
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
