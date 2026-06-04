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
    <section
      id="contact"
      className="py-24 md:py-32 px-4 bg-card text-foreground"
    >
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn delay={0} direction="up">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground leading-[1.1] font-[family-name:var(--font-heading)]">
            Let&apos;s work
            <br />
            together
          </h2>
        </FadeIn>

        <FadeIn delay={100} direction="up">
          <div className="w-16 h-1 bg-primary mx-auto mt-6 mb-8" />
        </FadeIn>

        <FadeIn delay={200} direction="up">
          <p className="text-foreground/60 italic mb-12 max-w-md mx-auto font-sans">
            I&apos;m open for freelance projects, collaborations, and full-time
            opportunities. Let&apos;s build something amazing together.
          </p>
        </FadeIn>

        <FadeIn delay={300} direction="up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-3 bg-card/10 border border-border/30 rounded-lg px-5 py-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-foreground font-medium font-sans">
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
            <Button
              variant="outline"
              size="lg"
              asChild
              className="font-sans"
            >
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
              <Button
                variant="outline"
                size="lg"
                asChild
                className="font-sans"
              >
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
              <Button
                variant="outline"
                size="lg"
                asChild
                className="font-sans"
              >
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
          <Button
            size="lg"
            asChild
            className="text-lg px-8 font-[family-name:var(--font-heading)]"
          >
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
