import { Fragment, useState } from "react"
import { FadeIn } from "@/components/FadeIn"
import { ProjectVisual, type VisualSize } from "@/components/ProjectVisual"
import { useI18n } from "@/i18n/context"
import { caseStudyHref, projectLinks } from "@/lib/projects"
import { cn, fill } from "@/lib/utils"
import type { Project, ProjectCategory, ProjectsData } from "@/types/portfolio"

interface ProjectsProps {
  data: ProjectsData
}

type Filter = "all" | ProjectCategory

const FILTERS: Filter[] = ["all", "banking", "mobile", "ai", "oss"]
const MOBILE_LIMIT = 5

export function ProjectMedia({
  project,
  size,
  screen,
  label,
  className,
}: {
  project: Project
  size: VisualSize
  screen?: string
  label?: string
  className?: string
}) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={label ?? project.title}
        className={cn("h-full w-full object-cover", className)}
      />
    )
  }

  if (project.visual) {
    return (
      <ProjectVisual
        visual={project.visual}
        size={size}
        screen={screen}
        points={project.caseStudy?.features.map((feature) => ({
          label: feature.title,
          screen: feature.screen,
        }))}
        label={label ?? project.summary ?? project.title}
        className={className}
      />
    )
  }

  return null
}

function FeaturedCard({
  project,
  number,
  lead = false,
}: {
  project: Project
  number: string
  lead?: boolean
}) {
  const { t } = useI18n()
  const external = !project.caseStudy ? projectLinks(project)[0] : undefined
  const href = external ? external.url : caseStudyHref(project)
  const facts = project.facts ?? []
  const highlightFacts =
    facts.length > 1 ? [facts[0], facts[facts.length - 1]] : facts

  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "group flex flex-col gap-3 border border-border bg-card p-4 text-foreground transition-colors hover:border-line sm:p-6",
        lead && "lg:grid lg:grid-cols-12 lg:gap-8 lg:p-8"
      )}
    >
      <div
        className={cn(
          "h-[190px] bg-muted sm:h-[260px]",
          lead && "sm:h-[320px] lg:col-span-7 lg:h-[420px]"
        )}
      >
        <ProjectMedia project={project} size={lead ? "lead" : "card"} />
      </div>

      <div
        className={cn(
          "flex flex-col gap-2.5 sm:gap-3.5",
          lead && "lg:col-span-5 lg:justify-center lg:gap-4"
        )}
      >
        <span className="font-mono text-[11px] text-brand uppercase sm:text-xs">
          {number}
          {project.meta && ` · ${project.meta}`}
        </span>
        <h3
          className={cn(
            "text-xl leading-tight font-semibold sm:text-2xl",
            lead && "lg:text-[34px] lg:leading-[1.15]"
          )}
        >
          {project.title}
        </h3>
        <p className="hidden text-[15px] leading-relaxed text-muted-foreground sm:block lg:text-base">
          {project.summary ?? project.description}
        </p>
        {lead && highlightFacts.length > 0 && (
          <dl className="hidden flex-col gap-1.5 border-t border-line pt-4 text-sm sm:flex">
            {highlightFacts.map((fact) => (
              <div key={fact.label} className="flex gap-1.5">
                <dt>{fact.label} —</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <span className="text-sm font-semibold text-brand group-hover:underline sm:text-[15px]">
          {external ? (
            <>
              {external.label} <span aria-hidden="true">↗</span>
            </>
          ) : (
            <>
              {t.work.readCaseStudy} <span aria-hidden="true">→</span>
            </>
          )}
        </span>
      </div>
    </a>
  )
}

function ProjectDetails({ project }: { project: Project }) {
  const { t } = useI18n()
  const links = projectLinks(project)

  return (
    <div className="flex animate-in flex-col gap-3 py-4 duration-200 fade-in slide-in-from-top-1">
      <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
        {project.tags.map((tag) => (
          <li key={tag}>#{tag}</li>
        ))}
      </ul>
      {(project.caseStudy || links.length > 0) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {project.caseStudy && (
            <a href={caseStudyHref(project)} className="text-brand">
              {t.work.readCaseStudy} <span aria-hidden="true">→</span>
            </a>
          )}
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand"
            >
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-4 text-center font-mono text-muted-foreground"
    >
      {expanded ? "−" : "+"}
    </span>
  )
}

export function Projects({ data }: ProjectsProps) {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>("all")
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const numbered = data.projects.map((project, index) => ({
    project,
    number: String(index + 1).padStart(2, "0"),
  }))
  const featured = numbered.filter(({ project }) => project.featured)
  const [lead, ...others] = featured
  const filtered =
    filter === "all"
      ? numbered
      : numbered.filter(({ project }) => project.categories.includes(filter))
  const mobileVisible = showAll ? filtered : filtered.slice(0, MOBILE_LIMIT)

  const typeLabel = (project: Project) =>
    project.categories[0] ? t.work.filters[project.categories[0]] : "—"

  const toggle = (slug: string) =>
    setExpandedSlug((current) => (current === slug ? null : slug))

  const primaryLink = (project: Project, className?: string) => {
    const link = projectLinks(project)[0]
    if (!link) {
      return (
        <span className={cn("text-muted-foreground", className)}>
          {t.work.internal}
        </span>
      )
    }
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("text-brand hover:underline", className)}
      >
        {link.label} <span aria-hidden="true">↗</span>
      </a>
    )
  }

  return (
    <section
      id="work"
      className="page-container flex flex-col gap-5 pt-12 pb-8 sm:gap-8 lg:pt-24 lg:pb-16"
    >
      <FadeIn
        direction="up"
        className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2"
      >
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-brand sm:text-sm">
            $ ls ./work --featured
          </span>
          <h2 className="text-[30px] leading-tight font-bold sm:text-5xl sm:tracking-[-0.01em]">
            {t.work.title}
          </h2>
        </div>
        <span className="text-[15px] text-muted-foreground">
          {fill(t.work.count, {
            featured: featured.length,
            total: data.projects.length,
          })}
        </span>
      </FadeIn>

      {lead && (
        <FadeIn direction="up">
          <FeaturedCard project={lead.project} number={lead.number} lead />
        </FadeIn>
      )}

      {others.length > 0 && (
        <div className="grid gap-5 sm:gap-8 md:grid-cols-2">
          {others.map(({ project, number }, index) => (
            <FadeIn key={project.slug} delay={index * 100} direction="up">
              <FeaturedCard project={project} number={number} />
            </FadeIn>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4 sm:mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-[22px] font-semibold">{t.work.allProjects}</h3>
          <div
            role="group"
            aria-label={t.work.filterLabel}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0"
          >
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => {
                  setFilter(option)
                  setExpandedSlug(null)
                }}
                className={cn(
                  "h-11 shrink-0 border px-4 text-[13px] transition-colors sm:text-sm",
                  filter === option
                    ? "border-primary bg-primary font-semibold text-primary-foreground"
                    : "border-line text-foreground hover:bg-muted"
                )}
              >
                {t.work.filters[option]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="border-t border-foreground py-6 text-muted-foreground">
            {t.work.empty}
          </p>
        )}

        {filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto border-t border-foreground md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line font-mono text-[11px] text-muted-foreground uppercase">
                    <th scope="col" className="w-[60px] py-3 font-normal">
                      {t.work.columns.number}
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      {t.work.columns.project}
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      {t.work.columns.type}
                    </th>
                    <th scope="col" className="py-3 pr-4 font-normal">
                      {t.work.columns.stack}
                    </th>
                    <th scope="col" className="w-[150px] py-3 font-normal">
                      {t.work.columns.link}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ project, number }) => {
                    const expanded = expandedSlug === project.slug
                    const detailsId = `project-${project.slug}`
                    return (
                      <Fragment key={project.slug}>
                        <tr
                          className={cn(
                            "text-[15px]",
                            !expanded && "border-b border-border"
                          )}
                        >
                          <td className="py-2 font-mono text-xs text-muted-foreground">
                            {number}
                          </td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              aria-expanded={expanded}
                              aria-controls={detailsId}
                              aria-label={fill(t.work.showDetails, {
                                title: project.title,
                              })}
                              onClick={() => toggle(project.slug)}
                              className="flex min-h-11 items-center gap-2 text-left font-semibold hover:text-brand"
                            >
                              <ExpandIcon expanded={expanded} />
                              {project.title}
                            </button>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {typeLabel(project)}
                          </td>
                          <td className="py-2 pr-4 text-sm text-muted-foreground">
                            {project.stack}
                          </td>
                          <td className="py-2 text-sm">
                            {primaryLink(project)}
                          </td>
                        </tr>
                        {expanded && (
                          <tr id={detailsId} className="border-b border-border">
                            <td />
                            <td colSpan={4} className="pr-4 pl-6">
                              <ProjectDetails project={project} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="border-t border-foreground md:hidden">
              {mobileVisible.map(({ project }) => {
                const expanded = expandedSlug === project.slug
                const detailsId = `project-mobile-${project.slug}`
                return (
                  <li key={project.slug} className="border-b border-border">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={detailsId}
                      onClick={() => toggle(project.slug)}
                      className="flex min-h-[60px] w-full items-center justify-between gap-3 py-3 text-left"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-semibold">
                          {project.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabel(project)} · {project.stack}
                        </span>
                      </span>
                      <ExpandIcon expanded={expanded} />
                    </button>
                    {expanded && (
                      <div id={detailsId} className="pb-1">
                        <ProjectDetails project={project} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {filtered.length > MOBILE_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                aria-expanded={showAll}
                className="h-12 border border-line text-sm font-semibold transition-colors hover:bg-muted md:hidden"
              >
                {showAll
                  ? t.work.showLess
                  : fill(t.work.showAll, { count: filtered.length })}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
