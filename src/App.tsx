import { lazy, Suspense, useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { About } from "@/components/About"
import { Experience } from "@/components/Experience"
import { Projects } from "@/components/Projects"
import { Stats } from "@/components/Stats"
import { Contact } from "@/components/Contact"
import { CaseStudy } from "@/components/CaseStudy"
import { Footer } from "@/components/Footer"
import { I18nProvider, useI18n } from "@/i18n/context"
import {
  interceptLinks,
  parseRoute,
  redirectLegacyHash,
  usePathname,
} from "@/lib/router"
import type { PortfolioData } from "@/types/portfolio"

// The kampung pulls in three.js, so it loads only when someone visits it.
const KampungWorld = lazy(() => import("@/components/kampung/KampungWorld"))

redirectLegacyHash()

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { locale, t } = useI18n()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const route = parseRoute(pathname)
  const caseStudySlug = route.kind === "work" ? route.slug : null
  const isKampung = route.kind === "kampung"
  const scrolledForRoute = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const prefix = locale === "id" ? "/data/id" : "/data"
        const [personalRes, statsRes, experienceRes, projectsRes, skillsRes] =
          await Promise.all([
            fetch(`${prefix}/personal.json`),
            fetch(`${prefix}/stats.json`),
            fetch(`${prefix}/experience.json`),
            fetch(`${prefix}/projects.json`),
            fetch(`${prefix}/skills.json`),
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

        const [personal, stats, experience, projects, skills] =
          await Promise.all([
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
  }, [locale])

  useEffect(() => {
    document.addEventListener("click", interceptLinks)
    return () => document.removeEventListener("click", interceptLinks)
  }, [])

  // Switching between the home page and a case study replaces the whole page,
  // so apply the scroll position the URL asks for once per route change
  // (a locale switch reloads data but keeps the route).
  useEffect(() => {
    if (!data || scrolledForRoute.current === pathname) return
    scrolledForRoute.current = pathname
    if (isKampung) return
    const sectionId = window.location.hash.slice(1)
    const section = sectionId && document.getElementById(sectionId)
    if (section) section.scrollIntoView()
    else window.scrollTo({ top: 0 })
  }, [pathname, isKampung, data])

  // The kampung stays mounted while a locale switch reloads data, so
  // visitors keep their place instead of dropping back to the loading screen.
  if (isKampung && data) {
    return (
      <Suspense fallback={<LoadingScreen label={t.kampung.loading} />}>
        <KampungWorld data={data} />
      </Suspense>
    )
  }

  if (loading) {
    return <LoadingScreen label={t.loading} />
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-destructive">{t.error}</p>
          <p className="text-sm text-muted-foreground">{error || t.tryAgain}</p>
        </div>
      </div>
    )
  }

  if (caseStudySlug) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <CaseStudy
          project={data.projects.projects.find(
            (project) => project.slug === caseStudySlug
          )}
          projects={data.projects.projects}
        />
        <Footer name={data.personal.name} />
      </div>
    )
  }

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero data={data.personal} />
        <Stats data={data.stats} />
        <Projects data={data.projects} />
        <Experience data={data.experience} cvUrl={data.personal.cvUrl} />
        <About data={data.personal} skills={data.skills} />
        <Contact data={data.personal} />
      </main>
      <Footer name={data.personal.name} />
    </div>
  )
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
