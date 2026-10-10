import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { useI18n } from "@/i18n/context"
import { scrollToSection } from "@/lib/scroll"
import { fill } from "@/lib/utils"
import type { PersonalData } from "@/types/portfolio"

interface HeroProps {
  data: PersonalData
}

function Portrait({ data, className }: HeroProps & { className?: string }) {
  const { t } = useI18n()
  const fileName = data.profileImage.split("/").pop()

  return (
    <figure className={className}>
      <img
        src={data.profileImage}
        alt={fill(t.hero.portraitAlt, { name: data.name })}
        className="block aspect-[4/3] w-full border border-line object-cover object-[50%_35%] sm:aspect-[3/4] sm:object-[50%_40%]"
      />
      <figcaption className="mt-2.5 hidden font-mono text-xs text-muted-foreground lg:block">
        {"// "}
        {fileName} · {data.city}
      </figcaption>
    </figure>
  )
}

export function Hero({ data }: HeroProps) {
  const { t } = useI18n()

  return (
    <section className="page-container pt-9 pb-10 lg:pt-[88px] lg:pb-20">
      <div className="grid items-center gap-8 lg:grid-cols-12">
        <FadeIn
          delay={0}
          direction="up"
          className="flex flex-col gap-4 font-mono lg:col-span-8 lg:gap-5"
        >
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-line px-3 py-1.5 font-sans text-xs sm:text-[13px]">
            <span className="size-2 rounded-full bg-dot" aria-hidden="true" />
            {data.availabilityStatus}
            <span className="hidden sm:inline">
              · {data.city}, {data.timezone}
            </span>
          </span>

          <Portrait data={data} className="sm:max-w-sm lg:hidden" />

          <span className="text-[13px] text-muted-foreground sm:text-base">
            ~/rifan $ whoami
          </span>
          <h1 className="font-sans text-5xl leading-none font-bold tracking-[-0.02em] sm:text-7xl lg:text-[88px] lg:leading-[0.98] lg:tracking-[-0.03em]">
            {data.name}
          </h1>
          <ul className="flex flex-col gap-1.5 text-sm leading-relaxed sm:text-lg">
            {data.intro.map((line) => (
              <li key={line.text}>
                <span className="text-brand" aria-hidden="true">
                  →{" "}
                </span>
                {line.text}
                {line.note && (
                  <span className="text-muted-foreground"> {line.note}</span>
                )}
              </li>
            ))}
          </ul>
          <span className="text-[13px] text-muted-foreground sm:text-base">
            ~/rifan ${" "}
            <span className="hidden sm:inline">{data.heroCommand} </span>
            <span className="animate-caret text-brand" aria-hidden="true">
              ▍
            </span>
          </span>

          <div className="mt-2 flex flex-col gap-3 font-sans sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="h-[52px] px-6 text-base font-semibold hover:bg-primary/85"
            >
              <a
                href="#work"
                onClick={(event) => scrollToSection(event, "work")}
              >
                {t.hero.seeWork}
                <span aria-hidden="true">↓</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-[52px] border-foreground bg-transparent px-6 text-base font-semibold dark:border-foreground dark:bg-transparent"
            >
              <a href={data.cvUrl} download>
                {t.hero.downloadCV}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="hidden h-[52px] border-line bg-transparent px-5 text-base sm:inline-flex dark:border-line dark:bg-transparent"
            >
              <a
                href={data.social.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </Button>
          </div>
        </FadeIn>

        <FadeIn
          delay={150}
          direction="up"
          className="hidden justify-end lg:col-span-4 lg:flex"
        >
          <Portrait data={data} className="w-full max-w-[340px]" />
        </FadeIn>
      </div>
    </section>
  )
}
