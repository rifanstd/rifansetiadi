interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-muted-foreground mb-2">
          &copy; {currentYear} {name}. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Built with care using React, Tailwind CSS & shadcn/ui
        </p>
      </div>
    </footer>
  )
}
