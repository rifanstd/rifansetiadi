import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  return (
    <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      {data.categories.map((category) => (
        <div key={category.name} className="flex flex-col gap-1.5">
          <dt className="text-sm font-semibold">{category.name}</dt>
          <dd className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {category.skills.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  )
}
