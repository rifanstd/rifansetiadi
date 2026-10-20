import { useLayoutEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  className?: string
}

// A small rise for content that starts below the fold. Content is visible by
// default: nothing is hidden without IntersectionObserver, with reduced
// motion, or when the element is already on screen at first paint, so
// sections never sit blank while scrolling or in screenshots. The waiting
// state lives in a data attribute (see .fade-rise in index.css).
export function FadeIn({ children, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (element.getBoundingClientRect().top < window.innerHeight) return

    element.dataset.waiting = ""
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        delete element.dataset.waiting
        observer.disconnect()
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      delete element.dataset.waiting
    }
  }, [])

  return (
    <div ref={ref} className={cn("fade-rise", className)}>
      {children}
    </div>
  )
}
