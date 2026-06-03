import { MapPin, Calendar, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { PersonalData } from "@/types/portfolio"

interface AboutProps {
  data: PersonalData
}

export function About({ data }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About Me
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 text-center">
            {data.about}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-foreground">{data.location}</span>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-foreground">5+ Years Experience</span>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
                {data.availabilityStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
