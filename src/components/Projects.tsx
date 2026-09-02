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

const INITIAL_SHOW_MOBILE = 4
const INITIAL_SHOW_DESKTOP = 6

export function Projects({ data }: ProjectsProps) {
  const { t } = useI18n()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const hasMore = data.projects.length > INITIAL_SHOW_MOBILE

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

        <div
          id="projects-grid"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data.projects.map((project, index) => {
            const isExpanded = expandedIndex === index

            return (
              <FadeIn
                key={index}
                delay={index * 80}
                direction="up"
                className={
                  !showAll && index >= INITIAL_SHOW_DESKTOP
                    ? "hidden"
                    : !showAll && index >= INITIAL_SHOW_MOBILE
                      ? "hidden md:block"
                      : ""
                }
              >
                <div className="group relative overflow-hidden border border-border rounded-lg bg-secondary/60 p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary/70 transition-all duration-300 group-hover:h-1.5" />
                  <div className="mb-6 flex items-center gap-4" aria-hidden="true">
                    <span className="text-xs tracking-[0.2em] text-primary/70 font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="h-px flex-1 bg-border transition-colors duration-300 group-hover:bg-primary/40" />
                  </div>
                  <div className="flex flex-col flex-1">
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
                              className="border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
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
                                className="border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
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

                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      {!isExpanded && (
                        <>
                          {project.githubUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
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
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
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
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(index)}
                        className="ml-auto border-primary/40 bg-primary/5 font-semibold text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
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
        {hasMore && (
          <FadeIn delay={data.projects.length * 80} direction="up">
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                aria-expanded={showAll}
                aria-controls="projects-grid"
                className="border-primary/40 bg-primary/5 font-semibold text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/60 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/20 dark:hover:text-primary font-sans"
              >
                {showAll
                  ? t.projects.showLess
                  : t.projects.showAll.replace(
                      "{{count}}",
                      String(data.projects.length)
                    )}
                {showAll ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
