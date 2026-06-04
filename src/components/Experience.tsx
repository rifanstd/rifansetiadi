import { useState } from "react"
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  data: ExperienceData
}

const INITIAL_SHOW = 4

export function Experience({ data }: ExperienceProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll
    ? data.experiences
    : data.experiences.slice(0, INITIAL_SHOW)
  const hasMore = data.experiences.length > INITIAL_SHOW

  return (
    <section id="experience" className="py-24 md:py-32 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Experience
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="relative max-w-4xl">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-10">
            {visible.map((exp, index) => (
              <FadeIn key={index} delay={index * 80} direction="up">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-[3px] border-background bg-primary ring-1 ring-primary/30 z-10" />

                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans font-medium">
                    {exp.period}
                  </span>

                  <div className="mt-2 border-l-2 border-primary bg-card rounded-r-lg p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                          {exp.role}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground font-sans">
                            {exp.company}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {exp.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-1.5 ml-8">
                      {exp.description.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-sm text-muted-foreground list-disc marker:text-primary/50 font-sans leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {hasMore && (
          <FadeIn delay={400} direction="up">
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="font-sans"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show All {data.experiences.length} Experiences
                  </>
                )}
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
