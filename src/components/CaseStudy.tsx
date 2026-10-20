import { Fragment } from "react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { LocaleToggle, ThemeToggle } from "@/components/Navbar"
import { ProjectMedia } from "@/components/Projects"
import { useI18n } from "@/i18n/context"
import { caseStudyHref, projectLinks } from "@/lib/projects"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/portfolio"

interface CaseStudyProps {
  project: Project | undefined
  projects: Project[]
}

function SectionLabel({ label }: { label: string }) {
  return <span className="text-sm text-muted-foreground">{label}</span>
}

function CaseStudyHeader() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <a
          href="/#work"
          className="flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-brand"
        >
          <span aria-hidden="true">←</span>
          {t.caseStudy.allWork}
        </a>
        <div className="flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          <Button
            asChild
            className="hidden h-11 px-[18px] text-sm font-semibold hover:bg-primary/85 sm:inline-flex"
          >
            <a href="/#contact">{t.nav.letsTalk}</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function CaseStudy({ project, projects }: CaseStudyProps) {
  const { t } = useI18n()
  const study = project?.caseStudy

  if (!project || !study) {
    return (
      <>
        <CaseStudyHeader />
        <main className="page-container flex min-h-[60vh] flex-col items-start justify-center gap-4 py-24">
          <p className="text-2xl font-semibold">{t.caseStudy.notFound}</p>
          <a href="/#work" className="font-semibold text-brand hover:underline">
            <span aria-hidden="true">← </span>
            {t.caseStudy.backHome}
          </a>
        </main>
      </>
    )
  }

  const number = String(projects.indexOf(project) + 1).padStart(2, "0")
  const links = projectLinks(project)
  const withStudy = projects.filter((item) => item.caseStudy)
  const next =
    withStudy.length > 1
      ? withStudy[(withStudy.indexOf(project) + 1) % withStudy.length]
      : undefined
  const hasOutcomes = Boolean(study.outcomes && study.outcomes.length > 0)

  return (
    <>
      <CaseStudyHeader />
      <main>
        <FadeIn className="page-container flex flex-col gap-5 pt-12 pb-10 lg:gap-6 lg:pt-[72px] lg:pb-12">
          <span className="text-[15px] text-muted-foreground">
            <span className="font-mono text-xs">{number}</span> · {study.label}
          </span>
          <h1 className="max-w-[900px] text-[48px] leading-[1] font-medium tracking-[-0.03em] sm:text-7xl lg:text-[88px]">
            {project.title}
          </h1>
          <p className="max-w-[760px] text-base leading-relaxed text-muted-foreground sm:text-xl sm:leading-[1.55]">
            {project.description}
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 md:grid-cols-5">
            {project.facts?.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1.5">
                <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="text-[15px] font-medium">{fact.value}</dd>
              </div>
            ))}
            {links.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <dt className="text-xs text-muted-foreground">
                  {t.caseStudy.links}
                </dt>
                <dd className="flex flex-col gap-1 text-[15px] font-medium">
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
                </dd>
              </div>
            )}
          </dl>
        </FadeIn>

        <div className="page-container pb-12 lg:pb-[72px]">
          <FadeIn className="h-[300px] overflow-hidden rounded-2xl bg-surface sm:h-[460px] lg:h-[560px]">
            <ProjectMedia project={project} size="hero" />
          </FadeIn>
        </div>

        <section className="page-container grid gap-4 pb-12 lg:grid-cols-12 lg:gap-8 lg:pb-[72px]">
          <div className="flex flex-col gap-2 lg:col-span-4">
            <SectionLabel label={t.caseStudy.context} />
            <h2 className="text-[34px] leading-tight font-medium sm:text-[42px]">
              {t.caseStudy.overview}
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-base leading-[1.7] sm:text-[17px] lg:col-span-8">
            {study.context.map((paragraph, index) => (
              <p
                key={index}
                className={index > 0 ? "text-muted-foreground" : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="bg-surface">
          <div className="page-container grid gap-4 py-12 lg:grid-cols-12 lg:gap-8 lg:py-[72px]">
            <div className="flex flex-col gap-2 lg:col-span-4">
              <SectionLabel label={t.caseStudy.myRole} />
              <h2 className="text-[34px] leading-tight font-medium sm:text-[42px]">
                {t.caseStudy.whatIDid}
              </h2>
            </div>
            <ol className="flex flex-col lg:col-span-8">
              {study.role.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[40px_1fr] gap-4 py-3 text-base leading-relaxed sm:grid-cols-[48px_1fr]"
                >
                  <span className="pt-1 font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="page-container flex flex-col gap-6 py-12 lg:gap-7 lg:py-[72px]">
          <div className="flex flex-col gap-2">
            <SectionLabel label={t.caseStudy.keyFeatures} />
            <h2 className="text-[34px] leading-tight font-medium sm:text-[42px]">
              {t.caseStudy.keyFeatures}
            </h2>
          </div>
          <div
            className={cn(
              "grid gap-8 md:grid-cols-3",
              study.features.length === 4 && "md:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {study.features.map((feature) => (
              <FadeIn key={feature.title} className="flex flex-col gap-3">
                <div className="h-[260px] overflow-hidden rounded-2xl bg-surface sm:h-[280px]">
                  <ProjectMedia
                    project={project}
                    size="feature"
                    screen={feature.screen}
                    label={feature.title}
                  />
                </div>
                <h3 className="text-[19px] font-semibold">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {(study.flow || hasOutcomes) && (
          <section className="page-container grid gap-10 pb-12 lg:grid-cols-12 lg:gap-8 lg:pb-[72px]">
            {study.flow && (
              <div
                className={
                  hasOutcomes
                    ? "flex flex-col gap-4 lg:col-span-7"
                    : "flex flex-col gap-4 lg:col-span-12"
                }
              >
                <SectionLabel label={t.caseStudy.flow} />
                <h2 className="text-[34px] leading-tight font-medium sm:text-[42px]">
                  {t.caseStudy.howItWorks}
                </h2>
                <FlowDiagram steps={study.flow} />
              </div>
            )}
            {hasOutcomes && (
              <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-16">
                <SectionLabel label={t.caseStudy.outcome} />
                {study.outcomes?.map((outcome) => (
                  <div key={outcome.label} className="flex flex-col gap-0.5">
                    <span className="font-heading text-[44px] leading-none font-medium">
                      {outcome.value}
                      {outcome.suffix}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {outcome.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {next && next !== project && (
          <a
            href={caseStudyHref(next)}
            className="group block bg-surface text-foreground"
          >
            <div className="page-container flex flex-wrap items-center justify-between gap-4 py-12 lg:py-16">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">
                  {t.caseStudy.next}
                </span>
                <span className="font-heading text-4xl font-medium sm:text-[52px]">
                  {next.title}{" "}
                  <span
                    className="inline-block text-brand transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </span>
              </div>
              <span className="text-[15px] text-muted-foreground">
                {next.summary}
              </span>
            </div>
          </a>
        )}
      </main>
    </>
  )
}

function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col items-stretch gap-0 rounded-2xl bg-surface p-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-3 sm:p-8">
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && (
            <li
              aria-hidden="true"
              className="flex justify-center py-1 text-muted-foreground sm:px-3 sm:py-0"
            >
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </li>
          )}
          <li className="flex items-center gap-2 rounded-lg bg-background px-4 py-3 text-sm">
            <span className="font-mono text-[11px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        </Fragment>
      ))}
    </ol>
  )
}
