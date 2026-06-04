import { useInView } from "@/hooks/useInView"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

const directionClasses: Record<string, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  none: "",
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  duration = 700,
  direction = "up",
}: FadeInProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const dirClass = directionClasses[direction]

  return (
    <div
      ref={ref}
      className={`transition-all ${className} ${
        isInView
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${dirClass}`
      }`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
