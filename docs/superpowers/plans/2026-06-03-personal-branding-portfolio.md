# Personal Branding Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page personal branding portfolio website with 8 sections, loading all content from separate JSON files, featuring smooth-scroll navigation, animated stats counter, fade-in sections, and dark mode support.

**Architecture:** A React 19 SPA with shadcn/ui components. All content lives in `public/data/*.json` files fetched at app initialization. Each section is a dedicated component receiving typed data via props. Intersection Observer powers scroll animations and active nav highlighting. CSS transitions handle all animations — no external animation library.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui v4, lucide-react

---

## File Structure

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
│   └── portfolio.ts
├── hooks/
│   ├── useInView.ts
│   └── useCounter.ts
├── components/
│   ├── ui/
│   │   ├── button.tsx (exists)
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
│   └── utils.ts (exists)
├── App.tsx
├── main.tsx (exists, minor modification)
└── index.css (exists)
```

---

## Pre-Implementation Notes

- Follow AGENTS.md TypeScript strictness: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`
- Use `import type { Foo }` for type-only imports
- No `enum`, `namespace`, or parameter properties
- Prettier conventions: `semi: false`, `singleQuote: false`, `trailingComma: "es5"`, `endOfLine: "lf"`
- All shadcn/ui components added via `npx shadcn@latest add <component>`
- Do NOT run `git commit` — user commits manually

---

### Task 1: Create TypeScript Type Definitions

**Files:**
- Create: `src/types/portfolio.ts`

- [ ] **Step 1: Write type definitions**

```typescript
export interface SocialLinks {
  github: string
  linkedin: string
  twitter: string
}

export interface PersonalData {
  name: string
  tagline: string
  headline: string
  about: string
  location: string
  email: string
  cvUrl: string
  availabilityStatus: string
  profileImage: string
  social: SocialLinks
}

export interface Stat {
  value: string
  suffix: string
  label: string
}

export interface StatsData {
  stats: Stat[]
}

export interface Experience {
  role: string
  company: string
  period: string
  type: string
  description: string[]
}

export interface ExperienceData {
  experiences: Experience[]
}

export interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  githubUrl: string
  liveUrl: string
}

export interface ProjectsData {
  projects: Project[]
}

export interface Skill {
  name: string
  category: string
}

export interface SkillsData {
  skills: Skill[]
}

export interface PortfolioData {
  personal: PersonalData
  stats: StatsData
  experience: ExperienceData
  projects: ProjectsData
  skills: SkillsData
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors from new types file)

---

### Task 2: Create JSON Data Files

**Files:**
- Create: `public/data/personal.json`
- Create: `public/data/stats.json`
- Create: `public/data/experience.json`
- Create: `public/data/projects.json`
- Create: `public/data/skills.json`

- [ ] **Step 1: Write personal.json**

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

- [ ] **Step 2: Write stats.json**

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

- [ ] **Step 3: Write experience.json**

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

- [ ] **Step 4: Write projects.json**

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

- [ ] **Step 5: Write skills.json**

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

### Task 3: Create Custom Hooks

**Files:**
- Create: `src/hooks/useInView.ts`
- Create: `src/hooks/useCounter.ts`

- [ ] **Step 1: Write useInView hook**

```typescript
import { useState, useEffect, useRef, type RefObject } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isInView]
}
```

- [ ] **Step 2: Write useCounter hook**

```typescript
import { useState, useEffect, useRef } from "react"

export function useCounter(
  targetValue: number,
  duration: number = 1500,
  start: boolean = false
): number {
  const [count, setCount] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!start) {
      setCount(0)
      return
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * targetValue))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCount(targetValue)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      startTimeRef.current = null
    }
  }, [targetValue, duration, start])

  return count
}
```

- [ ] **Step 3: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 4: Install shadcn/ui Components

**Files:**
- Install shadcn/ui components (auto-creates files in `src/components/ui/`)

- [ ] **Step 1: Install card, badge, sheet, separator**

Run: `npx shadcn@latest add card badge sheet separator`
Expected: Components installed in `src/components/ui/`

- [ ] **Step 2: Verify imports work**

Run: `npm run typecheck`
Expected: PASS (new shadcn components compile without errors)

---

### Task 5: Create Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Write Navbar.tsx**

```typescript
import { useState, useEffect } from "react"
import { Menu, Moon, Sun, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )

    navLinks.forEach((link) => {
      const element = document.querySelector(link.href)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("#home")}
            className="text-lg font-bold text-foreground hover:text-primary transition-colors"
          >
            Portfolio
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  activeSection === link.href.slice(1)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollToSection(link.href)}
                      className={`text-left px-4 py-3 text-base font-medium rounded-md transition-colors ${
                        activeSection === link.href.slice(1)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 6: Create Hero Component

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Write Hero.tsx**

```typescript
import { Github, Linkedin, Twitter, Download, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PersonalData } from "@/types/portfolio"

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
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20"
    >
      {/* Profile Image */}
      <div className="relative mb-8">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-border shadow-xl bg-muted">
          <img
            src={data.profileImage}
            alt={`${data.name} profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "https://placehold.co/400x400?text=Profile"
            }}
          />
        </div>
      </div>

      {/* Name & Tagline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-center mb-4">
        {data.name}
      </h1>
      <p className="text-xl sm:text-2xl text-primary font-medium text-center mb-4">
        {data.tagline}
      </p>
      <p className="text-muted-foreground text-center max-w-xl text-base sm:text-lg mb-8">
        {data.headline}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button size="lg" onClick={scrollToProjects}>
          View My Work
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href={data.cvUrl} download>
            <Download className="mr-2 h-4 w-4" />
            Download CV
          </a>
        </Button>
      </div>

      {/* Social Links */}
      <div className="flex gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a
            href={data.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a
            href={data.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a
            href={data.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 7: Create About Component

**Files:**
- Create: `src/components/About.tsx`

- [ ] **Step 1: Write About.tsx**

```typescript
import { MapPin, Calendar, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { PersonalData } from "@/types/portfolio"

interface AboutProps {
  data: PersonalData
}

export function About({ data }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About Me
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 text-center">
            {data.about}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-foreground">{data.location}</span>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-foreground">5+ Years Experience</span>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
                {data.availabilityStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 8: Create Experience Component

**Files:**
- Create: `src/components/Experience.tsx`

- [ ] **Step 1: Write Experience.tsx**

```typescript
import { Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  data: ExperienceData
}

export function Experience({ data }: ExperienceProps) {
  return (
    <section id="experience" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Experience
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />

          <div className="space-y-8">
            {data.experiences.map((exp, index) => (
              <div
                key={index}
                className={`relative flex items-start gap-6 ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-primary rounded-full border-4 border-background sm:-translate-x-1.5 mt-6 z-10" />

                {/* Content */}
                <div className={`ml-12 sm:ml-0 sm:w-1/2 ${
                  index % 2 === 0 ? "sm:pr-12" : "sm:pl-12"
                }`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {exp.role}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              {exp.company}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {exp.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {exp.period}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-8">
                        {exp.description.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-sm text-muted-foreground list-disc"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 9: Create Projects Component

**Files:**
- Create: `src/components/Projects.tsx`

- [ ] **Step 1: Write Projects.tsx**

```typescript
import { Github, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProjectsData } from "@/types/portfolio"

interface ProjectsProps {
  data: ProjectsData
}

export function Projects({ data }: ProjectsProps) {
  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Featured Projects
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((project, index) => (
            <Card
              key={index}
              className="overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `https://placehold.co/600x400?text=${encodeURIComponent(project.title)}`
                  }}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-3 w-3" />
                      Code
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Live Demo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {data.projects.length < 3 && (
          <p className="text-center text-muted-foreground mt-8">
            More projects coming soon...
          </p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 10: Create Stats Component

**Files:**
- Create: `src/components/Stats.tsx`

- [ ] **Step 1: Write Stats.tsx**

```typescript
import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import type { StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const numericValue = parseInt(value, 10)
  const count = useCounter(numericValue, 1500, isInView)

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}

export function Stats({ data }: StatsProps) {
  return (
    <section id="stats" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            By The Numbers
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 11: Create Skills Component

**Files:**
- Create: `src/components/Skills.tsx`

- [ ] **Step 1: Write Skills.tsx**

```typescript
import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tech Stack
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {data.skills.map((skill, index) => (
            <div
              key={index}
              className="px-6 py-3 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-muted hover:scale-105 transition-all duration-200 cursor-default"
            >
              {skill.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 12: Create Contact Component

**Files:**
- Create: `src/components/Contact.tsx`

- [ ] **Step 1: Write Contact.tsx**

```typescript
import { useState } from "react"
import { Mail, Copy, Github, Linkedin, Twitter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { PersonalData } from "@/types/portfolio"

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
    <section id="contact" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Let&apos;s Work Together
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-xl mx-auto text-center">
          <p className="text-muted-foreground mb-8">
            I&apos;m open for freelance projects, collaborations, and full-time opportunities.
            Let&apos;s build something amazing together.
          </p>

          {/* Email */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-foreground font-medium">{data.email}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyEmail}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy email</span>
            </Button>
          </div>

          {copied && (
            <p className="text-sm text-green-500 mb-4">Email copied to clipboard!</p>
          )}

          <Separator className="my-8" />

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            <Button variant="outline" size="lg" asChild>
              <a
                href={data.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href={data.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href={data.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="mr-2 h-5 w-5" />
                Twitter
              </a>
            </Button>
          </div>

          {/* Hire Me Button */}
          <Button size="lg" asChild>
            <a href={`mailto:${data.email}`}>
              <Mail className="mr-2 h-5 w-5" />
              Hire Me
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 13: Create Footer Component

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Write Footer.tsx**

```typescript
interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-muted-foreground mb-2">
          &copy; {currentYear} {name}. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Built with care using React, Tailwind CSS & shadcn/ui
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 14: Create Fade-In Wrapper Component

**Files:**
- Create: `src/components/FadeIn.tsx`

- [ ] **Step 1: Write FadeIn.tsx**

```typescript
import { useInView } from "@/hooks/useInView"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 15: Wire Everything Together in App.tsx

**Files:**
- Modify: `src/App.tsx` (complete rewrite)

- [ ] **Step 1: Rewrite App.tsx**

```typescript
import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { About } from "@/components/About"
import { Experience } from "@/components/Experience"
import { Projects } from "@/components/Projects"
import { Stats } from "@/components/Stats"
import { Skills } from "@/components/Skills"
import { Contact } from "@/components/Contact"
import { Footer } from "@/components/Footer"
import { FadeIn } from "@/components/FadeIn"
import type { PortfolioData } from "@/types/portfolio"

function App() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personalRes, statsRes, experienceRes, projectsRes, skillsRes] =
          await Promise.all([
            fetch("/data/personal.json"),
            fetch("/data/stats.json"),
            fetch("/data/experience.json"),
            fetch("/data/projects.json"),
            fetch("/data/skills.json"),
          ])

        if (
          !personalRes.ok ||
          !statsRes.ok ||
          !experienceRes.ok ||
          !projectsRes.ok ||
          !skillsRes.ok
        ) {
          throw new Error("Failed to fetch portfolio data")
        }

        const [personal, stats, experience, projects, skills] = await Promise.all([
          personalRes.json(),
          statsRes.json(),
          experienceRes.json(),
          projectsRes.json(),
          skillsRes.json(),
        ])

        setData({ personal, stats, experience, projects, skills })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load portfolio data</p>
          <p className="text-muted-foreground text-sm">
            {error || "Please try again later"}
          </p>
        </div>
      </div>
    )
  }

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
}

export default App
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: PASS

---

### Task 16: Verification

- [ ] **Step 1: Run linter**

Run: `npm run lint`
Expected: PASS (no errors, no warnings)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors)

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS (production build succeeds)

- [ ] **Step 4: Start dev server and visually verify**

Run: `npm run dev`
Open browser at `http://localhost:5173` (or shown port)
Visually verify:
- Navbar appears fixed at top
- Hero section shows name, tagline, CTAs, social links
- About section shows text and info badges
- Experience section shows timeline cards
- Stats section shows numbers (verify counter animation on scroll)
- Projects section shows grid of cards with hover effects
- Skills section shows tech stack items
- Contact section shows email, copy button, social links, hire me button
- Footer shows copyright
- Dark mode toggle works (press `d` or use toggle button)
- Mobile hamburger menu opens/closes
- Smooth scroll between sections works
- All sections fade in on scroll

---

## Post-Implementation Notes

### Assets to Add (manual step for user)
After implementation, the user needs to add their actual assets:

1. **Profile photo:** Replace `public/images/profile.jpg` with actual photo
2. **Project thumbnails:** Add images to `public/images/projects/`
3. **CV PDF:** Add `public/cv.pdf`
4. **Update JSON data:** Edit files in `public/data/` with real content, links, and experience

### Optional Enhancements (future iterations)
- Add more project cards as projects are completed
- Add a "Now" section showing current learning/focus
- Add Google Analytics or privacy-focused analytics
- Add a simple contact form (requires backend)
- Add Open Graph meta tags for social sharing
- Add favicon and manifest.json for PWA support

---

## Self-Review Checklist

- [x] **Spec coverage:** All 8 sections from spec are implemented (Navbar, Hero, About, Experience, Stats, Projects, Skills, Contact, Footer)
- [x] **Placeholder scan:** No TBD, TODO, or vague steps — every step has complete code
- [x] **Type consistency:** All type names and property names match between types file, JSON examples, and component props
- [x] **No git commits in plan:** User commits manually per AGENTS.md
- [x] **AGENTS.md compliance:** `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` respected in all code
- [x] **shadcn/ui integration:** Plan uses Button, Card, Badge, Sheet, Separator from shadcn
- [x] **Animation strategy:** CSS transitions + Intersection Observer (no framer-motion) per spec
- [x] **JSON data loading:** `Promise.all` parallel fetch implemented in App.tsx
- [x] **Error handling:** Loading and error states included in App.tsx
- [x] **Responsive design:** Grid breakpoints and mobile menu included
- [x] **Dark mode:** ThemeProvider already exists, toggle button included in Navbar
- [x] **Accessibility:** aria-labels, sr-only text, semantic HTML included in all components
