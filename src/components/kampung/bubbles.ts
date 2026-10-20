import { useEffect, type RefObject } from "react"
import { Vector3, type Camera } from "three"

// Speech bubbles over people's heads. The 3D side writes text and a world
// anchor here; a DOM layer projects them every frame without re-rendering.

export interface Bubble {
  text: string
  until: number
  anchor: Vector3
}

export interface BubbleStore {
  camera: Camera | null
  bubbles: Map<string, Bubble>
}

export function createBubbleStore(): BubbleStore {
  return { camera: null, bubbles: new Map() }
}

export const now = () => performance.now() / 1000

export function say(
  store: BubbleStore,
  id: string,
  text: string,
  anchor: Vector3,
  seconds = 2.6
) {
  const bubble = store.bubbles.get(id)
  if (bubble) {
    bubble.text = text
    bubble.until = now() + seconds
    bubble.anchor.copy(anchor)
  } else {
    store.bubbles.set(id, {
      text,
      until: now() + seconds,
      anchor: anchor.clone(),
    })
  }
}

export function follow(store: BubbleStore, id: string, anchor: Vector3) {
  store.bubbles.get(id)?.anchor.copy(anchor)
}

const projected = new Vector3()

// Keeps one absolutely positioned element per live bubble inside container.
export function useBubbleLayer(
  container: RefObject<HTMLDivElement | null>,
  store: RefObject<BubbleStore>
) {
  useEffect(() => {
    const elements = new Map<string, HTMLDivElement>()
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const root = container.current
      const { camera, bubbles } = store.current
      if (!root || !camera) return
      const time = now()
      const width = root.clientWidth
      const height = root.clientHeight
      for (const [id, bubble] of bubbles) {
        let element = elements.get(id)
        const alive = bubble.until > time
        projected.copy(bubble.anchor).project(camera)
        const visible =
          alive &&
          projected.z < 1 &&
          Math.abs(projected.x) < 1.1 &&
          Math.abs(projected.y) < 1.1
        if (!visible) {
          if (element) element.style.opacity = "0"
          continue
        }
        if (!element) {
          element = document.createElement("div")
          element.className =
            "absolute -translate-x-1/2 -translate-y-full rounded-xl bg-[#FFFDF8] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[#1A1714] shadow-md transition-opacity duration-200"
          root.appendChild(element)
          elements.set(id, element)
        }
        if (element.textContent !== bubble.text)
          element.textContent = bubble.text
        element.style.opacity = "1"
        element.style.left = `${((projected.x + 1) / 2) * width}px`
        element.style.top = `${((1 - projected.y) / 2) * height}px`
      }
      for (const [id, element] of elements) {
        if (!bubbles.has(id)) {
          element.remove()
          elements.delete(id)
        }
      }
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      for (const element of elements.values()) element.remove()
    }
  }, [container, store])
}
