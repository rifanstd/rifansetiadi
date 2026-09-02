import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { useI18n } from "@/i18n/context"
import type { ProjectLink, ProjectsData } from "@/types/portfolio"

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
  const { t } = useI18n()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section
      id="projects"
      className="py-24 md:py-32 px-4 bg-card text-foreground"
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              {t.projects.title}
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((project, index) => {
            const isExpanded = expandedIndex === index

            return (
              <FadeIn key={index} delay={index * 80} direction="up">
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

                    {/* Collapsed: short preview */}
                    <p
                      className={`text-sm text-foreground/60 mb-4 font-sans leading-relaxed ${
                        isExpanded ? "hidden" : "line-clamp-2"
                      }`}
                    >
                      {project.description}
                    </p>

                    {/* Expanded: full detail */}
                    {isExpanded && (
                      <div className="mb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                          {project.description}
                        </p>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, i) => (
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
                        <div className="flex flex-wrap gap-2 pt-1">
                          {project.githubUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="font-sans"
                            >
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <GitHubIcon className="mr-2 h-4 w-4" />
                                {t.projects.viewProject}
                              </a>
                            </Button>
                          )}
                          {project.links?.map(
                            (link: ProjectLink, i: number) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                asChild
                                className="font-sans"
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  {link.label}
                                </a>
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Collapsed: tags + code link */}
                    {!isExpanded && (
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
                    )}

                    <div className="mt-auto flex items-center gap-2">
                      {!isExpanded && (
                        <>
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
                                {t.projects.code}
                              </a>
                            </Button>
                          )}
                          {project.links?.map(
                            (link: ProjectLink, i: number) => (
                              <Button
                                key={i}
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-foreground/70 hover:text-primary font-sans"
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-3 w-3" />
                                  {link.label}
                                </a>
                              </Button>
                            )
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(index)}
                        className="text-foreground/60 hover:text-primary ml-auto font-sans"
                      >
                        {isExpanded ? (
                          <>
                            {t.projects.showLess}
                            <ChevronUp className="ml-1 h-3 w-3" />
                          </>
                        ) : (
                          <>
                            {t.projects.readMore}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}

          {data.projects.length < 3 &&
            Array.from({ length: 3 - data.projects.length }).map((_, i) => (
              <FadeIn
                key={`empty-${i}`}
                delay={(data.projects.length + i) * 80}
                direction="up"
              >
                <div className="border border-dashed border-primary/30 rounded-lg p-8 flex items-center justify-center h-full min-h-[200px] bg-secondary/40">
                  <div className="text-center">
                    <p className="text-foreground/40 font-sans">
                      {t.projects.comingSoon}
                    </p>
                    <p className="text-sm text-foreground/30 font-sans">
                      {t.projects.comingSoonDesc}
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
