import { useState } from "react"
import { FadeIn } from "@/components/FadeIn"
import { useI18n } from "@/i18n/context"
import { cn, fill } from "@/lib/utils"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  data: ExperienceData
  cvUrl: string
}

export function Experience({ data, cvUrl }: ExperienceProps) {
  const { t } = useI18n()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section id="experience" className="border-y border-border bg-muted">
      <div className="page-container grid gap-6 py-12 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <FadeIn
          direction="up"
          className="flex flex-col gap-2 lg:col-span-4 lg:gap-4"
        >
          <span className="font-mono text-xs text-brand sm:text-sm">
            $ git log --career
          </span>
          <h2 className="text-[30px] leading-tight font-bold sm:text-5xl">
            {t.experience.title}
          </h2>
          <p className="hidden text-base leading-relaxed text-muted-foreground sm:block">
            {t.experience.subtitle}
          </p>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-[15px] font-semibold text-brand hover:underline lg:inline"
          >
            {t.experience.fullCV} <span aria-hidden="true">→</span>
          </a>
        </FadeIn>

        <ol className="flex flex-col lg:col-span-8">
          {data.experiences.map((exp, index) => {
            const expanded = expandedIndex === index
            const detailsId = `experience-${index}`
            return (
              <li
                key={`${exp.company}-${exp.period}`}
                className="border-t border-line py-4 lg:py-6"
              >
                <FadeIn delay={index * 80} direction="up">
                  <div className="grid gap-1 md:grid-cols-[160px_1fr] md:gap-6">
                    <span className="font-mono text-[11px] text-brand uppercase md:pt-1 md:text-[13px]">
                      {exp.period}
                    </span>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex flex-col md:flex-row md:flex-wrap md:items-baseline md:gap-3">
                          <h3 className="text-base font-semibold md:text-[19px]">
                            {exp.role}
                          </h3>
                          <span className="text-[13px] text-muted-foreground md:text-[15px]">
                            {exp.company}
                          </span>
                        </div>
                        <p className="hidden text-[15px] leading-relaxed text-muted-foreground md:block">
                          {exp.summary}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        aria-label={fill(t.experience.showDetails, {
                          role: exp.role,
                          company: exp.company,
                        })}
                        onClick={() =>
                          setExpandedIndex(expanded ? null : index)
                        }
                        className={cn(
                          "-mr-2 flex size-11 shrink-0 items-center justify-center font-mono text-xl text-muted-foreground transition-colors hover:text-foreground",
                          expanded && "text-foreground"
                        )}
                      >
                        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div
                      id={detailsId}
                      className="animate-in pt-3 duration-200 fade-in slide-in-from-top-1 md:pl-[184px]"
                    >
                      <p className="pb-2 text-sm leading-relaxed text-muted-foreground md:hidden">
                        {exp.summary}
                      </p>
                      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-brand">
                        {exp.description.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </FadeIn>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
