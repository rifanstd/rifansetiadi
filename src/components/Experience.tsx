import { Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  data: ExperienceData
}

export function Experience({ data }: ExperienceProps) {
  return (
    <section id="experience" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Experience
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />

          <div className="space-y-8">
            {data.experiences.map((exp, index) => (
              <div
                key={index}
                className={`relative flex items-start gap-6 ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-primary rounded-full border-4 border-background sm:-translate-x-1.5 mt-6 z-10" />

                {/* Content */}
                <div className={`ml-12 sm:ml-0 sm:w-1/2 ${
                  index % 2 === 0 ? "sm:pr-12" : "sm:pl-12"
                }`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {exp.role}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              {exp.company}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {exp.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {exp.period}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-8">
                        {exp.description.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-sm text-muted-foreground list-disc"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
