import { FadeIn } from "@/components/FadeIn"
import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 sm:gap-y-8">
      {data.categories.map((category, index) => (
        <FadeIn key={category.name} delay={index * 80} direction="up">
          <div className="flex flex-col gap-1 border-t-2 border-dot pt-2.5 sm:gap-2.5 sm:pt-3.5">
            <h3 className="font-mono text-[11px] font-normal text-muted-foreground uppercase sm:text-xs">
              {category.name}
            </h3>
            <p className="text-[15px] leading-relaxed sm:text-base sm:leading-[1.7]">
              {category.skills.map((skill, i) => (
                <span key={skill}>
                  <span className="whitespace-nowrap">
                    {skill}
                    {i < category.skills.length - 1 && " ·"}
                  </span>{" "}
                </span>
              ))}
            </p>
          </div>
        </FadeIn>
      ))}
    </div>
  )
}
