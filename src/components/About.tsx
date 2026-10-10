import { FadeIn } from "@/components/FadeIn"
import { Skills } from "@/components/Skills"
import { useI18n } from "@/i18n/context"
import type { PersonalData, SkillsData } from "@/types/portfolio"

interface AboutProps {
  data: PersonalData
  skills: SkillsData
}

export function About({ data, skills }: AboutProps) {
  const { t } = useI18n()

  return (
    <section
      id="about"
      className="page-container grid gap-8 py-12 lg:grid-cols-12 lg:py-24"
    >
      <FadeIn
        direction="up"
        className="flex flex-col gap-4 lg:col-span-6 lg:gap-5"
      >
        <h2 className="text-[30px] leading-tight font-bold sm:text-5xl">
          {t.about.title}
        </h2>
        <p className="text-base leading-relaxed sm:text-lg sm:leading-[1.65]">
          {data.aboutLead}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base sm:leading-[1.65]">
          {data.about}
        </p>
      </FadeIn>
      <div className="lg:col-span-6">
        <Skills data={skills} />
      </div>
    </section>
  )
}
