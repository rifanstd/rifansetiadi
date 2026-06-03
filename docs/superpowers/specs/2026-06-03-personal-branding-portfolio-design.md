# Personal Branding Portfolio Website - Design Spec

**Date:** 2026-06-03  
**Author:** OpenCode (Brainstorming Session)  
**Status:** Approved

---

## 1. Overview

A single-page portfolio website for a **Software Engineer** specializing in **mobile development** and **AI**. The website presents the owner's personal brand through a smooth-scrolling experience with modern animations and a clean, professional design.

All content is loaded from separate JSON files, making the site easy to update without touching the codebase.

---

## 2. Goals

- Establish a professional online presence
- Showcase mobile development & AI expertise
- Display work experience and projects
- Provide easy contact channels
- Demonstrate modern web development skills (React 19, Tailwind v4, shadcn/ui)

---

## 3. Architecture

### Single-Page Layout
- One main `App.tsx` renders all sections vertically
- Fixed navigation bar at the top
- Smooth scroll to sections on nav click
- Active section highlighted in navbar based on scroll position

### Data Loading
- All content fetched from `public/data/*.json` files at app initialization
- Data cached in React state/context
- `Promise.all` to fetch all JSON files in parallel
- Loading state shown while data is being fetched

---

## 4. Data Structure (JSON Files)

All data lives in `public/data/` as separate JSON files per section:

```
public/data/
├── personal.json
├── stats.json
├── experience.json
├── projects.json
└── skills.json
```

### 4.1 personal.json
```json
{
  "name": "Rifan Setiadi",
  "tagline": "Mobile Developer & AI Enthusiast",
  "headline": "Building beautiful mobile experiences and exploring the future with AI",
  "about": "I am a passionate Software Engineer focused on mobile development. With a strong foundation in building performant, user-friendly applications and a growing interest in Artificial Intelligence, I continuously explore AI-powered solutions to create impactful digital experiences.",
  "location": "Indonesia",
  "email": "email@example.com",
  "cvUrl": "/cv.pdf",
  "availabilityStatus": "Open for collaboration",
  "profileImage": "/images/profile.jpg",
  "social": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username"
  }
}
```

### 4.2 stats.json
```json
{
  "stats": [
    { "value": "5", "suffix": "+", "label": "Years Experience" },
    { "value": "20", "suffix": "+", "label": "Projects Built" },
    { "value": "10", "suffix": "+", "label": "Apps Published" },
    { "value": "3", "suffix": "+", "label": "AI Projects" }
  ]
}
```

### 4.3 experience.json
```json
{
  "experiences": [
    {
      "role": "Senior Mobile Developer",
      "company": "Company Name",
      "period": "2023 - Present",
      "type": "Full-time",
      "description": [
        "Led development of 3+ mobile applications from scratch",
        "Implemented AI-powered features using TensorFlow Lite",
        "Mentored junior developers and conducted code reviews"
      ]
    }
  ]
}
```

### 4.4 projects.json
```json
{
  "projects": [
    {
      "title": "AI Chat Assistant",
      "description": "A mobile app integrating OpenAI API for intelligent conversation and task automation.",
      "image": "/images/projects/ai-chat.jpg",
      "tags": ["Flutter", "Dart", "OpenAI API", "Firebase"],
      "githubUrl": "https://github.com/username/ai-chat",
      "liveUrl": "https://example.com/ai-chat"
    }
  ]
}
```

### 4.5 skills.json
```json
{
  "skills": [
    { "name": "Flutter", "category": "Mobile" },
    { "name": "Dart", "category": "Mobile" },
    { "name": "Firebase", "category": "Backend" },
    { "name": "Python", "category": "AI/ML" },
    { "name": "TensorFlow", "category": "AI/ML" },
    { "name": "OpenAI API", "category": "AI/ML" },
    { "name": "Git", "category": "Tools" },
    { "name": "Figma", "category": "Tools" }
  ]
}
```

---

## 5. Sections Detail

### 5.1 Navigation (Fixed Top)
- **Position:** Fixed top, full-width, z-50
- **Background:** Transparent → blur backdrop on scroll (glassmorphism)
- **Links:** Home, About, Experience, Projects, Skills, Contact
- **Mobile:** Hamburger menu → Sheet drawer (shadcn/ui Sheet)
- **Right side:** Dark mode toggle button
- **Active state:** Underline or highlight on current section
- **shadcn/ui components:** Sheet (mobile), Separator

### 5.2 Hero Section
- **Layout:** Centered, full viewport height (`min-h-[calc(100vh-4rem)]`)
- **Profile Image:** Rounded-full, 160-200px, border ring, subtle shadow
- **Name:** H1, large, bold, gradient text optional
- **Tagline:** Text-primary/foreground, medium size
- **Headline:** Text-muted-foreground, max-width ~600px
- **CTA Buttons:**
  - Primary: "View My Work" → scroll to Projects
  - Secondary: "Download CV" → link to CV PDF
- **Social Icons:** Row of icon buttons (GitHub, LinkedIn, Twitter)
- **Scroll indicator:** Subtle bounce animation at bottom
- **shadcn/ui components:** Button
- **Icons:** lucide-react (Github, Linkedin, Twitter, Download, ChevronDown)

### 5.3 About Section
- **Heading:** "About Me" with decorative line
- **Paragraph:** 2-3 paragraphs from `personal.about`
- **Quick Info Grid:**
  - Location (MapPin icon)
  - Experience duration (Calendar icon)
  - Availability status (CheckCircle icon)
- **Status badge:** Green dot + text "Available for hire" or "Open for collaboration"
- **shadcn/ui components:** Badge (for status)
- **Icons:** lucide-react (MapPin, Calendar, CheckCircle)

### 5.4 Experience Section
- **Heading:** "Experience"
- **Layout:** Vertical timeline or stacked cards
- **Each item:**
  - Role (bold)
  - Company + type badge (Full-time/Contract/Freelance)
  - Period (muted text)
  - Description bullets
- **Timeline style:** Left border with dot markers, alternating or single column
- **shadcn/ui components:** Card
- **Icons:** lucide-react (Briefcase)

### 5.5 Projects Section
- **Heading:** "Featured Projects"
- **Layout:** Grid 1 col (mobile) / 2 col (tablet) / 3 col (desktop)
- **Card contents:**
  - Image thumbnail (aspect-video, object-cover, rounded-top)
  - Title (H3)
  - Description (2 lines max, truncate)
  - Tags (horizontal scroll or wrap)
  - Links: GitHub (external), Live Demo (external)
- **Hover effect:** Card lifts (translateY -4px), shadow increases
- **Empty state:** "More projects coming soon" if < 3 projects
- **shadcn/ui components:** Card, Badge
- **Icons:** lucide-react (Github, ExternalLink)

### 5.6 Stats Section
- **Heading:** "By The Numbers"
- **Layout:** Grid 2x2 or 4 columns
- **Each stat:**
  - Large number (H2 size, font-bold)
  - Suffix (+, %, etc.)
  - Label below
- **Animation:** Count up from 0 when entering viewport
- **No card wrapper:** Clean number display, optional subtle background

### 5.7 Skills Section
- **Heading:** "Tech Stack"
- **Layout:** Flex wrap or grid of items
- **Each skill:**
  - Name text
  - Optional: simple colored dot or icon placeholder
- **No grouping UI** (data has category but UI shows flat list)
- **Hover:** Subtle scale or background highlight

### 5.8 Contact / CTA Section
- **Heading:** "Let's Work Together"
- **Subtext:** Invitation paragraph
- **Email:** Displayed clearly with Copy button
- **Social links:** Large icon buttons (GitHub, LinkedIn, Twitter)
- **"Hire Me" button:** mailto: link with primary styling
- **shadcn/ui components:** Button
- **Icons:** lucide-react (Mail, Copy, Github, Linkedin, Twitter)

### 5.9 Footer
- **Content:**
  - "© 2026 [Name]. All rights reserved."
  - "Built with ❤️ using React, Tailwind & shadcn/ui"
- **Style:** Muted text, centered, py-8
- **No shadcn components needed**

---

## 6. Component Mapping (shadcn/ui)

| Feature | shadcn/ui Component | Install Command |
|---------|---------------------|-----------------|
| Buttons (CTA, social, copy) | Button | Already exists |
| Project cards, Experience items | Card | `npx shadcn@latest add card` |
| Tech tags, Status badges | Badge | `npx shadcn@latest add badge` |
| Mobile navigation drawer | Sheet | `npx shadcn@latest add sheet` |
| Contact section separator | Separator | `npx shadcn@latest add separator` |

**Utility:** `cn()` from `src/lib/utils.ts` for conditional classes.

---

## 7. Animations & Interactions

| Interaction | Implementation |
|-------------|----------------|
| Section fade-in | CSS `@keyframes` or Framer Motion. Triggered by Intersection Observer (`useInView` hook) |
| Hero text stagger | Fade-in with 100ms delay between elements |
| Stats counter | Custom hook counting from 0 to target value over 1.5s when in view |
| Card hover | `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg` |
| Nav background | `scroll > 50px ? bg-background/80 backdrop-blur-md : bg-transparent` |
| Active nav highlight | Intersection Observer tracking current section |
| Smooth scroll | `scroll-behavior: smooth` on html + `element.scrollIntoView()` |
| Mobile menu | Sheet slide-in from right |
| Copy email | `navigator.clipboard.writeText()` + toast feedback |

**Animation library decision:** Use CSS transitions + custom Intersection Observer hook first. If animations feel insufficient, add `framer-motion` later. **Do not install framer-motion initially** — keep dependencies minimal.

---

## 8. File Structure

```
public/
├── data/
│   ├── personal.json
│   ├── stats.json
│   ├── experience.json
│   ├── projects.json
│   └── skills.json
└── images/
    ├── profile.jpg
    └── projects/
        └── (project thumbnails)

src/
├── types/
│   └── portfolio.ts          # TypeScript interfaces for all JSON data
├── hooks/
│   ├── useInView.ts          # Intersection Observer hook
│   └── useCounter.ts         # Animated counter hook
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── sheet.tsx
│   │   └── separator.tsx
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Experience.tsx
│   ├── Projects.tsx
│   ├── Stats.tsx
│   ├── Skills.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   └── utils.ts              # cn() utility (already exists)
├── data/
│   └── fetchPortfolio.ts     # Async function to fetch all JSON files
├── App.tsx
├── main.tsx
└── index.css                 # Tailwind v4 theme (already exists)
```

---

## 9. Styling

### Tailwind v4 Configuration
- Theme already defined in `src/index.css` via `@theme inline`
- Base color: `neutral` (from AGENTS.md)
- Dark mode toggle via ThemeProvider (already exists)
- User toggles with `d` key (already exists)

### Design Tokens
- **Spacing:** Section padding `py-20` (80px) consistently
- **Max width:** Content constrained to `max-w-6xl` (72rem / 1152px)
- **Border radius:** Use shadcn defaults (rounded-lg for cards, rounded-full for images)
- **Typography:** Inter font (already via `@fontsource-variable/inter`)

### Color Usage
- **Primary text:** `text-foreground`
- **Secondary text:** `text-muted-foreground`
- **Accent/CTA:** `bg-primary text-primary-foreground`
- **Cards:** `bg-card text-card-foreground border border-border`
- **Badges:** `bg-secondary text-secondary-foreground`

---

## 10. Responsive Design

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Single column everything, hamburger nav, stacked experience cards |
| Tablet (640-1024px) | 2-column project grid, single column stats |
| Desktop (>1024px) | 3-column project grid, 4-column stats, expanded nav |

---

## 11. Assets Required

**From user:**
- `public/images/profile.jpg` — Foto profil (square, min 400x400px)
- `public/images/projects/*.jpg` — Thumbnail project (16:9 ratio)
- `public/cv.pdf` — File CV untuk download
- Content for all 5 JSON files (bisa diisi dummy data awal)

**Generated/Placeholder:**
- Project images can use `https://placehold.co/` as fallback if user doesn't have images yet
- Profile image can use placeholder avatar if not provided

---

## 12. Accessibility

- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<footer>`
- Skip-to-content link (optional)
- All images have `alt` text
- Social links have `aria-label`
- Focus visible states on all interactive elements
- Color contrast meets WCAG AA (shadcn/ui default colors already comply)

---

## 13. Not In Scope (YAGNI)

The following are **explicitly excluded** to keep scope focused:

- ❌ Testimonials / Reviews
- ❌ Blog / Articles section
- ❌ Multi-page routing
- ❌ Backend/API integration
- ❌ Contact form (only mailto: and social links)
- ❌ Admin dashboard
- ❌ CMS integration
- ❌ Analytics (Google Analytics, etc.)
- ❌ i18n / Multi-language

---

## 14. Success Criteria

- [ ] All 8 sections render correctly from JSON data
- [ ] Navigation smooth-scrolls to sections and highlights active item
- [ ] Dark mode toggle works across all sections
- [ ] Mobile hamburger menu opens/closes correctly
- [ ] Stats counter animates when scrolled into view
- [ ] All sections fade in on scroll
- [ ] Project cards have hover effects
- [ ] Email copy button works
- [ ] Download CV button links to file
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` all pass

---

*End of Design Spec*
