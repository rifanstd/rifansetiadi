import { useState, useEffect, useRef } from "react"
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
import type { PortfolioData } from "@/types/portfolio"

const CASE_STUDY_ROUTE = /^#\/work\/([\w-]+)\/?$/

// Case studies live at #/work/<slug>; every other hash is an in-page section.
function getCaseStudySlug() {
  return window.location.hash.match(CASE_STUDY_ROUTE)?.[1] ?? null
}

function AppContent() {
  const { locale, t } = useI18n()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caseStudySlug, setCaseStudySlug] = useState(getCaseStudySlug)
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
    const handleHashChange = () => setCaseStudySlug(getCaseStudySlug())
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Switching between the home page and a case study replaces the whole page,
  // so apply the scroll position the hash asks for once per route change
  // (a locale switch reloads data but keeps the route).
  useEffect(() => {
    if (!data || scrolledForRoute.current === caseStudySlug) return
    scrolledForRoute.current = caseStudySlug
    if (caseStudySlug) {
      window.scrollTo({ top: 0 })
      return
    }
    const sectionId = window.location.hash.slice(1)
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView()
    }
  }, [caseStudySlug, data])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
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
