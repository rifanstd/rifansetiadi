import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <section id="contact" className="bg-surface">
      <div className="page-container flex flex-col gap-8 py-16 sm:gap-10 lg:py-28">
        <h2 className="max-w-[980px] text-[48px] leading-[0.98] font-medium tracking-[-0.03em] sm:text-7xl lg:text-[96px]">
          {t.contact.heading}{" "}
          <span className="text-brand italic">{t.contact.headingAccent}</span>
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            asChild
            className="h-14 px-6 text-base font-semibold hover:bg-primary/85 sm:text-[17px]"
          >
            <a href={`mailto:${data.email}`}>{data.email}</a>
          </Button>
          <Button
            variant="ghost"
            onClick={copyEmail}
            className="h-14 self-start px-4 text-[15px] hover:bg-background"
          >
            {copied ? <Check /> : <Copy />}
            {copied ? t.contact.copied : t.contact.copyEmail}
          </Button>
          <span className="text-[15px] text-muted-foreground sm:ml-2">
            {t.contact.replies}
          </span>
        </div>

        <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
          {socials.map((link) => (
            <li key={link.label}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline decoration-line underline-offset-[6px] hover:decoration-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
