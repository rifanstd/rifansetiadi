import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { useI18n } from "@/i18n/context"
import type { PersonalData } from "@/types/portfolio"

interface ContactProps {
  data: PersonalData
}

export function Contact({ data }: ContactProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(data.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy email:", err)
    }
  }

  const socials = [
    { label: "GitHub", url: data.social.github },
    { label: "LinkedIn", url: data.social.linkedin },
    { label: "X / Twitter", url: data.social.twitter },
    { label: t.contact.cv, url: data.cvUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url))

  return (
    <section id="contact" className="border-t border-border bg-muted">
      <FadeIn
        direction="up"
        className="page-container flex flex-col gap-5 py-14 sm:gap-7 lg:py-24"
      >
        <span className="font-mono text-[13px] text-muted-foreground sm:text-base">
          ~/rifan $ ./contact.sh{" "}
          <span className="animate-caret text-brand" aria-hidden="true">
            ▍
          </span>
        </span>
        <h2 className="max-w-[920px] text-[38px] leading-[1.05] font-bold sm:text-6xl lg:text-[76px] lg:leading-[1.02] lg:tracking-[-0.02em]">
          {t.contact.heading}{" "}
          <span className="text-brand">{t.contact.headingAccent}</span>
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            asChild
            className="h-[52px] px-6 text-[15px] font-semibold hover:bg-primary/85 sm:h-14 sm:text-[17px]"
          >
            <a href={`mailto:${data.email}`}>{data.email}</a>
          </Button>
          <Button
            variant="outline"
            onClick={copyEmail}
            className="h-[52px] border-foreground bg-transparent px-5 text-[15px] sm:h-14 dark:border-foreground dark:bg-transparent"
          >
            {copied ? <Check /> : <Copy />}
            {copied ? t.contact.copied : t.contact.copyEmail}
          </Button>
          <span className="text-sm text-muted-foreground sm:ml-3 sm:text-[15px]">
            {t.contact.replies}
          </span>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-[15px]">
          {socials.map((link) => (
            <li key={link.label}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-brand hover:underline"
              >
                {link.label} <span aria-hidden="true">&nbsp;↗</span>
              </a>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  )
}
