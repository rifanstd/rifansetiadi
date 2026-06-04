# Editorial Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio from neutral monochrome to Bold Editorial / Magazine with Ink & Amber palette.

**Architecture:** Same React 19 + TypeScript + Vite SPA. All content stays in `public/data/*.json`. Theme tokens, fonts, and all 8 section components get redesigned with new typography (Playfair Display + DM Sans), amber accent color, and editorial layouts. No new files — all edits to existing.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui v4, lucide-react, @fontsource-variable (playfair-display + dm-sans)

---

### Task 1: Install Font Packages

**Files:**
- Modify: `package.json`
- Run: `npm install`

Remove Inter, install Playfair Display and DM Sans.

- [ ] **Step 1: Install new fonts and remove Inter**

```bash
npm uninstall @fontsource-variable/inter
```

```bash
npm install @fontsource-variable/playfair-display @fontsource-variable/dm-sans
```

Expected: Packages installed without errors.

---

### Task 2: Update Theme Foundation

**Files:**
- Modify: `src/index.css`

Replace the entire CSS theme with Ink & Amber palette, new fonts, and background texture.

- [ ] **Step 1: Replace `src/index.css` with the new theme**

Write the complete new `index.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/playfair-display";
@import "@fontsource-variable/dm-sans";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-heading: 'Playfair Display Variable', serif;
    --font-sans: 'DM Sans Variable', sans-serif;
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --color-foreground: var(--foreground);
    --color-background: var(--background);
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --radius-2xl: calc(var(--radius) * 1.8);
    --radius-3xl: calc(var(--radius) * 2.2);
    --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
    --background: #FAF8F5;
    --foreground: #1A1A1A;
    --card: #FAF8F5;
    --card-foreground: #1A1A1A;
    --popover: #FAF8F5;
    --popover-foreground: #1A1A1A;
    --primary: #C8872A;
    --primary-foreground: #FAF8F5;
    --secondary: #F5F0E8;
    --secondary-foreground: #1A1A1A;
    --muted: #EDE8E0;
    --muted-foreground: #6B6560;
    --accent: #F5F0E8;
    --accent-foreground: #1A1A1A;
    --destructive: oklch(0.577 0.245 27.325);
    --border: #E0D8CC;
    --input: #E0D8CC;
    --ring: #C8872A;
    --chart-1: #C8872A;
    --chart-2: #8B6914;
    --chart-3: #6B6560;
    --chart-4: #4A4540;
    --chart-5: #2A2520;
    --radius: 0.5rem;
    --sidebar: #FAF8F5;
    --sidebar-foreground: #1A1A1A;
    --sidebar-primary: #C8872A;
    --sidebar-primary-foreground: #FAF8F5;
    --sidebar-accent: #F5F0E8;
    --sidebar-accent-foreground: #1A1A1A;
    --sidebar-border: #E0D8CC;
    --sidebar-ring: #C8872A;
}

.dark {
    --background: #0D0D0D;
    --foreground: #F0EDE8;
    --card: #141414;
    --card-foreground: #F0EDE8;
    --popover: #141414;
    --popover-foreground: #F0EDE8;
    --primary: #E8B84B;
    --primary-foreground: #0D0D0D;
    --secondary: #1C1C18;
    --secondary-foreground: #F0EDE8;
    --muted: #262620;
    --muted-foreground: #A09B94;
    --accent: #1C1C18;
    --accent-foreground: #F0EDE8;
    --destructive: oklch(0.704 0.191 22.216);
    --border: #2A2A24;
    --input: #2A2A24;
    --ring: #E8B84B;
    --chart-1: #E8B84B;
    --chart-2: #C8872A;
    --chart-3: #A09B94;
    --chart-4: #6B6560;
    --chart-5: #4A4540;
    --sidebar: #0D0D0D;
    --sidebar-foreground: #F0EDE8;
    --sidebar-primary: #E8B84B;
    --sidebar-primary-foreground: #0D0D0D;
    --sidebar-accent: #1C1C18;
    --sidebar-accent-foreground: #F0EDE8;
    --sidebar-border: #2A2A24;
    --sidebar-ring: #E8B84B;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    position: relative;
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }
  .dark body::before {
    opacity: 0.06;
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  html {
    @apply font-sans;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

Expected: `npm run dev` shows new colors and fonts.

---

### Task 3: Update Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

Change logo text from "Portfolio" to "Rifan Setiadi" with Playfair Display styling. Update active section highlight to use primary/10 amber tint (same mechanism, just uses new primary color).

- [ ] **Step 1: Update Navbar logo and typography**

In `src/components/Navbar.tsx`, change the logo button text and add font-heading class:

Replace:
```tsx
<button
  onClick={() => scrollToSection("#home")}
  className="text-lg font-bold text-foreground hover:text-primary transition-colors"
>
  Portfolio
</button>
```

With:
```tsx
<button
  onClick={() => scrollToSection("#home")}
  className="text-xl font-bold text-primary hover:text-primary/80 transition-colors font-[family-name:var(--font-heading)]"
>
  Rifan Setiadi
</button>
```

Also update nav link text to use DM Sans explicitly — replace the nav link button className from:
```tsx
className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
  activeSection === link.href.slice(1)
    ? "text-primary bg-primary/10"
    : "text-muted-foreground hover:text-foreground hover:bg-muted"
}`}
```

To:
```tsx
className={`px-3 py-2 text-sm font-medium transition-colors rounded-md font-sans ${
  activeSection === link.href.slice(1)
    ? "text-primary bg-primary/10"
    : "text-muted-foreground hover:text-foreground hover:bg-muted"
}`}
```

Expected: Navbar shows "Rifan Setiadi" in amber Playfair Display. Links use DM Sans.

---

### Task 4: Enhance FadeIn for Staggered Reveals

**Files:**
- Modify: `src/components/FadeIn.tsx`

The existing FadeIn wraps an entire section. For staggered reveals, child elements need individual delays. Enhance FadeIn to accept an optional `stagger` prop that applies to children, or provide a helper for staggered children.

- [ ] **Step 1: Enhance FadeIn to support staggered child wrappers**

Replace `src/components/FadeIn.tsx`:

```tsx
import { useInView } from "@/hooks/useInView"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

const directionClasses: Record<string, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  none: "",
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  duration = 700,
  direction = "up",
}: FadeInProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const dirClass = directionClasses[direction]

  return (
    <div
      ref={ref}
      className={`transition-all ${className} ${
        isInView
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${dirClass}`
      }`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
```

Expected: FadeIn now supports `direction` and `duration` props. Existing usage (just `delay`) still works.

---

### Task 5: Redesign Hero Section

**Files:**
- Modify: `src/components/Hero.tsx`

Magazine cover layout — asymmetric two-column. Name in Playfair Display 900, amber accent line, large profile photo, staggered reveals.

- [ ] **Step 1: Replace Hero component**

Replace entire `src/components/Hero.tsx`:

```tsx
import { ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import type { PersonalData } from "@/types/portfolio"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

interface HeroProps {
  data: PersonalData
}

export function Hero({ data }: HeroProps) {
  const scrollToProjects = () => {
    const element = document.querySelector("#projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-4rem)] flex items-center px-4 py-20 overflow-hidden"
    >
      {/* Subtle radial gradient from top-right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="order-2 lg:order-1">
            <FadeIn delay={0} direction="up">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.9] text-foreground font-[family-name:var(--font-heading)]">
                {data.name.split(" ").map((word, i) => (
                  <span key={i}>
                    {word}
                    {i < data.name.split(" ").length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </FadeIn>

            <FadeIn delay={100} direction="up">
              <div className="w-20 h-1 bg-primary my-6" />
            </FadeIn>

            <FadeIn delay={200} direction="up">
              <p className="text-2xl md:text-3xl font-semibold text-primary mb-4 font-sans">
                {data.tagline}
              </p>
            </FadeIn>

            <FadeIn delay={300} direction="up">
              <p className="text-lg text-muted-foreground max-w-lg font-sans leading-relaxed">
                {data.headline}
              </p>
            </FadeIn>

            <FadeIn delay={400} direction="up">
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={scrollToProjects}
                  className="text-base font-sans"
                >
                  View My Work
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base font-sans"
                >
                  <a href={data.cvUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download CV
                  </a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={500} direction="up">
              <div className="flex gap-2 mt-8">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={data.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="hover:text-primary transition-colors"
                  >
                    <GitHubIcon className="h-5 w-5" />
                  </a>
                </Button>
                {data.social.linkedin && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={data.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="hover:text-primary transition-colors"
                    >
                      <LinkedInIcon className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {data.social.twitter && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={data.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="hover:text-primary transition-colors"
                    >
                      <TwitterIcon className="h-5 w-5" />
                    </a>
                  </Button>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right: Photo */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <FadeIn delay={200} direction="left" duration={800}>
              <div className="relative">
                <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-[3px] border-primary shadow-2xl">
                  <img
                    src={data.profileImage}
                    alt={`${data.name} profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        "https://placehold.co/400x400?text=Profile"
                    }}
                  />
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-full border border-primary/20 -z-10" />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <FadeIn delay={800} direction="down">
          <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
        </FadeIn>
      </div>
    </section>
  )
}
```

Expected: Asymmetric two-column hero with large Playfair name, amber line, staggered reveals.

---

### Task 6: Redesign About Section

**Files:**
- Modify: `src/components/About.tsx`

Two-column layout — narrative with drop cap left, quick-info card right. Left-aligned heading with amber line.

- [ ] **Step 1: Replace About component**

Replace entire `src/components/About.tsx`:

```tsx
import { MapPin, Calendar, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/FadeIn"
import type { PersonalData } from "@/types/portfolio"

interface AboutProps {
  data: PersonalData
}

export function About({ data }: AboutProps) {
  return (
    <section id="about" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              About
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-[65%_35%] gap-12 md:gap-16 items-start">
          {/* Left: Narrative with drop cap */}
          <FadeIn delay={100} direction="up">
            <div>
              <p className="text-base sm:text-lg text-foreground/85 leading-relaxed font-sans">
                <span className="float-left text-6xl sm:text-7xl font-bold text-primary leading-[0.75] mr-3 mt-1 font-[family-name:var(--font-heading)]">
                  {data.about.charAt(0)}
                </span>
                {data.about.slice(1)}
              </p>
            </div>
          </FadeIn>

          {/* Right: Quick Info */}
          <FadeIn delay={200} direction="up">
            <div className="border border-border rounded-lg p-6 space-y-5 bg-card/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground font-sans">{data.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground font-sans">{data.experience}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <Badge
                  variant="secondary"
                  className="text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 font-sans"
                >
                  {data.availabilityStatus}
                </Badge>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
```

Expected: Two-column about with drop cap, left-aligned heading with inline amber line.

---

### Task 7: Redesign Experience Section

**Files:**
- Modify: `src/components/Experience.tsx`

Single-column vertical timeline (not alternating). Cards with left amber border accent. Collapse to show 4 initially, expandable.

- [ ] **Step 1: Replace Experience component**

Replace entire `src/components/Experience.tsx`:

```tsx
import { useState } from "react"
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  data: ExperienceData
}

const INITIAL_SHOW = 4

export function Experience({ data }: ExperienceProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? data.experiences : data.experiences.slice(0, INITIAL_SHOW)
  const hasMore = data.experiences.length > INITIAL_SHOW

  return (
    <section id="experience" className="py-24 md:py-32 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Experience
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="relative max-w-4xl">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-10">
            {visible.map((exp, index) => (
              <FadeIn key={index} delay={index * 80} direction="up">
                <div className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-[3px] border-background bg-primary ring-1 ring-primary/30 z-10" />

                  {/* Period */}
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans font-medium">
                    {exp.period}
                  </span>

                  {/* Card */}
                  <div className="mt-2 border-l-2 border-primary bg-card/60 rounded-r-lg p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                          {exp.role}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground font-sans">
                            {exp.company}
                          </span>
                          <Badge variant="outline" className="text-xs font-sans">
                            {exp.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-1.5 ml-8">
                      {exp.description.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-sm text-muted-foreground list-disc marker:text-primary/50 font-sans leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {hasMore && (
          <FadeIn delay={400} direction="up">
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="font-sans"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show All {data.experiences.length} Experiences
                  </>
                )}
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
```

Expected: Single-column timeline, 4 entries visible, "Show All" button toggles rest.

---

### Task 8: Redesign Stats Section

**Files:**
- Modify: `src/components/Stats.tsx`

Horizontal spread of 4 large numbers on dark ink background. Full-width amber separator line. Counters preserved.

- [ ] **Step 1: Replace Stats component**

Replace entire `src/components/Stats.tsx`:

```tsx
import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import { FadeIn } from "@/components/FadeIn"
import type { StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({
  value,
  suffix,
  label,
}: {
  value: string
  suffix?: string
  label: string
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const numericValue = parseInt(value, 10)
  const count = useCounter(numericValue, 1500, isInView)

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary tracking-tight font-[family-name:var(--font-heading)]">
        {count}
        {suffix || ""}
      </div>
      <div className="text-xs sm:text-sm text-background/60 uppercase tracking-widest mt-2 font-sans font-medium">
        {label}
      </div>
    </div>
  )
}

export function Stats({ data }: StatsProps) {
  return (
    <section id="stats" className="py-24 md:py-32 px-4 bg-foreground text-background">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-background font-[family-name:var(--font-heading)]">
              By The Numbers
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {data.stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 100} direction="up">
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500} direction="none">
          <div className="w-full h-px bg-primary/30 mt-16" />
        </FadeIn>
      </div>
    </section>
  )
}
```

Expected: Dark ink background, large amber numbers, horizontal spread with separator.

---

### Task 9: Redesign Projects Section

**Files:**
- Modify: `src/components/Projects.tsx`

1 featured project (horizontal card, image left + text right) + 2-column grid for remaining. Dark background for contrast.

- [ ] **Step 1: Replace Projects component**

Replace entire `src/components/Projects.tsx`:

```tsx
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import type { ProjectsData } from "@/types/portfolio"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

interface ProjectsProps {
  data: ProjectsData
}

const EMPTY_PROJECT = {
  title: "More coming soon",
  description: "Currently working on exciting new projects. Check back soon.",
  tags: [],
}

export function Projects({ data }: ProjectsProps) {
  const featured = data.projects[0]
  const rest = data.projects.slice(1)

  return (
    <section id="projects" className="py-24 md:py-32 px-4 bg-foreground text-background">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-background font-[family-name:var(--font-heading)]">
              Projects
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        {/* Featured Project */}
        {featured && (
          <FadeIn delay={100} direction="up">
            <div className="group mb-12 border border-border/20 rounded-lg overflow-hidden bg-card/10 hover:border-primary/30 transition-colors duration-300">
              <div className="grid md:grid-cols-[55%_45%]">
                {/* Image */}
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-muted/20">
                  {featured.image ? (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-background/20 font-[family-name:var(--font-heading)]">
                        {featured.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
                    {featured.title}
                  </h3>
                  <p className="text-background/80 mb-6 leading-relaxed font-sans">
                    {featured.description}
                  </p>
                  {featured.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featured.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs border-primary/40 text-primary font-sans"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div>
                    {featured.githubUrl && (
                      <Button variant="outline" size="sm" asChild className="font-sans">
                        <a
                          href={featured.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GitHubIcon className="mr-2 h-4 w-4" />
                          View Project
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Secondary Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((project, index) => (
            <FadeIn key={index} delay={150 + index * 80} direction="up">
              <div className="group border border-border/20 rounded-lg overflow-hidden bg-card/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-video overflow-hidden bg-muted/20">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-background/20 font-[family-name:var(--font-heading)]">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-background mb-2 font-[family-name:var(--font-heading)]">
                    {project.title}
                  </h3>
                  <p className="text-sm text-background/60 mb-4 line-clamp-2 font-sans">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-sans"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    {project.githubUrl && (
                      <Button variant="ghost" size="sm" asChild className="text-background/70 hover:text-primary font-sans">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GitHubIcon className="mr-2 h-3 w-3" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="ghost" size="sm" asChild className="text-background/70 hover:text-primary font-sans">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Empty state placeholders */}
          {rest.length < 2 &&
            Array.from({ length: 2 - rest.length }).map((_, i) => (
              <FadeIn
                key={`empty-${i}`}
                delay={150 + (rest.length + i) * 80}
                direction="up"
              >
                <div className="border border-dashed border-primary/30 rounded-lg p-8 flex items-center justify-center h-full min-h-[200px] bg-card/5">
                  <p className="text-background/40 text-center font-sans">
                    {EMPTY_PROJECT.title}
                    <br />
                    <span className="text-sm">{EMPTY_PROJECT.description}</span>
                  </p>
                </div>
              </FadeIn>
            ))}
        </div>
      </div>
    </section>
  )
}
```

Expected: Featured project in horizontal layout, remaining in 2-column grid, dark background.

---

### Task 10: Redesign Skills Section

**Files:**
- Modify: `src/components/Skills.tsx`

Grouped by category, 2-column grid. Magazine "credits" style with amber dot separators.

- [ ] **Step 1: Replace Skills component**

Replace entire `src/components/Skills.tsx`:

```tsx
import { FadeIn } from "@/components/FadeIn"
import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  const categories = data.skills.reduce(
    (acc, skill) => {
      const cat = acc.get(skill.category) || []
      cat.push(skill.name)
      acc.set(skill.category, cat)
      return acc
    },
    new Map<string, string[]>()
  )

  const categoryEntries = Array.from(categories.entries())

  return (
    <section id="skills" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Tech Stack
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {categoryEntries.map(([category, skills], catIndex) => (
            <FadeIn key={category} delay={catIndex * 100} direction="up">
              <div>
                <span className="text-xs text-primary uppercase tracking-widest font-sans font-semibold">
                  {category}
                </span>
                <div className="w-8 h-px bg-primary/40 mt-2 mb-4" />
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                  {skills.map((skill, i) => (
                    <span key={skill} className="flex items-center text-base text-foreground hover:text-primary transition-colors cursor-default font-sans">
                      {skill}
                      {i < skills.length - 1 && (
                        <span className="text-primary/40 ml-1 mr-0.5 select-none">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Expected: Skills grouped by category with amber labels, dot separators.

---

### Task 11: Redesign Contact Section

**Files:**
- Modify: `src/components/Contact.tsx`

Centered bold CTA on dark background. Large heading, email card, social links, hire button. Playfair heading.

- [ ] **Step 1: Replace Contact component**

Replace entire `src/components/Contact.tsx`:

```tsx
import { useState } from "react"
import { Mail, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import type { PersonalData } from "@/types/portfolio"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

interface ContactProps {
  data: PersonalData
}

export function Contact({ data }: ContactProps) {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(data.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy email:", err)
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 px-4 bg-foreground text-background">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn delay={0} direction="up">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-background leading-[1.1] font-[family-name:var(--font-heading)]">
            Let&apos;s work
            <br />
            together
          </h2>
        </FadeIn>

        <FadeIn delay={100} direction="up">
          <div className="w-16 h-1 bg-primary mx-auto mt-6 mb-8" />
        </FadeIn>

        <FadeIn delay={200} direction="up">
          <p className="text-background/60 italic mb-12 max-w-md mx-auto font-sans">
            I&apos;m open for freelance projects, collaborations, and full-time
            opportunities. Let&apos;s build something amazing together.
          </p>
        </FadeIn>

        <FadeIn delay={300} direction="up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-3 bg-card/10 border border-border/30 rounded-lg px-5 py-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-background font-medium font-sans">
                {data.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyEmail}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy email</span>
            </Button>
          </div>
        </FadeIn>

        {copied && (
          <FadeIn delay={0} direction="none" duration={300}>
            <p className="text-sm text-primary mb-6 font-sans">
              Email copied to clipboard!
            </p>
          </FadeIn>
        )}

        <FadeIn delay={400} direction="up">
          <div className="flex justify-center gap-4 mb-10">
            <Button variant="outline" size="lg" asChild className="font-sans">
              <a
                href={data.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </Button>
            {data.social.linkedin && (
              <Button variant="outline" size="lg" asChild className="font-sans">
                <a
                  href={data.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="mr-2 h-5 w-5" />
                  LinkedIn
                </a>
              </Button>
            )}
            {data.social.twitter && (
              <Button variant="outline" size="lg" asChild className="font-sans">
                <a
                  href={data.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="mr-2 h-5 w-5" />
                  Twitter
                </a>
              </Button>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={500} direction="up">
          <Button size="lg" asChild className="text-lg px-8 font-[family-name:var(--font-heading)]">
            <a href={`mailto:${data.email}`}>
              <Mail className="mr-2 h-5 w-5" />
              Hire Me
            </a>
          </Button>
        </FadeIn>
      </div>
    </section>
  )
}
```

Expected: Centered bold CTA, multi-line Playfair heading, dark background, staggered reveals.

---

### Task 12: Update Footer

**Files:**
- Modify: `src/components/Footer.tsx`

Minor typography update — use DM Sans.

- [ ] **Step 1: Update Footer typography**

Replace `src/components/Footer.tsx`:

```tsx
interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 px-4 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-muted-foreground font-sans">
          &copy; {currentYear} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

Expected: Clean footer with DM Sans, no second line.

---

### Task 13: Update App.tsx Wrapping

**Files:**
- Modify: `src/App.tsx`

Remove the per-section `<FadeIn>` wrapper — each section now handles its own FadeIn internally. Keep just the section rendering.

- [ ] **Step 1: Simplify App.tsx section rendering**

In `src/App.tsx`, replace the return block (lines 84-113) to remove `<FadeIn>` wrappers around sections:

Replace:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <FadeIn>
          <Hero data={data.personal} />
        </FadeIn>
        <FadeIn delay={100}>
          <About data={data.personal} />
        </FadeIn>
        <FadeIn delay={100}>
          <Experience data={data.experience} />
        </FadeIn>
        <FadeIn delay={100}>
          <Stats data={data.stats} />
        </FadeIn>
        <FadeIn delay={100}>
          <Projects data={data.projects} />
        </FadeIn>
        <FadeIn delay={100}>
          <Skills data={data.skills} />
        </FadeIn>
        <FadeIn delay={100}>
          <Contact data={data.personal} />
        </FadeIn>
      </main>
      <Footer name={data.personal.name} />
    </div>
  )
```

With:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero data={data.personal} />
        <About data={data.personal} />
        <Experience data={data.experience} />
        <Stats data={data.stats} />
        <Projects data={data.projects} />
        <Skills data={data.skills} />
        <Contact data={data.personal} />
      </main>
      <Footer name={data.personal.name} />
    </div>
  )
```

Also remove the `FadeIn` import from App.tsx (line 11 — `import { FadeIn } from "@/components/FadeIn"`).

Expected: Sections render without outer FadeIn wrapper. Each section manages its own animations.

---

### Task 14: Verify

**Files:**
- All modified files

Run the three verification commands in order.

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: Pass with no errors.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: Pass with no errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Successful production build.

---

*End of Implementation Plan*
