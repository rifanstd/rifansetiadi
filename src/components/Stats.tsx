import { useCounter } from "@/hooks/useCounter"
import { useInView } from "@/hooks/useInView"
import type { Stat, StatsData } from "@/types/portfolio"

interface StatsProps {
  data: StatsData
}

function StatItem({ value, suffix, label }: Stat) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5 })
  const count = useCounter(parseInt(value, 10), 1200, isInView)

  return (
    <div ref={ref} className="flex flex-col gap-0.5">
      <span className="text-[28px] leading-tight font-bold text-brand tabular-nums sm:text-[34px]">
        {count}
        {suffix}
      </span>
      <span className="text-xs text-muted-foreground sm:text-[13px]">
        {label}
      </span>
    </div>
  )
}

export function Stats({ data }: StatsProps) {
  return (
    <section className="border-y border-border bg-muted">
      <div className="page-container flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-8">
        <div className="grid grid-cols-2 gap-5 sm:flex sm:flex-wrap sm:gap-12">
          {data.stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
        {data.clients && data.clients.length > 0 && (
          <ul className="flex flex-wrap gap-2 sm:gap-3">
            {data.clients.map((client) => (
              <li
                key={client}
                className="flex h-10 items-center border border-line px-4 font-mono text-xs text-muted-foreground"
              >
                {client}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
