interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 px-4 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-muted-foreground font-sans">
          &copy; {currentYear} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
