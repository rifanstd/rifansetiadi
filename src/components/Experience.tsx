import { useState } from "react"
import { ChevronDown } from "lucide-react"
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
    <section id="experience" className="bg-surface">
      <div className="page-container grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <h2 className="text-[44px] leading-none font-medium sm:text-[64px]">
            {t.experience.title}
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            {t.experience.subtitle}
          </p>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-[15px] font-semibold underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-foreground"
          >
            {t.experience.fullCV}
          </a>
        </div>

        <ol className="flex flex-col gap-2 lg:col-span-8">
          {data.experiences.map((exp, index) => {
            const expanded = expandedIndex === index
            const detailsId = `experience-${index}`
            return (
              <li
                key={`${exp.company}-${exp.period}`}
                className={cn(
                  "rounded-xl px-4 py-4 transition-colors sm:px-5",
                  expanded ? "bg-background" : "hover:bg-background/60"
                )}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  aria-label={fill(t.experience.showDetails, {
                    role: exp.role,
                    company: exp.company,
                  })}
                  onClick={() => setExpandedIndex(expanded ? null : index)}
                  className="grid w-full gap-1 text-left md:grid-cols-[150px_1fr_auto] md:gap-6"
                >
                  <span className="font-mono text-xs text-muted-foreground md:pt-1.5 md:text-[13px]">
                    {exp.period}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[19px] font-semibold sm:text-xl">
                      {exp.role}
                    </span>
                    <span className="text-[15px] text-muted-foreground">
                      {exp.company}
                    </span>
                    <span className="hidden pt-1 text-[15px] leading-relaxed text-muted-foreground md:block">
                      {exp.summary}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "hidden size-5 text-muted-foreground transition-transform md:mt-1 md:block",
                      expanded && "rotate-180 text-foreground"
                    )}
                  />
                </button>
                {expanded && (
                  <div
                    id={detailsId}
                    className="animate-in pt-3 duration-200 fade-in slide-in-from-top-1 md:pl-[174px]"
                  >
                    <p className="pb-2 text-sm leading-relaxed text-muted-foreground md:hidden">
                      {exp.summary}
                    </p>
                    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-line">
                      {exp.description.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
