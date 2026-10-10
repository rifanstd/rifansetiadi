import type { MouseEvent } from "react"

// Smoothly scrolls to an in-page section, falling back to the default hash
// navigation when the section is not rendered (e.g. on a case study page).
export function scrollToSection(
  event: MouseEvent<HTMLAnchorElement>,
  id: string
) {
  const element = document.getElementById(id)
  if (!element) return
  event.preventDefault()
  element.scrollIntoView({ behavior: "smooth" })
}
