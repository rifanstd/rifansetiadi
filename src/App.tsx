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

export default App
