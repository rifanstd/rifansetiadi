import { useEffect, useRef } from "react"

export interface DriveInput {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  // Space held: drift on the scooter, a higher jump on foot
  drift: boolean
  run: boolean
  // one-shot presses; whoever handles them clears them
  jump: boolean
  interact: boolean
  kick: boolean
  wave: boolean
  reset: boolean
}

export type DriveKey = keyof DriveInput

const HELD_KEYS: Record<string, DriveKey> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "drift",
  ShiftLeft: "run",
  ShiftRight: "run",
}

const PRESSED_KEYS: Record<string, DriveKey> = {
  Space: "jump",
  KeyE: "interact",
  KeyF: "kick",
  KeyQ: "wave",
  KeyR: "reset",
}

export const ONE_SHOT_KEYS: DriveKey[] = [
  "jump",
  "interact",
  "kick",
  "wave",
  "reset",
]

export function createDriveInput(): DriveInput {
  return {
    forward: false,
    back: false,
    left: false,
    right: false,
    drift: false,
    run: false,
    jump: false,
    interact: false,
    kick: false,
    wave: false,
    reset: false,
  }
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select") !== null)
  )
}

// Keyboard controls. The world claims these keys with preventDefault, so the
// theme toggle on `d` stays quiet while someone steers.
export function useDriveInput() {
  const inputRef = useRef<DriveInput>(createDriveInput())

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const held = HELD_KEYS[event.code]
      const pressed = PRESSED_KEYS[event.code]
      if ((!held && !pressed) || isEditableTarget(event.target)) return
      event.preventDefault()
      const down = event.type === "keydown"
      if (held) inputRef.current[held] = down
      // auto-repeat must not toggle the scooter or jump again
      if (pressed && down && !event.repeat) inputRef.current[pressed] = true
    }
    const release = () => {
      const input = inputRef.current
      for (const key of Object.keys(input) as DriveKey[]) input[key] = false
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKey)
    window.addEventListener("blur", release)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
      window.removeEventListener("blur", release)
    }
  }, [])

  return inputRef
}
