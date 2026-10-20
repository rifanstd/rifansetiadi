import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import { useI18n } from "@/i18n/context"
import type { Stat, StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({ value, suffix, label }: Stat) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const count = useCounter(parseInt(value, 10), 1200, isInView)

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="font-heading text-[44px] leading-none font-medium tabular-nums sm:text-[56px]">
        {count}
        <span className="text-brand">{suffix}</span>
      </span>
      <span className="text-sm text-muted-foreground sm:text-[15px]">
        {label}
      </span>
    </div>
  )
}

// The one animation on the page: numbers count up as they come into view.
export function Stats({ data }: StatsProps) {
  const { t } = useI18n()

  return (
    <section className="bg-surface">
      <div className="page-container flex flex-col gap-8 py-10 lg:flex-row lg:items-end lg:justify-between lg:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:flex sm:gap-14">
          {data.stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
        {data.clients && data.clients.length > 0 && (
          <p className="max-w-xs text-[15px] leading-relaxed text-muted-foreground lg:text-right">
            {t.stats.workedWith}{" "}
            <span className="text-foreground">{data.clients.join(", ")}</span>
          </p>
        )}
      </div>
    </section>
  )
}
