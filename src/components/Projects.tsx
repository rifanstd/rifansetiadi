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

export function Projects({ data }: ProjectsProps) {
  const featured = data.projects[0]
  const rest = data.projects.slice(1)

  return (
    <section
      id="projects"
      className="py-24 md:py-32 px-4 bg-card text-foreground"
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Projects
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        {featured && (
          <FadeIn delay={100} direction="up">
            <div className="group mb-12 border border-border rounded-lg overflow-hidden bg-secondary/80 hover:border-primary/30 transition-colors duration-300">
              <div className="grid md:grid-cols-[55%_45%]">
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
                  {featured.image ? (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-foreground/20 font-[family-name:var(--font-heading)]">
                        {featured.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
                    {featured.title}
                  </h3>
                  <p className="text-foreground/80 mb-6 leading-relaxed font-sans">
                    {featured.description}
                  </p>
                  {featured.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featured.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs border-primary/40 text-primary font-mono"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div>
                    {featured.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="font-sans"
                      >
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

        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((project, index) => (
            <FadeIn key={index} delay={150 + index * 80} direction="up">
              <div className="group border border-border rounded-lg overflow-hidden bg-secondary/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-video overflow-hidden bg-muted">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground/20 font-[family-name:var(--font-heading)]">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 font-[family-name:var(--font-heading)]">
                    {project.title}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-4 line-clamp-2 font-sans">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-mono"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    {project.githubUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-foreground/70 hover:text-primary font-sans"
                      >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-foreground/70 hover:text-primary font-sans"
                      >
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

          {rest.length < 2 &&
            Array.from({ length: 2 - rest.length }).map((_, i) => (
              <FadeIn
                key={`empty-${i}`}
                delay={150 + (rest.length + i) * 80}
                direction="up"
              >
                <div className="border border-dashed border-primary/30 rounded-lg p-8 flex items-center justify-center h-full min-h-[200px] bg-secondary/40">
                  <div className="text-center">
                    <p className="text-foreground/40 font-sans">
                      More coming soon
                    </p>
                    <p className="text-sm text-foreground/30 font-sans">
                      Currently working on exciting new projects.
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
        </div>
      </div>
    </section>
  )
}
