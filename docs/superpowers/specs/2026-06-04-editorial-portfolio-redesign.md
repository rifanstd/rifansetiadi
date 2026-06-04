# Editorial Portfolio Redesign — Design Spec

**Date:** 2026-06-04
**Author:** OpenCode (Brainstorming + frontend-design)
**Status:** Approved

---

## 1. Overview

Redesign the existing single-page portfolio from a neutral/monochrome aesthetic into a **Bold Editorial / Magazine** direction with an **Ink & Amber** color palette. The redesign preserves the existing architecture (React 19 + TypeScript + Vite, data-driven JSON, 8-section SPA) while elevating every section with distinctive typography, asymmetric layouts, and editorial-quality visual design.

---

## 2. Goals

- Transform a generic neutral portfolio into a bold, memorable editorial experience
- Establish a premium personal brand aligned with Mobile Developer & AI Enthusiast positioning
- Maintain all existing functionality (data-driven, dark/light mode, scroll spy, smooth scroll, mobile nav)
- Achieve production-quality code that passes `lint`, `typecheck`, and `build`

---

## 3. Design Direction

| Aspect | Decision |
|--------|----------|
| Aesthetic | Bold Editorial / Magazine |
| Color Palette | Ink & Amber |
| Typography (Display) | Playfair Display (400, 700, 900) |
| Typography (Body) | DM Sans (400, 500, 600) |
| Layout | Hybrid — Hero & Projects experimental, others refined editorial |
| Implementation | Section-by-section redesign (Approach B) |

---

## 4. Foundation: Theme & Design Tokens

### 4.1 Color Palette — Ink & Amber

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--background` | `#FAF8F5` (warm paper/off-white) | `#0D0D0D` (ink black) |
| `--foreground` | `#1A1A1A` (near-black) | `#F0EDE8` (warm off-white) |
| `--card` | `#FAF8F5` | `#141414` |
| `--card-foreground` | `#1A1A1A` | `#F0EDE8` |
| `--primary` | `#C8872A` (amber gold) | `#E8B84B` (bright amber) |
| `--primary-foreground` | `#FAF8F5` | `#0D0D0D` |
| `--secondary` | `#F5F0E8` (warm sand) | `#1C1C18` (dark ink) |
| `--secondary-foreground` | `#1A1A1A` | `#F0EDE8` |
| `--muted` | `#EDE8E0` (stone) | `#262620` (deep ink) |
| `--muted-foreground` | `#6B6560` (warm gray) | `#A09B94` |
| `--accent` | `#F5F0E8` | `#1C1C18` |
| `--accent-foreground` | `#1A1A1A` | `#F0EDE8` |
| `--border` | `#E0D8CC` (warm gray) | `#2A2A24` (subtle ink) |
| `--input` | `#E0D8CC` | `#2A2A24` |
| `--ring` | `#C8872A` (amber) | `#E8B84B` (amber) |
| `--destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) |

### 4.2 Typography

- **Display (Headings):** Playfair Display — weights 400, 700, 900
  - Via `@fontsource-variable/playfair-display` or Google Fonts CDN
  - Used for: section headings, hero name, stat numbers, project titles
- **Body:** DM Sans — weights 400, 500, 600
  - Via `@fontsource-variable/dm-sans` or Google Fonts CDN
  - Used for: paragraphs, nav links, tags, UI labels, descriptions

### 4.3 Background Texture

- Subtle grain/noise texture via CSS `::before` pseudo-element on body or main wrapper
- Implemented with a small SVG noise pattern or CSS `background-image` with repeating gradient
- Applied globally — opacity ~3-5% in light mode, ~5-8% in dark mode

### 4.4 Shared Section Conventions

- **Section heading:** Playfair Display, `text-4xl sm:text-5xl`, aligned left
- **Amber decorative element:** `w-16 h-px` or `w-1 h-8` amber line adjacent to heading (not centered below)
- **Section padding:** `py-24 md:py-32` (more generous than previous `py-20`)
- **Content width:** `max-w-7xl` (wider than previous `max-w-6xl`)
- **Staggered reveal animation:** FadeIn wrapper with staggered `delay` per child element

---

## 5. Section Designs

### 5.1 Hero (Experimental Layout)

**Layout:** Asymmetric two-column — text left, photo right. Magazine cover style.

- **Name:** Playfair Display 900, `text-7xl md:text-8xl lg:text-9xl`, tracking tight, leading tight. May break into multiple lines if long
- **Amber line:** `w-24 h-1 bg-primary` below name, aligned left
- **Tagline:** DM Sans semibold, `text-primary`, `text-2xl md:text-3xl`
- **Headline:** DM Sans regular, `text-muted-foreground`, `text-lg`, max-width 500px
- **Profile Image:** `w-72 h-72` (larger than previous `w-40 h-40`), `rounded-full`, `border-4 border-primary`, subtle shadow, positioned right
- **CTA Buttons:**
  - Primary: Amber solid — "View My Work" → scroll to #projects
  - Secondary: Amber outline — "Download CV" → link to CV PDF
- **Social Links:** Small icon buttons (GitHub, LinkedIn, Twitter), muted, hover amber
- **Scroll Indicator:** ChevronDown icon, bouncing animation, centered at bottom
- **Background:** Subtle radial gradient from amber/5 at top-right corner (near photo)
- **Animation:** Staggered reveal — name → amber line → tagline + headline → photo (fade+scale) → CTAs → social → scroll indicator. 100ms delay between each

### 5.2 About (Refined Editorial)

**Layout:** Two-column — narrative left (65%), quick-info right (35%).

- **Heading:** "About" — Playfair Display, aligned left, with amber line to the right of the heading (inline horizontal)
- **Left Column:**
  - Drop cap on first letter — Playfair Display, `text-primary`, `text-5xl`, `float-left`, `leading-none`
  - Body text: DM Sans, leading relaxed, `text-base sm:text-lg`
- **Right Column:**
  - Three info items in a subtle bordered card
  - Each with small icon (MapPin, Calendar, CheckCircle) + text
  - Availability badge: `bg-green-100 text-green-700` with green dot

### 5.3 Experience (Refined Editorial)

**Layout:** Single-column vertical timeline (replaces previous alternating zigzag).

- **Heading:** Amber line left + "Experience" — Playfair Display, aligned left
- **Timeline line:** Vertical `w-px bg-border` from left edge
- **Timeline dot:** Amber solid `w-3 h-3 rounded-full bg-primary` at each node
- **Period text:** DM Sans `text-xs`, `text-muted-foreground`, `uppercase tracking-wide` — above each card
- **Card:**
  - Subtle container with `border-l-2 border-primary` (left amber accent)
  - Role: Playfair Display `text-xl font-bold text-foreground`
  - Company + type badge: DM Sans, inline
  - Description: bullet list with amber dot (`list-disc text-primary`), DM Sans `text-sm`
  - Background: `bg-muted/30`
- **Collapse:** Show first 4 experiences by default. "Show all N experiences" toggle button below (there are 9 entries currently)
- **Background:** Alternate stripe — even items `bg-muted/20`, odd items transparent

### 5.4 Stats (Refined + Dark Section)

**Layout:** Horizontal spread — 4 large numbers with generous spacing.

- **Heading:** Amber line left + "By The Numbers" — Playfair Display, aligned left
- **Stat Items:**
  - Number: Playfair Display 900, `text-6xl md:text-7xl lg:text-8xl`, `text-primary`, tracking tight
  - Suffix: inline, same size
  - Label: DM Sans `text-xs sm:text-sm`, `uppercase tracking-widest`, `text-muted-foreground`, below number
  - Layout: `flex justify-between items-center`, horizontal row
- **Separator:** Full-width amber line `w-full h-px bg-primary/30` below the stats row
- **Counter:** Existing `useCounter` hook — animate from 0 when in view
- **Background:** Dark ink section (`bg-foreground text-background` inverted) for high-impact contrast. Numbers glow in amber

### 5.5 Projects (Experimental Layout)

**Layout:** 1 featured project (hero card, horizontal) + grid for remaining projects.

- **Heading:** Amber line left + "Projects" — Playfair Display, aligned left
- **Featured Card (first project):**
  - Full-width, layout horizontal
  - Image: `aspect-[4/3]`, `object-cover`, rounded only on left side, merges with text panel
  - Text panel (right 45%): title (Playfair Display `text-3xl text-primary`), description (DM Sans, 3-4 lines), tags (amber outline badges), link button "View Project →"
  - Hover: image scale 105%, subtle amber glow border
- **Secondary Cards (2-column grid):**
  - Image on top, text below
  - Title: Playfair Display `text-xl`
  - Tags + GitHub link
  - Hover: `-translate-y-1`, shadow with amber tint
- **Empty State:** Dashed amber border placeholder card with "More coming soon" — designed elegantly, not raw text
- **Background:** Dark ink background for contrast — makes project images pop, amber accents standout

### 5.6 Skills (Refined Editorial)

**Layout:** Grouped by category, 2-column grid. Magazine "credits" style.

- **Heading:** Amber line left + "Tech Stack" — Playfair Display, aligned left
- **Grid:** `grid-cols-1 md:grid-cols-2 gap-8`
- **Each Category:**
  - Label: DM Sans `text-xs`, `uppercase tracking-widest`, `text-primary` — like magazine section label
  - Amber divider: `w-8 h-px bg-primary/50` below label
  - Skills: horizontal row with amber dot separator (`· text-primary/50`)
  - Each skill: DM Sans `text-base`, `text-foreground`. Hover → `text-primary`
- **No badge/box wrapping** — clean text flow like magazine contributors list

### 5.7 Contact (Refined Editorial)

**Layout:** Centered bold CTA. Full-width impactful.

- **Heading:** "Let's work together" — Playfair Display 900, `text-5xl md:text-7xl`, centered, multi-line
- **Amber line:** Below heading, centered
- **Subtext:** DM Sans, centered, `max-w-md`, `text-muted-foreground`, italic styling
- **Email:** Card container, horizontal — mail icon + email text + copy button. Border subtle, hover amber
- **Copy feedback:** "Email copied!" — `text-primary text-sm`, appears below email card
- **Social Links:** Three outline buttons (GitHub, LinkedIn, Twitter), horizontal row, centered. Hover: `bg-primary/10 border-primary`
- **Hire Me CTA:** Amber solid button, large, Playfair Display text, `text-lg`
- **Background:** Dark ink section for contrast
- **Animation:** Staggered reveal — heading → subtext → email → social → CTA, 100ms each

### 5.8 Footer

- **Content:** "© 2026 Rifan Setiadi. Built with React, Tailwind CSS & shadcn/ui."
- **Style:** DM Sans, `text-xs`, `text-muted-foreground`, centered, `py-8`
- **No amber** — let previous sections carry the visual weight. Subtle and minimal

---

## 6. Navbar (Update)

- **Logo:** Replace "Portfolio" text with "Rifan Setiadi" — Playfair Display, `text-primary`
- **Nav links:** DM Sans, `text-sm`, `font-medium`
- **Active state:** `text-primary bg-primary/10` (amber tint, keeps current pattern)
- **Scroll behavior:** Glass effect on scroll — `bg-background/80 backdrop-blur-md` (unchanged)
- **Mobile:** Sheet drawer (unchanged functionality)
- **Theme toggle:** Sun/Moon icon (unchanged)

---

## 7. Animations

| Effect | Implementation |
|--------|---------------|
| Section stagger reveal | FadeIn wrapper with `delay` prop per child, via `useInView` |
| Hero photo entry | Scale from 0.9 + fade, 600ms |
| Stats counter | Existing `useCounter` hook (unchanged) |
| Card hover | `transition-all duration-300 hover:-translate-y-1` |
| Feature project hover | Image scale + amber glow border |
| Nav background | Scroll > 50px detection (unchanged) |
| Scroll indicator | CSS `@keyframes` bounce + infinite |
| Copy feedback | Conditional render with 2s timeout (unchanged) |
| Experience collapse | CSS max-height transition |

---

## 8. Font Loading

- Replace `@fontsource-variable/inter` with:
  - `@fontsource-variable/playfair-display` (or Google Fonts CSS import)
  - `@fontsource-variable/dm-sans` (or Google Fonts CSS import)
- Update `--font-sans` and `--font-heading` in `index.css` `@theme inline`
- `--font-sans: 'DM Sans Variable', sans-serif;`
- `--font-heading: 'Playfair Display Variable', serif;`

---

## 9. What Stays The Same

- React 19 + TypeScript + Vite architecture
- Data-driven from `public/data/*.json` (5 files)
- All TypeScript interfaces in `src/types/portfolio.ts`
- shadcn/ui component library (Button, Card, Badge, Sheet, Separator)
- `useInView` and `useCounter` hooks
- FadeIn wrapper component (may be enhanced)
- ThemeProvider with `d` key toggle
- Dark/light mode via CSS variables
- Mobile hamburger → Sheet navigation
- Scroll spy for active section highlighting
- Smooth scroll to sections
- Email copy to clipboard
- All data files remain unchanged (content stays)

---

## 10. What Changes

| Before | After |
|--------|-------|
| Inter font | Playfair Display + DM Sans |
| Neutral monochrome palette | Ink & Amber palette |
| Centered headings with line below | Left-aligned headings with amber line adjacent |
| `max-w-6xl` | `max-w-7xl` |
| `py-20` sections | `py-24 md:py-32` sections |
| Hero: centered, small photo | Hero: asymmetric two-column, large photo |
| Experience: alternating zigzag timeline | Experience: single-column left-aligned timeline |
| Experience: all 9 entries shown | Experience: collapse to 4, expandable |
| Projects: uniform 3-col grid | Projects: 1 featured hero + 2-col grid |
| Skills: flat wrap of badge-boxes | Skills: grouped by category, magazine credits style |
| Stats: 2x2 grid on plain bg | Stats: horizontal row on dark ink bg |
| Contact: default spacing | Contact: bold typography, dark bg |
| Flat white/dark backgrounds | Paper texture with noise grain |
| Gray accent lines | Amber accent lines |

---

## 11. Not In Scope (YAGNI)

- No new sections added
- No data model changes
- No new dependencies (unless needed for fonts)
- No framer-motion (use CSS + existing hooks)
- No contact form
- No blog
- No testimonials
- No analytics

---

## 12. Verification

After implementation, the following must pass:

- [ ] `npm run lint` — no errors
- [ ] `npm run typecheck` — no errors
- [ ] `npm run build` — successful production build
- [ ] All 8 sections render from JSON data
- [ ] Navigation scrolls correctly and highlights active section
- [ ] Dark/light mode works across all sections
- [ ] Mobile hamburger menu functions
- [ ] Stats counter animates on scroll
- [ ] Project cards have hover effects
- [ ] Email copy button works
- [ ] Experience collapse/expand works
- [ ] Fonts load correctly (Playfair Display + DM Sans)
- [ ] Amber color visible and consistent

---

*End of Design Spec*
