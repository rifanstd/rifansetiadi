import { useI18n } from "@/i18n/context"

interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="page-container flex flex-wrap justify-between gap-4 py-7 text-[13px] text-muted-foreground">
      <span>
        &copy; {currentYear} {name}
      </span>
      <span className="font-mono">{t.footer.builtWith}</span>
    </footer>
  )
}
