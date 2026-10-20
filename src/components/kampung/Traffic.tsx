import { useEffect, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier"
import { Group, Quaternion, Vector3, type Object3D } from "three"
import type { CameraShot } from "@/components/courier/CourierRig"
import {
  applyPose,
  findRig,
  RIDE_POSE,
  SEAT_OFFSET,
} from "@/components/courier/riderPose"
import { useI18n } from "@/i18n/context"
import { follow, say, type BubbleStore } from "./bubbles"
import { MOTOR_URL, paintSign, RIDER_URL, shadows, tint, useKit } from "./kit"
import {
  stepTraffic,
  VEHICLES,
  type Traffic as TrafficState,
  type Vehicle,
} from "./trafficSim"

interface TrafficProps {
  playerRef: RefObject<Vector3>
  trafficRef: RefObject<TrafficState>
  bubblesRef: RefObject<BubbleStore>
  shotRef: RefObject<CameraShot | null>
  onAlight: (vehicle: Vehicle) => void
}

const WHEEL = /^Roda(Depan|Belakang)(Kiri|Kanan)\d*$/
const MOTOR_WHEELS = ["RodaDepan_Poros", "RodaBelakang_Poros"]
const UP = new Vector3(0, 1, 0)
const CAMERA_OFFSET = new Vector3(0.62, 0.95, 1).normalize().multiplyScalar(15)

export function Traffic({
  playerRef,
  trafficRef,
  bubblesRef,
  shotRef,
  onAlight,
}: TrafficProps) {
  const kit = useKit()
  const rider = useGLTF(RIDER_URL).scene
  const motor = useGLTF(MOTOR_URL).scene
  const { t } = useI18n()
  const groupRef = useRef<Group>(null)
  const bodiesRef = useRef<(RapierRigidBody | null)[]>([])
  const visualsRef = useRef<
    { root: Object3D; wheels: Object3D[]; radius: number }[]
  >([])
  const linesRef = useRef({
    kenek: t.kampung.chatter.kenek,
    kiri: t.kampung.chatter.kiri,
  })
  const scratch = useRef({ quat: new Quaternion(), anchor: new Vector3() })

  useEffect(() => {
    linesRef.current = {
      kenek: t.kampung.chatter.kenek,
      kiri: t.kampung.chatter.kiri,
    }
  }, [t])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const visuals = VEHICLES.map((spec) => {
      if (spec.kind === "motor") {
        const root = new Group()
        root.add(motor.clone(true))
        const figure = rider.clone(true)
        tint(figure, "Jaket", spec.paint ?? "#C8452F")
        figure.position.set(SEAT_OFFSET.x, SEAT_OFFSET.y, 0)
        const rig = findRig(figure)
        if (rig) applyPose(rig, RIDE_POSE, 0)
        root.add(figure)
        shadows(root)
        const wheels = MOTOR_WHEELS.map((name) =>
          root.getObjectByName(name)
        ).filter((w): w is Object3D => Boolean(w))
        return { root, wheels, radius: 0.276 }
      }
      const root = shadows(kit.take(spec.kind))
      if (spec.kind === "mobil" && spec.paint)
        tint(root, "CatMobil", spec.paint)
      if (spec.kind === "angkot") {
        paintSign(
          root,
          "PapanTrayek",
          t.kampung.route,
          { background: "#F2EEE6", ink: "#1A1714" },
          4.7
        )
      }
      const wheels: Object3D[] = []
      root.traverse((child) => {
        if (WHEEL.test(child.name)) wheels.push(child)
      })
      return { root, wheels, radius: spec.kind === "angkot" ? 0.32 : 0.33 }
    })
    for (const v of visuals) group.add(v.root)
    visualsRef.current = visuals
    return () => {
      for (const v of visuals) group.remove(v.root)
      visualsRef.current = []
    }
  }, [kit, rider, motor, t])

  useFrame((_, rawDelta) => {
    const traffic = trafficRef.current
    const dt = Math.min(rawDelta, 1 / 20)
    const focus = playerRef.current
    const { quat, anchor } = scratch.current
    stepTraffic(
      traffic,
      dt,
      { x: focus.x, z: focus.z },
      {
        onHalte: (v) => {
          say(
            bubblesRef.current,
            "angkot",
            linesRef.current.kenek,
            anchor.set(v.at.x, 2.6, v.at.z),
            3.5
          )
        },
        onStopped: (v) => {
          say(
            bubblesRef.current,
            "angkot",
            linesRef.current.kiri,
            anchor.set(v.at.x, 2.6, v.at.z),
            2.5
          )
          onAlight(v)
        },
      }
    )
    traffic.vehicles.forEach((v, i) => {
      const visual = visualsRef.current[i]
      if (visual) {
        visual.root.position.set(v.at.x, 0, v.at.z)
        visual.root.rotation.y = v.at.heading
        for (const wheel of visual.wheels)
          wheel.rotation.z = -v.spin / visual.radius
      }
      const body = bodiesRef.current[i]
      if (body) {
        body.setNextKinematicTranslation({
          x: v.at.x,
          y: v.spec.half[1],
          z: v.at.z,
        })
        body.setNextKinematicRotation(quat.setFromAxisAngle(UP, v.at.heading))
      }
      if (v.spec.kind === "angkot")
        follow(bubblesRef.current, "angkot", anchor.set(v.at.x, 2.6, v.at.z))
    })
    // riding along: the camera follows the angkot from the usual angle
    if (traffic.passenger !== null) {
      const v = traffic.vehicles[traffic.passenger]
      const shot = shotRef.current ?? {
        position: new Vector3(),
        target: new Vector3(),
      }
      shot.target.set(v.at.x, 1.2, v.at.z)
      shot.position.copy(shot.target).add(CAMERA_OFFSET)
      shotRef.current = shot
    }
  })

  return (
    <>
      <group ref={groupRef} />
      {VEHICLES.map((spec, i) => (
        <RigidBody
          key={i}
          ref={(body) => {
            bodiesRef.current[i] = body
          }}
          type="kinematicPosition"
          colliders={false}
          position={[0, -10, 0]}
        >
          <CuboidCollider args={spec.half} />
        </RigidBody>
      ))}
    </>
  )
}
