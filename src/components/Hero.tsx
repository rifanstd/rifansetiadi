import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/context"
import { scrollToSection } from "@/lib/scroll"
import { fill } from "@/lib/utils"
import type { PersonalData } from "@/types/portfolio"

interface HeroProps {
  data: PersonalData
}

export function Hero({ data }: HeroProps) {
  const { t } = useI18n()
  const [given, ...family] = data.name.split(" ")

  return (
    <section className="page-container grid gap-10 pt-8 pb-16 sm:pt-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pt-16 lg:pb-24">
      <div className="flex flex-col gap-6 lg:col-span-7 lg:pb-4">
        <p className="text-[15px] text-muted-foreground sm:text-base">
          {data.tagline} · {data.city}
        </p>
        <h1 className="text-[64px] leading-[0.9] font-medium tracking-[-0.035em] sm:text-[96px] lg:text-[120px]">
          <span className="block">{given}</span>
          <span className="block">{family.join(" ")}</span>
        </h1>
        <p className="max-w-[34rem] text-lg leading-relaxed sm:text-xl sm:leading-relaxed">
          {data.headline}
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-1">
          <Button
            asChild
            className="h-12 px-6 text-base font-semibold hover:bg-primary/85"
          >
            <a href="#work" onClick={(event) => scrollToSection(event, "work")}>
              {t.hero.seeWork}
            </a>
          </Button>
          <a
            href={data.cvUrl}
            download
            className="inline-flex h-12 items-center text-base font-semibold underline decoration-line decoration-2 underline-offset-[7px] transition-colors hover:decoration-foreground"
          >
            {t.hero.downloadCV}
          </a>
        </div>
      </div>

      <figure className="relative lg:col-span-5">
        <div className="overflow-hidden rounded-2xl bg-surface">
          <img
            src={data.profileImage}
            alt={fill(t.hero.portraitAlt, { name: data.name })}
            className="aspect-[4/5] w-full scale-[1.32] object-cover object-[54%_34%] max-lg:max-h-[72vh]"
            style={{ transformOrigin: "54% 38%" }}
          />
        </div>
      </figure>
    </section>
  )
}
