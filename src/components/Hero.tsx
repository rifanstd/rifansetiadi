import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
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
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
          </Button>
        )}
      </div>
    </section>
  )
}
