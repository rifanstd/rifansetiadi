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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                <div className="absolute -inset-4 rounded-full border border-primary/20 -z-10" />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <FadeIn delay={800} direction="down">
          <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
        </FadeIn>
      </div>
    </section>
  )
}
