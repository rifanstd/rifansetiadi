import { useEffect, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group, Vector3 } from "three"
import { useI18n } from "@/i18n/context"
import type { BubbleStore } from "./bubbles"
import { MOTOR_URL, RIDER_URL, useKit } from "./kit"
import {
  buildCrowd,
  stepCrowd,
  type ChatterLines,
  type Crowd,
  type TalkState,
} from "./townsfolkSim"

interface TownsfolkProps {
  playerRef: RefObject<Vector3>
  bubblesRef: RefObject<BubbleStore>
  talkRef: RefObject<TalkState>
  crowdRef: RefObject<Crowd | null>
}

// The kampung's people: built once from the kit, then stepped every frame.
export function Townsfolk({
  playerRef,
  bubblesRef,
  talkRef,
  crowdRef,
}: TownsfolkProps) {
  const kit = useKit()
  const rider = useGLTF(RIDER_URL).scene
  const motor = useGLTF(MOTOR_URL).scene
  const { t } = useI18n()
  const groupRef = useRef<Group>(null)
  const linesRef = useRef<ChatterLines>(t.kampung.chatter)

  useEffect(() => {
    linesRef.current = t.kampung.chatter
  }, [t])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const crowd = buildCrowd(kit, rider, motor)
    group.add(...crowd.objects)
    crowdRef.current = crowd
    return () => {
      group.remove(...crowd.objects)
      crowdRef.current = null
    }
  }, [kit, rider, motor, crowdRef])

  useFrame((state, rawDelta) => {
    const crowd = crowdRef.current
    if (!crowd) return
    const focus = playerRef.current
    stepCrowd(
      crowd,
      Math.min(rawDelta, 1 / 20),
      state.clock.elapsedTime,
      { x: focus.x, z: focus.z },
      talkRef.current,
      bubblesRef.current,
      linesRef.current
    )
  })

  return <group ref={groupRef} />
}
