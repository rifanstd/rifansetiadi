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
import { I18nProvider, useI18n } from "@/i18n/context"
import type { PortfolioData } from "@/types/portfolio"

function AppContent() {
  const { locale, t } = useI18n()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [locale])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{t.error}</p>
          <p className="text-muted-foreground text-sm">
            {error || t.tryAgain}
          </p>
        </div>
      </div>
    )
  }

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
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
