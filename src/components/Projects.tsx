import { Fragment, useState } from "react"
import { ChevronDown } from "lucide-react"
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

function projectHref(project: Project) {
  const external = !project.caseStudy ? projectLinks(project)[0] : undefined
  return { external, href: external ? external.url : caseStudyHref(project) }
}

function CallToAction({ project }: { project: Project }) {
  const { t } = useI18n()
  const { external } = projectHref(project)
  return (
    <span className="text-[15px] font-semibold underline decoration-line decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-foreground">
      {external ? (
        <>
          {external.label} <span aria-hidden="true">↗</span>
        </>
      ) : (
        t.work.readCaseStudy
      )}
    </span>
  )
}

// The lead project gets the whole width: a large visual, then the story.
function LeadProject({ project }: { project: Project }) {
  const { external, href } = projectHref(project)
  const facts = project.facts ?? []

  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex flex-col gap-7"
    >
      <FadeIn className="h-[260px] overflow-hidden rounded-2xl bg-surface sm:h-[380px] lg:h-[500px]">
        <ProjectMedia project={project} size="lead" />
      </FadeIn>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-2 lg:col-span-5">
          {project.meta && (
            <span className="text-sm text-muted-foreground">
              {project.meta}
            </span>
          )}
          <h3 className="text-[34px] leading-[1.05] font-medium sm:text-[44px]">
            {project.title}
          </h3>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-6 lg:col-start-7 lg:pt-7">
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {facts.slice(0, 3).map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="text-[15px] font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <CallToAction project={project} />
        </div>
      </div>
    </a>
  )
}

function FeaturedProject({ project }: { project: Project }) {
  const { external, href } = projectHref(project)

  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex flex-col gap-5"
    >
      <FadeIn className="h-[230px] overflow-hidden rounded-2xl bg-surface sm:h-[320px]">
        <ProjectMedia project={project} size="card" />
      </FadeIn>
      <div className="flex flex-col gap-2">
        {project.meta && (
          <span className="text-sm text-muted-foreground">{project.meta}</span>
        )}
        <h3 className="text-[26px] leading-tight font-medium sm:text-[30px]">
          {project.title}
        </h3>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {project.summary ?? project.description}
        </p>
        <div className="pt-1">
          <CallToAction project={project} />
        </div>
      </div>
    </a>
  )
}

function ProjectDetails({ project }: { project: Project }) {
  const { t } = useI18n()
  const links = projectLinks(project)

  return (
    <div className="flex animate-in flex-col gap-3 pt-1 pb-5 duration-200 fade-in slide-in-from-top-1">
      <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        {project.tags.join(" · ")}
      </p>
      {(project.caseStudy || links.length > 0) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {project.caseStudy && (
            <a
              href={caseStudyHref(project)}
              className="text-brand hover:underline"
            >
              {t.work.readCaseStudy}
            </a>
          )}
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
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
    <ChevronDown
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 text-muted-foreground transition-transform",
        expanded && "rotate-180 text-foreground"
      )}
    />
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

  const primaryLink = (project: Project) => {
    const link = projectLinks(project)[0]
    if (!link) {
      return <span className="text-muted-foreground">{t.work.internal}</span>
    }
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground"
      >
        {link.label} <span aria-hidden="true">↗</span>
      </a>
    )
  }

  return (
    <section
      id="work"
      className="page-container flex flex-col gap-10 pt-16 pb-12 sm:gap-14 lg:pt-28 lg:pb-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-[44px] leading-none font-medium sm:text-[64px]">
          {t.work.title}
        </h2>
        <span className="text-[15px] text-muted-foreground">
          {fill(t.work.count, {
            featured: featured.length,
            total: data.projects.length,
          })}
        </span>
      </div>

      {lead && <LeadProject project={lead.project} />}

      {others.length > 0 && (
        <div className="grid gap-12 md:grid-cols-2 md:gap-10">
          {others.map(({ project }) => (
            <FeaturedProject key={project.slug} project={project} />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-5 sm:mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-[28px] leading-tight font-medium">
            {t.work.allProjects}
          </h3>
          <div
            role="group"
            aria-label={t.work.filterLabel}
            className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0"
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
                  "h-10 shrink-0 rounded-lg px-3.5 text-sm transition-colors",
                  filter === option
                    ? "bg-foreground font-semibold text-background"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                {t.work.filters[option]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="py-6 text-muted-foreground">{t.work.empty}</p>
        )}

        {filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th scope="col" className="w-[56px] pb-2 font-normal">
                      {t.work.columns.number}
                    </th>
                    <th scope="col" className="pr-4 pb-2 font-normal">
                      {t.work.columns.project}
                    </th>
                    <th scope="col" className="pr-4 pb-2 font-normal">
                      {t.work.columns.type}
                    </th>
                    <th scope="col" className="pr-4 pb-2 font-normal">
                      {t.work.columns.stack}
                    </th>
                    <th scope="col" className="w-[150px] pb-2 font-normal">
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
                          <td className="py-1.5 font-mono text-xs text-muted-foreground">
                            {number}
                          </td>
                          <td className="py-1.5 pr-4">
                            <button
                              type="button"
                              aria-expanded={expanded}
                              aria-controls={detailsId}
                              aria-label={fill(t.work.showDetails, {
                                title: project.title,
                              })}
                              onClick={() => toggle(project.slug)}
                              className="flex min-h-11 items-center gap-2 text-left font-medium hover:text-brand"
                            >
                              {project.title}
                              <ExpandIcon expanded={expanded} />
                            </button>
                          </td>
                          <td className="py-1.5 pr-4 text-muted-foreground">
                            {typeLabel(project)}
                          </td>
                          <td className="py-1.5 pr-4 font-mono text-xs text-muted-foreground">
                            {project.stack}
                          </td>
                          <td className="py-1.5 text-sm">
                            {primaryLink(project)}
                          </td>
                        </tr>
                        {expanded && (
                          <tr id={detailsId} className="border-b border-border">
                            <td />
                            <td colSpan={4} className="pr-4">
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

            <ul className="flex flex-col md:hidden">
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
                        <span className="text-[15px] font-medium">
                          {project.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabel(project)} · {project.stack}
                        </span>
                      </span>
                      <ExpandIcon expanded={expanded} />
                    </button>
                    {expanded && (
                      <div id={detailsId}>
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
                className="h-12 rounded-lg bg-surface text-sm font-semibold transition-colors hover:bg-muted md:hidden"
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
