import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import { FadeIn } from "@/components/FadeIn"
import type { StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({
  value,
  suffix,
  label,
}: {
  value: string
  suffix?: string
  label: string
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const numericValue = parseInt(value, 10)
  const count = useCounter(numericValue, 1500, isInView)

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary tracking-tight font-[family-name:var(--font-heading)]">
        {count}
        {suffix || ""}
      </div>
      <div className="text-xs sm:text-sm text-foreground/60 uppercase tracking-widest mt-2 font-sans font-medium">
        {label}
      </div>
    </div>
  )
}

export function Stats({ data }: StatsProps) {
  return (
    <section
      id="stats"
      className="py-24 md:py-32 px-4 bg-card text-foreground"
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              By The Numbers
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {data.stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 100} direction="up">
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500} direction="none">
          <div className="w-full h-px bg-primary/30 mt-16" />
        </FadeIn>
      </div>
    </section>
  )
}
