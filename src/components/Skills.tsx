import type { SkillsData } from "@/types/portfolio"

interface SkillsProps {
  data: SkillsData
}

export function Skills({ data }: SkillsProps) {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tech Stack
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {data.skills.map((skill, index) => (
            <div
              key={index}
              className="px-6 py-3 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-muted hover:scale-105 transition-all duration-200 cursor-default"
            >
              {skill.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
