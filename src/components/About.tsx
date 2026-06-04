import { MapPin, Calendar, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/FadeIn"
import type { PersonalData } from "@/types/portfolio"

interface AboutProps {
  data: PersonalData
}

export function About({ data }: AboutProps) {
  return (
    <section id="about" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              About
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-[65%_35%] gap-12 md:gap-16 items-start">
          <FadeIn delay={100} direction="up">
            <div>
              <p className="text-base sm:text-lg text-foreground/85 leading-relaxed font-sans">
                <span className="float-left text-6xl sm:text-7xl font-bold text-primary leading-[0.75] mr-3 mt-1 font-[family-name:var(--font-heading)]">
                  {data.about.charAt(0)}
                </span>
                {data.about.slice(1)}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200} direction="up">
            <div className="border border-border rounded-lg p-6 space-y-5 bg-card/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground font-sans">{data.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground font-sans">{data.experience}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <Badge
                  variant="secondary"
                  className="text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 font-sans"
                >
                  {data.availabilityStatus}
                </Badge>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
