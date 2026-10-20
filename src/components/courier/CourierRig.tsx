import { useEffect, useMemo, useRef, type RefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  type RapierCollider,
  type RapierRigidBody,
} from "@react-three/rapier"
import {
  ConeGeometry,
  Euler,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Object3D,
} from "three"
import { ONE_SHOT_KEYS, type DriveInput } from "./input"
import {
  configureControllers,
  DISMOUNT_TIME,
  MOUNT_TIME,
  riderRootDrop,
  stepCourier,
  type Courier,
  type CourierPhysics,
  type CourierTuning,
} from "./physics"
import {
  applyPose,
  blendPose,
  createPose,
  findRig,
  ridingPose,
  RIDE_POSE,
  SEAT_OFFSET,
  standingPose,
  type RiderRig,
} from "./riderPose"

const SCOOTER_URL = "/models/ojek.glb"
const RIDER_URL = "/models/rider.glb"
useGLTF.preload(SCOOTER_URL)
useGLTF.preload(RIDER_URL)

// wheel pivots kept by the export so the wheels can spin
const WHEEL_NODES = ["RodaDepan_Poros", "RodaBelakang_Poros"]

export interface CourierStatus {
  onFoot: boolean
  canMount: boolean
  canDismount: boolean
}

export interface CourierTrack {
  x: number
  z: number
  speed: number
}

// Bruno-style follow camera: high, three-quarter view, eased. Closer on foot.
export interface CourierCamera {
  direction: Vector3
  ride: number
  walk: number
  // how far above the feet the camera looks while on foot
  walkLift: number
  // drag to turn the camera around the player, scroll to zoom
  orbit?: {
    minPitch: number
    maxPitch: number
    minZoom: number
    maxZoom: number
  }
}

export interface CameraShot {
  position: Vector3
  target: Vector3
}

interface CourierRigProps {
  tuning: CourierTuning
  camera: CourierCamera
  inputRef: RefObject<DriveInput>
  courierRef: RefObject<Courier>
  // while a panel is open the controls are ignored
  paused: boolean
  onStatus: (status: CourierStatus) => void
  trackRef?: RefObject<CourierTrack>
  // a floating arrow towards a destination
  targetRef?: RefObject<[number, number] | null>
  arrow?: { color: string; size: number; ride: number; walk: number }
  // where the rider stands when the world starts on foot
  walkStart?: readonly [number, number, number]
  // a fixed shot the camera eases into (conversations, cutscenes)
  shotRef?: RefObject<CameraShot | null>
  // hides the player, e.g. while sitting inside an angkot
  hiddenRef?: RefObject<boolean>
  physicsRef?: RefObject<CourierPhysics | null>
  // a name for the on-foot figure, so a world can dress it
  walkerName?: string
  // is the view from a point along a direction blocked? the orbit camera
  // then rises over it
  occluded?: (origin: Vector3, direction: Vector3, distance: number) => boolean
}

export function CourierRig({
  tuning,
  camera,
  inputRef,
  courierRef,
  paused,
  onStatus,
  trackRef,
  targetRef,
  arrow,
  walkStart,
  shotRef,
  hiddenRef,
  physicsRef: externalPhysicsRef,
  walkerName,
  occluded,
}: CourierRigProps) {
  const { scene: scooterScene } = useGLTF(SCOOTER_URL)
  const { scene: riderScene } = useGLTF(RIDER_URL)
  // one figure sits on the scooter, the other walks; only one shows at a time
  const mountedRider = useMemo(() => riderScene.clone(true), [riderScene])
  const walkingRider = useMemo(() => riderScene.clone(true), [riderScene])
  const { world, rapier } = useRapier()
  const scale = tuning.modelScale
  const u = tuning.unit
  const drop = riderRootDrop(tuning)
  const start = tuning.start

  const scooterBodyRef = useRef<RapierRigidBody>(null)
  const scooterColliderRef = useRef<RapierCollider>(null)
  const scooterBallRef = useRef<RapierCollider>(null)
  const riderBodyRef = useRef<RapierRigidBody>(null)
  const riderColliderRef = useRef<RapierCollider>(null)
  const physicsRef = useRef<CourierPhysics | null>(null)

  const tiltRef = useRef<Group>(null)
  const scooterModelRef = useRef<Group>(null)
  const seatRef = useRef<Group>(null)
  const walkerRef = useRef<Group>(null)
  const arrowRef = useRef<Mesh>(null)
  const rigsRef = useRef<{
    mounted: RiderRig | null
    walking: RiderRig | null
  }>({ mounted: null, walking: null })
  const viewRef = useRef({
    look: new Vector3(...(walkStart ?? start.position)),
    target: new Vector3(),
    distance: walkStart ? camera.walk : camera.ride,
    pose: createPose(),
    standing: createPose(),
    euler: new Euler(0, 0, 0, "ZXY"),
    status: "",
    placed: false,
    yaw: Math.atan2(camera.direction.x, camera.direction.z),
    pitch: Math.asin(camera.direction.y),
    zoom: 1,
    lift: 0,
    direction: camera.direction.clone(),
  })
  const gl = useThree((state) => state.gl)
  const orbit = camera.orbit

  useEffect(() => {
    if (!orbit) return
    const element = gl.domElement
    const view = viewRef.current
    let drag: { id: number; x: number; y: number } | null = null
    const down = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 2) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return
      view.yaw -= (event.clientX - drag.x) * 0.006
      view.pitch = Math.min(
        orbit.maxPitch,
        Math.max(orbit.minPitch, view.pitch + (event.clientY - drag.y) * 0.004)
      )
      drag.x = event.clientX
      drag.y = event.clientY
    }
    const up = (event: PointerEvent) => {
      if (drag?.id === event.pointerId) drag = null
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      view.zoom = Math.min(
        orbit.maxZoom,
        Math.max(orbit.minZoom, view.zoom * Math.exp(event.deltaY * 0.0012))
      )
    }
    const menu = (event: MouseEvent) => event.preventDefault()
    element.addEventListener("pointerdown", down)
    element.addEventListener("pointermove", move)
    element.addEventListener("pointerup", up)
    element.addEventListener("pointercancel", up)
    element.addEventListener("wheel", wheel, { passive: false })
    element.addEventListener("contextmenu", menu)
    return () => {
      element.removeEventListener("pointerdown", down)
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerup", up)
      element.removeEventListener("pointercancel", up)
      element.removeEventListener("wheel", wheel)
      element.removeEventListener("contextmenu", menu)
    }
  }, [gl, orbit])
  const arrowMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#000000",
        emissive: arrow?.color ?? "#ffffff",
        emissiveIntensity: 2.5,
      }),
    [arrow?.color]
  )
  const arrowGeometry = useMemo(
    () => new ConeGeometry(arrow?.size ?? 1, (arrow?.size ?? 1) * 2.5, 3),
    [arrow?.size]
  )

  useEffect(() => {
    const scooterBody = scooterBodyRef.current
    const scooterCollider = scooterColliderRef.current
    const scooterBall = scooterBallRef.current
    const riderBody = riderBodyRef.current
    const riderCollider = riderColliderRef.current
    if (
      !scooterBody ||
      !scooterCollider ||
      !scooterBall ||
      !riderBody ||
      !riderCollider
    )
      return
    const t = tuning
    const physics: CourierPhysics = {
      tuning: t,
      rapier,
      world,
      scooterBody,
      scooterCollider,
      scooterBall,
      scooterController: world.createCharacterController(
        t.controllers.scooter.offset
      ),
      riderBody,
      riderCollider,
      riderController: world.createCharacterController(
        t.controllers.rider.offset
      ),
      shapes: {
        turn: new rapier.Capsule(
          t.scooterHalfLength,
          t.wheelRadius - 0.12 * t.unit
        ),
        body: new rapier.Capsule(
          t.scooterHalfLength,
          t.wheelRadius - 0.04 * t.unit
        ),
        rider: new rapier.Capsule(t.riderHalfHeight, t.riderRadius),
        kick: new rapier.Ball(2.4 * t.unit),
      },
    }
    configureControllers(physics)
    riderBody.setEnabled(courierRef.current.mode !== "riding")
    physicsRef.current = physics
    if (externalPhysicsRef) externalPhysicsRef.current = physics
    return () => {
      physicsRef.current = null
      if (externalPhysicsRef) externalPhysicsRef.current = null
      world.removeCharacterController(physics.scooterController)
      world.removeCharacterController(physics.riderController)
    }
  }, [world, rapier, tuning, courierRef, externalPhysicsRef])

  useEffect(() => {
    for (const group of [
      scooterModelRef.current,
      seatRef.current,
      walkerRef.current,
    ]) {
      group?.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [])

  useBeforePhysicsStep((stepWorld) => {
    const physics = physicsRef.current
    if (!physics) return
    const input = inputRef.current
    stepCourier(
      courierRef.current,
      physics,
      input,
      Math.min(stepWorld.timestep, 1 / 30),
      paused || Boolean(hiddenRef?.current)
    )
    for (const key of ONE_SHOT_KEYS) input[key] = false
  })

  useFrame((state, rawDelta) => {
    const courier = courierRef.current
    const view = viewRef.current
    const tilt = tiltRef.current
    const walker = walkerRef.current
    const seat = seatRef.current
    if (!tilt || !walker || !seat) return
    const dt = Math.min(rawDelta, 1 / 20)
    const s = courier.scooter
    const r = courier.rider
    const scooterObject = tilt.parent
    const riderObject = walker.parent
    if (!scooterObject || !riderObject) return
    const hidden = Boolean(hiddenRef?.current)

    // scooter model: sits on the ground, pitches on ramps, leans into turns
    tilt.position.y = s.groundY - scooterObject.position.y
    view.euler.set(
      s.lean,
      0,
      s.pitch + Math.sin(state.clock.elapsedTime * 40) * s.bump * 0.05
    )
    tilt.quaternion.setFromEuler(view.euler)
    const model = scooterModelRef.current
    for (const name of WHEEL_NODES) {
      const wheel = model?.getObjectByName(name)
      if (wheel) wheel.rotation.z = -s.wheelSpin
    }

    const rigs = rigsRef.current
    rigs.mounted ??= findRig(seat)
    rigs.walking ??= findRig(walker)

    const riding =
      courier.mode === "riding" ||
      (courier.mode === "dismounting" && courier.modeTime < 0.04)
    seat.visible = riding && !hidden
    walker.visible = !riding && !hidden
    const time = state.clock.elapsedTime

    if (riding && rigs.mounted) {
      ridingPose(
        {
          steer: s.steer,
          lean: s.lean,
          speed: s.speed / u,
          footDown: s.footDown,
          bump: s.bump,
          time,
        },
        view.pose
      )
      applyPose(rigs.mounted, view.pose, 0)
    }

    if (!riding && rigs.walking) {
      const hipsDrop = standingPose(
        {
          gait: r.gait,
          run: r.run,
          phase: r.phase,
          air: r.air,
          vy: r.velocity.y / u,
          landing: r.landing,
          action: r.action,
          actionTime: r.actionTime,
          wading: r.wading,
          time,
        },
        view.standing
      )
      let rideWeight = 0
      let yaw = r.yaw
      if (courier.mode === "dismounting" || courier.mode === "mounting") {
        const mounting = courier.mode === "mounting"
        const t = Math.min(
          1,
          courier.modeTime / (mounting ? MOUNT_TIME : DISMOUNT_TIME)
        )
        const e = t * t * (3 - 2 * t)
        const hop = mounting ? e : 1 - e
        rideWeight = hop
        if (mounting) yaw = lerpAngle(r.yawFrom, s.heading, e)
        walker.position.set(
          r.hop.x * hop,
          -drop + r.hop.y * hop + Math.sin(Math.PI * t) * 2.4 * u,
          r.hop.z * hop
        )
      } else {
        walker.position.set(0, -drop - (r.wading ? 1.8 * u : 0), 0)
      }
      walker.rotation.y = yaw
      blendPose(view.pose, view.standing, RIDE_POSE, rideWeight)
      applyPose(rigs.walking, view.pose, hipsDrop * (1 - rideWeight))
    }

    // camera follows whichever is moving: the scooter, or the rider on foot
    const onFoot = !riding
    if (onFoot) {
      walker.getWorldPosition(view.target)
      view.target.x += r.velocity.x * 0.12
      view.target.y += camera.walkLift
      view.target.z += r.velocity.z * 0.12
    } else {
      scooterObject.getWorldPosition(view.target)
      view.target.x += s.velocity.x * 0.3
      view.target.z += s.velocity.z * 0.3
    }
    const shot = shotRef?.current
    if (shot) {
      view.look.lerp(shot.target, 1 - Math.exp(-3 * dt))
      state.camera.position.lerp(shot.position, 1 - Math.exp(-2.5 * dt))
    } else {
      if (!view.placed) {
        view.look.copy(view.target)
        view.placed = true
      }
      view.look.lerp(view.target, 1 - Math.exp(-5 * dt))
      view.distance +=
        ((onFoot ? camera.walk : camera.ride) * view.zoom - view.distance) *
        (1 - Math.exp(-(orbit ? 4 : 2) * dt))
      if (orbit) {
        // climb over whatever hides the player, then settle back down
        let lift = 0
        if (occluded) {
          for (; lift < 1.2; lift += 0.1) {
            const pitch = Math.min(orbit.maxPitch, view.pitch + lift)
            const flat = Math.cos(pitch)
            view.direction.set(
              Math.sin(view.yaw) * flat,
              Math.sin(pitch),
              Math.cos(view.yaw) * flat
            )
            if (!occluded(view.look, view.direction, view.distance)) break
          }
        }
        view.lift +=
          (lift - view.lift) *
          (1 - Math.exp(-(lift > view.lift ? 6 : 1.5) * dt))
        const pitch = Math.min(orbit.maxPitch, view.pitch + view.lift)
        const flat = Math.cos(pitch)
        view.direction.set(
          Math.sin(view.yaw) * flat,
          Math.sin(pitch),
          Math.cos(view.yaw) * flat
        )
        // walking keys follow the camera: up the screen is away from it
        physicsRef.current?.tuning.cameraForward.set(
          -Math.sin(view.yaw),
          0,
          -Math.cos(view.yaw)
        )
      }
      view.target
        .copy(view.look)
        .addScaledVector(
          orbit ? view.direction : camera.direction,
          view.distance
        )
      // an orbiting camera follows the mouse closely
      state.camera.position.lerp(
        view.target,
        1 - Math.exp(-(orbit ? 6 : 3) * dt)
      )
    }
    state.camera.lookAt(view.look)

    // track for the world's logic and the HUD
    const active: Object3D = onFoot ? walker : scooterObject
    active.getWorldPosition(view.target)
    if (trackRef) {
      const track = trackRef.current
      track.x = view.target.x
      track.z = view.target.z
      track.speed = onFoot ? Math.hypot(r.velocity.x, r.velocity.z) : s.speed
    }

    // floating arrow towards the active destination
    const arrowMesh = arrowRef.current
    const destination = targetRef?.current
    if (arrowMesh && arrow) {
      arrowMesh.visible = Boolean(destination) && !hidden
      if (destination) {
        arrowMesh.position.set(
          view.target.x,
          view.target.y + (onFoot ? arrow.walk : arrow.ride),
          view.target.z
        )
        arrowMesh.rotation.set(
          0,
          Math.atan2(
            -(destination[1] - view.target.z),
            destination[0] - view.target.x
          ),
          -Math.PI / 2
        )
      }
    }

    const slow = Math.abs(s.speed) < tuning.dismountSpeed
    const status = `${onFoot}|${courier.canMount}|${courier.mode === "riding" && slow}`
    if (status !== view.status) {
      view.status = status
      onStatus({
        onFoot,
        canMount: courier.mode === "walking" && courier.canMount,
        canDismount: courier.mode === "riding" && slow,
      })
    }
  })

  const bodyHalf: [number, number, number] = [
    0.5 * scale,
    0.24 * scale,
    0.18 * scale,
  ]
  return (
    <>
      <RigidBody
        ref={scooterBodyRef}
        type="kinematicPosition"
        colliders={false}
        position={[...start.position]}
        rotation={[0, start.heading, 0]}
      >
        <CapsuleCollider
          ref={scooterColliderRef}
          args={[tuning.scooterHalfLength, tuning.wheelRadius]}
          rotation={[0, 0, Math.PI / 2]}
        />
        <BallCollider ref={scooterBallRef} args={[tuning.wheelRadius]} sensor />
        {/* body and seat, so the rider can bump into it or stand on it */}
        <CuboidCollider
          args={bodyHalf}
          position={[-0.086 * scale, 0.26 * scale, 0]}
        />
        <group ref={tiltRef}>
          <group ref={scooterModelRef} scale={scale}>
            <primitive object={scooterScene} />
          </group>
          <group
            ref={seatRef}
            position={[SEAT_OFFSET.x * scale, SEAT_OFFSET.y * scale, 0]}
            scale={scale}
          >
            <primitive object={mountedRider} />
          </group>
        </group>
      </RigidBody>
      <RigidBody
        ref={riderBodyRef}
        type="kinematicPosition"
        colliders={false}
        position={
          walkStart
            ? [walkStart[0], walkStart[1] + drop + 0.05 * u, walkStart[2]]
            : [start.position[0], start.position[1] + 20 * u, start.position[2]]
        }
      >
        <CapsuleCollider
          ref={riderColliderRef}
          args={[tuning.riderHalfHeight, tuning.riderRadius]}
        />
        <group ref={walkerRef} name={walkerName} visible={false}>
          <group scale={scale}>
            <primitive object={walkingRider} />
          </group>
        </group>
      </RigidBody>
      {arrow && (
        <mesh
          ref={arrowRef}
          geometry={arrowGeometry}
          material={arrowMaterial}
        />
      )}
    </>
  )
}

function lerpAngle(from: number, to: number, t: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * t
}
