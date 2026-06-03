import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import type { StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const numericValue = parseInt(value, 10)
  const count = useCounter(numericValue, 1500, isInView)

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {count}
        {suffix || ""}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}

export function Stats({ data }: StatsProps) {
  return (
    <section id="stats" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            By The Numbers
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
