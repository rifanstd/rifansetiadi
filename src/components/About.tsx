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
      className="page-container grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-28"
    >
      <div className="flex flex-col gap-6 lg:col-span-6">
        <h2 className="text-[44px] leading-none font-medium sm:text-[64px]">
          {t.about.title}
        </h2>
        <p className="font-heading text-2xl leading-snug sm:text-[28px] sm:leading-snug">
          {data.aboutLead}
        </p>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          {data.about}
        </p>
      </div>
      <div className="lg:col-span-5 lg:col-start-8 lg:pt-4">
        <Skills data={skills} />
      </div>
    </section>
  )
}
