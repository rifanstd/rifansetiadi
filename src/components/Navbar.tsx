import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Menu, Moon, Sun } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/i18n/context"
import { scrollToSection } from "@/lib/scroll"
import { cn } from "@/lib/utils"

const SECTION_IDS = ["work", "experience", "about", "contact"] as const

type SectionId = (typeof SECTION_IDS)[number]

export function Wordmark() {
  return (
    <span className="font-mono text-[15px]">
      <span className="text-brand">~/</span>
      <span className="font-medium">rifan</span>
    </span>
  )
}

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, toggleLocale, t } = useI18n()

  return (
    <Button
      variant="outline"
      onClick={toggleLocale}
      title={t.nav.switchLanguage}
      className={cn(
        "h-11 border-line bg-transparent px-3 font-mono text-xs dark:border-line dark:bg-transparent",
        className
      )}
    >
      <span className={cn(locale !== "en" && "text-muted-foreground")}>EN</span>
      <span className="text-muted-foreground" aria-hidden="true">
        /
      </span>
      <span className={cn(locale !== "id" && "text-muted-foreground")}>ID</span>
      <span className="sr-only">{t.nav.switchLanguage}</span>
    </Button>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()
  const isDark = resolvedTheme === "dark"
  const label = isDark ? t.nav.switchToLight : t.nav.switchToDark

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "size-11 border-line bg-transparent dark:border-line dark:bg-transparent",
        className
      )}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}

export function Navbar() {
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const pendingSection = useRef<string | null>(null)

  const navLinks: { id: SectionId; label: string }[] = [
    { id: "work", label: t.nav.work },
    { id: "experience", label: t.nav.experience },
    { id: "about", label: t.nav.about },
    { id: "contact", label: t.nav.contact },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId)
          }
        })
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // The open sheet locks page scroll, so scroll once it has fully closed.
  const handleMenuClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault()
    pendingSection.current = id
    setIsOpen(false)
  }

  const handleMenuCloseAutoFocus = (event: Event) => {
    const id = pendingSection.current
    if (!id) return
    event.preventDefault()
    pendingSection.current = null
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <a
          href="#top"
          onClick={(event) => scrollToSection(event, "top")}
          className="flex min-h-11 items-center"
        >
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => scrollToSection(event, link.id)}
              aria-current={activeSection === link.id ? "true" : undefined}
              className={cn(
                "transition-colors hover:text-foreground",
                activeSection === link.id
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LocaleToggle />
          <ThemeToggle />
          <Button
            asChild
            className="h-11 px-[18px] text-sm font-semibold hover:bg-primary/85"
          >
            <a
              href="#contact"
              onClick={(event) => scrollToSection(event, "contact")}
            >
              {t.nav.letsTalk}
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t.nav.openMenu}
                className="size-11 border-foreground bg-transparent dark:border-foreground dark:bg-transparent"
              >
                <Menu className="size-[18px]" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="gap-0 p-0"
              onCloseAutoFocus={handleMenuCloseAutoFocus}
            >
              <SheetTitle className="flex h-16 items-center border-b border-border px-4 font-mono text-sm font-normal text-muted-foreground">
                {t.nav.menu}
              </SheetTitle>
              <nav className="flex flex-col px-4 py-2">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(event) => handleMenuClick(event, link.id)}
                    className={cn(
                      "flex min-h-12 items-center border-b border-border text-base",
                      activeSection === link.id
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm text-muted-foreground">
                  {t.nav.theme}
                </span>
                <ThemeToggle />
              </div>
              <div className="px-4">
                <Button asChild className="h-12 w-full text-sm font-semibold">
                  <a
                    href="#contact"
                    onClick={(event) => handleMenuClick(event, "contact")}
                  >
                    {t.nav.letsTalk}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
