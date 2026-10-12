# Design — EnglishReader

A locked design system for EnglishReader. Every view reads this file before emitting code.
Created via Hallmark anti-AI-slop design methodology.

## Genre
editorial

## Macrostructure family
- **Bookshelf / Home**: Curated Catalog (N6 Masthead with small-caps date/issue row, Asymmetric Featured Reading Bookcloth Spine, Hairline Broadsheet Filter Bar, Tactile Bookcloth Grid with physical spine depth and foil typography, Dense Colophon Close).
- **Reader View**: Dual-Leaf Book Spread (Balanced 45–68ch measure, Roman chapter titles, Deckle edge margins, Quiet floating dock, Oxford-grade dictionary popover).

## Theme Tokens (OKLCH)
Light Mode (Warm Parchment / Traditional Book):
- `--color-paper`:   oklch(96.8% 0.012 75) /* Warm cream book paper */
- `--color-paper-2`: oklch(93.8% 0.015 75) /* Antique card & spine surface */
- `--color-ink`:     oklch(18.2% 0.012 60) /* Deep charcoal printing ink */
- `--color-ink-2`:   oklch(42.0% 0.010 60) /* Muted secondary annotation ink */
- `--color-rule`:    oklch(85.0% 0.012 75) /* Hairline warm bookbinding rule */
- `--color-accent`:  oklch(56.0% 0.165 48) /* Vintage bookbinding ochre / amber */
- `--color-focus`:   oklch(52.0% 0.170 50) /* Crisp focus indicator */

Dark Mode (Library Midnight / Moroccan Leather):
- `--color-paper`:   oklch(16.5% 0.009 55) /* Deep warm leather charcoal, never pure black */
- `--color-paper-2`: oklch(20.5% 0.011 55) /* Elevated reading card surface */
- `--color-ink`:     oklch(93.5% 0.006 75) /* Soft cream ink, never harsh white */
- `--color-ink-2`:   oklch(68.0% 0.008 65) /* Secondary muted metadata */
- `--color-rule`:    oklch(28.0% 0.008 55) /* Subtle binding hairline */
- `--color-accent`:  oklch(68.0% 0.150 52) /* Warm amber highlight */
- `--color-focus`:   oklch(65.0% 0.160 52)

## Book Spine & Cloth Palette (Tactile, Non-Gradient)
Physical book covers avoid AI multi-hue rainbow gradients (`from-purple via-pink to-cyan` banned). Instead, authentic bookcloth tones:
- Burgundy Cloth: `bg-[#4a151b] border-[#5e1d25]`
- Forest Morocco: `bg-[#183124] border-[#224432]`
- Oxford Navy: `bg-[#162238] border-[#1e2f4c]`
- Amber Ochre: `bg-[#3f2814] border-[#56371c]`
- Slate Charcoal: `bg-[#24282e] border-[#323740]`
- Plum Calf: `bg-[#341b31] border-[#482544]`
- Olive Buckram: `bg-[#272d1d] border-[#373e28]`
- Terracotta: `bg-[#48221c] border-[#612f27]`

## Typography
- **Display & Headings**: Roman Serif (`Newsreader`, `Charter`, `Bitstream Charter`, `Georgia`, serif), weight 400 & 600, `font-style: normal` (italic headers strictly banned by Gate 38a).
- **Body Prose**: Workhorse Serif (`Newsreader`, `Charter`, `Cambria`, `Georgia`), line-height 1.62, optimal measure 50–68ch.
- **Outlier / Metadata**: `Geist Mono` for CEFR level badges, Lexile numbers, word counts, and page markers.
- **UI & Navigation**: `Geist` clean grotesque sans, tracking tight (-0.01em).

## Microinteractions & Rules
- **No `transition-all`**: explicitly declare animated properties (`transition-[color,background-color,border-color,opacity,transform]`).
- **No `hover:scale-105`**: replace with physical `translate-y-[-2px]` and authentic elevation shadow.
- **No glassmorphism or aurora blobs**: surfaces are paper and bookcloth.
- **Mobile non-negotiables**: `overflow-x: clip`, 320/375/414/768px responsive verification, no overflowing cards.
