import { FadeIn } from "@/components/FadeIn"
import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  return (
    <section id="skills" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Tech Stack
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {data.categories.map((category, catIndex) => (
            <FadeIn key={category.name} delay={catIndex * 100} direction="up">
              <div>
                <span className="text-xs text-primary uppercase tracking-widest font-mono font-semibold">
                  {category.name}
                </span>
                <div className="w-8 h-px bg-primary/40 mt-2 mb-4" />
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                  {category.skills.map((skill, i) => (
                    <span
                      key={skill}
                      className="flex items-center text-base text-foreground hover:text-primary transition-colors cursor-default font-sans"
                    >
                      {skill}
                      {i < category.skills.length - 1 && (
                        <span className="text-primary/40 ml-1 mr-0.5 select-none">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
