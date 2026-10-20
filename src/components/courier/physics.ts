import type {
  Collider,
  KinematicCharacterController,
  RigidBody,
  Shape,
  World,
} from "@dimforge/rapier3d-compat"
import type { useRapier } from "@react-three/rapier"
import { Quaternion, Vector3 } from "three"
import type { DriveInput } from "./input"
import { ACTION_DURATION, SEAT_OFFSET, type RiderAction } from "./riderPose"

type RapierModule = ReturnType<typeof useRapier>["rapier"]

// The rider on foot and the scooter they ride are kinematic bodies moved by
// Rapier's character controller: it slides them along walls, climbs small
// steps and slopes, and pushes loose props. Velocities, grip and gravity are
// ours. Every number lives in a CourierTuning (the kampung's is in
// kampung/tuning.ts), so the feel can be retuned without touching the code.

export interface CourierTuning {
  // models are built at real size in metres; this scales them into the world
  modelScale: number
  // multiplier for small incidental distances (ray lifts, skins, slack)
  unit: number
  gravity: number
  maxFall: number
  start: { position: readonly [number, number, number]; heading: number }
  resetBelow: number
  // the follow camera's ground direction: on foot, W walks this way
  cameraForward: Vector3

  // scooter
  wheelRadius: number
  wheelOffset: number
  scooterHalfLength: number
  scooterSkin: number
  maxSpeed: number
  maxReverse: number
  acceleration: number
  braking: number
  coasting: number
  turnRate: number
  steerSpeedRef: number
  grip: number
  driftGrip: number
  slopePull: number
  tipDrop: number
  dismountSpeed: number
  bounceSpeed: number
  bumpSpeed: number
  leanSpeedRef: number
  dismountSpots: [number, number][]

  // rider
  riderRadius: number
  riderHalfHeight: number
  riderSkin: number
  walkSpeed: number
  runSpeed: number
  jumpHeight: number
  fallMultiplier: number
  shortHopMultiplier: number
  coyoteTime: number
  jumpBuffer: number
  mantleReach: number
  mountRange: number
  kickSpeed: number
  kickLift: number
  strideWalk: number
  strideRun: number

  controllers: {
    scooter: ControllerTuning
    rider: ControllerTuning
  }

  // world-specific surfaces
  gripAt?: (x: number, z: number) => number | null
  wadingAt?: (x: number, z: number, feetY: number) => boolean
}

export interface ControllerTuning {
  offset: number
  autostep: [number, number]
  snap: number
  climb: number
  slide: number
  mass: number
}

export const MOUNT_TIME = 0.42
export const DISMOUNT_TIME = 0.42

export function riderCenter(t: CourierTuning) {
  return t.riderRadius + t.riderHalfHeight
}

// from the capsule centre down to the model's feet
export function riderRootDrop(t: CourierTuning) {
  return riderCenter(t) + t.riderSkin
}

export type CourierMode = "riding" | "dismounting" | "walking" | "mounting"

export interface Courier {
  mode: CourierMode
  modeTime: number
  canMount: boolean
  scooter: {
    heading: number
    velocity: Vector3
    speed: number
    grounded: boolean
    // ground height under the wheels, for the model and the rider's seat
    groundY: number
    slope: number
    pitch: number
    lean: number
    steer: number
    wheelSpin: number
    bump: number
    still: number
    footDown: number
    // the capsule cannot tip, so past an edge a centred ball takes over
    // until the scooter lands clear of it
    tipping: boolean
  }
  rider: {
    yaw: number
    yawFrom: number
    velocity: Vector3
    grounded: boolean
    airTime: number
    air: number
    coyote: number
    jumpBuffer: number
    landing: number
    phase: number
    gait: number
    run: number
    action: RiderAction
    actionTime: number
    kicked: boolean
    mantleFrom: Vector3
    mantleTo: Vector3
    wading: boolean
    // seat minus feet, for the hop on or off the scooter
    hop: Vector3
  }
  // feet of whoever is being controlled, for things that react to them
  focus: Vector3
}

export function createCourier(
  t: CourierTuning,
  mode: CourierMode = "riding"
): Courier {
  return {
    mode,
    modeTime: 0,
    canMount: false,
    scooter: {
      heading: t.start.heading,
      velocity: new Vector3(),
      speed: 0,
      grounded: false,
      groundY: 0,
      slope: 0,
      pitch: 0,
      lean: 0,
      steer: 0,
      wheelSpin: 0,
      bump: 0,
      still: 0,
      footDown: 0,
      tipping: false,
    },
    rider: {
      yaw: t.start.heading,
      yawFrom: t.start.heading,
      velocity: new Vector3(),
      grounded: true,
      airTime: 0,
      air: 0,
      coyote: 0,
      jumpBuffer: 0,
      landing: 0,
      phase: 0,
      gait: 0,
      run: 0,
      action: "none",
      actionTime: 0,
      kicked: false,
      mantleFrom: new Vector3(),
      mantleTo: new Vector3(),
      wading: false,
      hop: new Vector3(),
    },
    focus: new Vector3(...t.start.position),
  }
}

export interface CourierPhysics {
  tuning: CourierTuning
  rapier: RapierModule
  world: World
  scooterBody: RigidBody
  scooterCollider: Collider
  // a ball at the centre, used while the scooter tips over an edge
  scooterBall: Collider
  scooterController: KinematicCharacterController
  riderBody: RigidBody
  riderCollider: Collider
  riderController: KinematicCharacterController
  shapes: { turn: Shape; body: Shape; rider: Shape; kick: Shape }
}

function configure(
  controller: KinematicCharacterController,
  c: ControllerTuning
) {
  controller.setUp({ x: 0, y: 1, z: 0 })
  controller.enableAutostep(c.autostep[0], c.autostep[1], false)
  controller.enableSnapToGround(c.snap)
  controller.setMaxSlopeClimbAngle((c.climb * Math.PI) / 180)
  controller.setMinSlopeSlideAngle((c.slide * Math.PI) / 180)
  controller.setApplyImpulsesToDynamicBodies(true)
  controller.setCharacterMass(c.mass)
}

export function configureControllers(physics: CourierPhysics) {
  configure(physics.scooterController, physics.tuning.controllers.scooter)
  configure(physics.riderController, physics.tuning.controllers.rider)
}

const UP = new Vector3(0, 1, 0)
const CAPSULE_TO_X = new Quaternion().setFromAxisAngle(
  new Vector3(0, 0, 1),
  Math.PI / 2
)
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 }
const quat = new Quaternion()
const shapeRotation = new Quaternion()
const point = new Vector3()
const seat = new Vector3()
const move = new Vector3()

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

function angleTowards(from: number, to: number, t: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * t
}

function belongsTo(collider: Collider, body: RigidBody) {
  return collider.parent()?.handle === body.handle
}

// one physics step for the scooter and the rider
export function stepCourier(
  courier: Courier,
  physics: CourierPhysics,
  input: DriveInput,
  dt: number,
  paused: boolean
) {
  const t = physics.tuning
  courier.modeTime += dt
  const scooterY = physics.scooterBody.translation().y
  const riderY = physics.riderBody.translation().y
  if (
    input.reset ||
    scooterY < t.resetBelow ||
    (courier.mode === "walking" && riderY < t.resetBelow)
  ) {
    resetCourier(courier, physics)
    return
  }

  if (input.interact && !paused) {
    if (
      courier.mode === "riding" &&
      Math.abs(courier.scooter.speed) < t.dismountSpeed &&
      courier.scooter.grounded
    ) {
      beginDismount(courier, physics)
    } else if (
      courier.mode === "walking" &&
      courier.canMount &&
      courier.rider.action === "none"
    ) {
      beginMount(courier, physics)
    }
  }

  stepScooter(courier, physics, input, dt, courier.mode === "riding" && !paused)
  stepRider(courier, physics, input, dt, paused)

  if (courier.mode === "riding") {
    const position = physics.scooterBody.translation()
    courier.focus.set(position.x, courier.scooter.groundY, position.z)
  } else {
    const position = physics.riderBody.translation()
    courier.focus.set(position.x, position.y - riderRootDrop(t), position.z)
  }
}

function resetCourier(courier: Courier, physics: CourierPhysics) {
  const t = physics.tuning
  const [x, y, z] = t.start.position
  physics.scooterBody.setTranslation({ x, y, z }, true)
  physics.scooterBody.setNextKinematicTranslation({ x, y, z })
  quat.setFromAxisAngle(UP, t.start.heading)
  physics.scooterBody.setRotation(quat, true)
  physics.scooterBody.setNextKinematicRotation(quat)
  physics.riderBody.setEnabled(false)
  const s = courier.scooter
  s.heading = t.start.heading
  s.velocity.set(0, 0, 0)
  s.speed = 0
  s.lean = 0
  s.pitch = 0
  s.tipping = false
  courier.mode = "riding"
  courier.modeTime = 0
  courier.rider.action = "none"
}

function rotationBlocked(
  physics: CourierPhysics,
  x: number,
  y: number,
  z: number,
  heading: number
) {
  shapeRotation.setFromAxisAngle(UP, heading).multiply(CAPSULE_TO_X)
  // tested a little above the floor so ramps and kerbs never lock steering
  const hit = physics.world.intersectionWithShape(
    { x, y: y + 0.5 * physics.tuning.unit, z },
    shapeRotation,
    physics.shapes.turn,
    physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS |
      physics.rapier.QueryFilterFlags.EXCLUDE_DYNAMIC,
    undefined,
    undefined,
    physics.scooterBody,
    (collider) => !belongsTo(collider, physics.riderBody)
  )
  return hit !== null
}

function groundBelow(
  physics: CourierPhysics,
  x: number,
  y: number,
  z: number,
  reach: number,
  exclude: RigidBody
) {
  const ray = new physics.rapier.Ray({ x, y, z }, { x: 0, y: -1, z: 0 })
  const hit = physics.world.castRayAndGetNormal(
    ray,
    reach,
    true,
    physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS,
    undefined,
    undefined,
    exclude,
    (collider) =>
      !belongsTo(collider, physics.riderBody) &&
      !belongsTo(collider, physics.scooterBody)
  )
  return hit ? { y: y - hit.timeOfImpact, normalY: hit.normal.y } : null
}

const touching = new Set<number>()

// does the scooter's capsule, moved by `delta`, overlap a static collider it
// was not already overlapping?
function capsuleTouchesNew(
  physics: CourierPhysics,
  heading: number,
  from: { x: number; y: number; z: number },
  delta: Vector3
) {
  shapeRotation.setFromAxisAngle(UP, heading).multiply(CAPSULE_TO_X)
  const flags =
    physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS |
    physics.rapier.QueryFilterFlags.EXCLUDE_DYNAMIC
  const filter = (collider: Collider) => !belongsTo(collider, physics.riderBody)
  touching.clear()
  physics.world.intersectionsWithShape(
    from,
    shapeRotation,
    physics.shapes.body,
    (collider) => {
      touching.add(collider.handle)
      return true
    },
    flags,
    undefined,
    undefined,
    physics.scooterBody,
    filter
  )
  let fresh = false
  physics.world.intersectionsWithShape(
    {
      x: from.x + delta.x,
      y: from.y + delta.y + 0.05 * physics.tuning.unit,
      z: from.z + delta.z,
    },
    shapeRotation,
    physics.shapes.body,
    (collider) => {
      fresh = !touching.has(collider.handle)
      return !fresh
    },
    flags,
    undefined,
    undefined,
    physics.scooterBody,
    filter
  )
  return fresh
}

function stepScooter(
  courier: Courier,
  physics: CourierPhysics,
  input: DriveInput,
  dt: number,
  driving: boolean
) {
  const t = physics.tuning
  const u = t.unit
  const s = courier.scooter
  const body = physics.scooterBody
  const position = body.translation()

  const steerInput = driving ? (input.left ? 1 : 0) - (input.right ? 1 : 0) : 0
  const throttle = driving ? (input.forward ? 1 : 0) - (input.back ? 1 : 0) : 0
  s.steer += (steerInput - s.steer) * ease(12, dt)
  const drifting = driving && input.drift

  // steer around the rear axle like a real two-wheeler
  let fx = Math.cos(s.heading)
  let fz = -Math.sin(s.heading)
  let speed = s.velocity.x * fx + s.velocity.z * fz
  let turn = s.grounded
    ? s.steer *
      t.turnRate *
      clamp(speed / t.steerSpeedRef, -1, 1) *
      (drifting ? 1.35 : 1)
    : s.steer * t.turnRate * 0.2
  turn *= dt
  let shiftX = 0
  let shiftZ = 0
  if (turn !== 0) {
    const heading = s.heading + turn
    shiftX = (Math.cos(heading) - fx) * t.wheelOffset
    shiftZ = (-Math.sin(heading) - fz) * t.wheelOffset
    if (
      rotationBlocked(
        physics,
        position.x + shiftX,
        position.y,
        position.z + shiftZ,
        heading
      )
    ) {
      turn = 0
      shiftX = 0
      shiftZ = 0
    }
  }
  s.heading += turn
  fx = Math.cos(s.heading)
  fz = -Math.sin(s.heading)
  const rx = -fz
  const rz = fx

  // the velocity lags the new heading: grip decides how fast the slide dies
  speed = s.velocity.x * fx + s.velocity.z * fz
  let lateral = s.velocity.x * rx + s.velocity.z * rz
  if (s.grounded) {
    if (throttle > 0) speed += (speed < 0 ? t.braking : t.acceleration) * dt
    else if (throttle < 0)
      speed -= (speed > 0 ? t.braking : t.acceleration * 0.6) * dt
    else {
      // a parked or abandoned scooter holds its brake
      const slow = driving ? t.coasting : t.braking * 1.5
      speed -= Math.sign(speed) * Math.min(Math.abs(speed), slow * dt)
    }
    if (driving) speed += t.slopePull * s.slope * dt
    speed = clamp(speed, -t.maxReverse, t.maxSpeed * 1.25)
    if (throttle > 0 && speed > t.maxSpeed && s.slope >= 0)
      speed = Math.max(t.maxSpeed, speed - t.acceleration * dt)
    const surface = t.gripAt?.(position.x, position.z) ?? null
    const grip = drifting ? t.driftGrip : (surface ?? t.grip)
    lateral *= Math.exp(-grip * dt)
  }
  s.velocity.x = fx * speed + rx * lateral
  s.velocity.z = fz * speed + rz * lateral
  if (s.grounded) s.velocity.y = -u
  else s.velocity.y = Math.max(s.velocity.y - t.gravity * dt, -t.maxFall)

  const controller = physics.scooterController
  const filter = (collider: Collider) =>
    !belongsTo(collider, body) && !belongsTo(collider, physics.riderBody)
  const flags = physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS
  const desiredX = s.velocity.x * dt + shiftX
  const desiredY = s.velocity.y * dt
  const desiredZ = s.velocity.z * dt + shiftZ
  // tipping: the centred ball moves the scooter so it can drop off the edge
  // and drive away even while the capsule still overlaps the ledge
  controller.computeColliderMovement(
    s.tipping ? physics.scooterBall : physics.scooterCollider,
    { x: desiredX, y: desiredY, z: desiredZ },
    flags,
    undefined,
    filter
  )
  const computed = controller.computedMovement()
  move.set(computed.x, computed.y, computed.z)
  const wasGrounded = s.grounded
  const fallSpeed = -s.velocity.y
  s.grounded = controller.computedGrounded()

  // walls take the speed into them, a hard hit bounces back a little
  for (let i = 0; i < controller.numComputedCollisions(); i++) {
    const hit = controller.computedCollision(i)
    if (!hit) continue
    const n = hit.normal1
    if (Math.abs(n.y) > 0.7) {
      if (n.y < -0.7 && s.velocity.y > 0) s.velocity.y = 0
      continue
    }
    const length = Math.hypot(n.x, n.z)
    const nx = n.x / length
    const nz = n.z / length
    const into = s.velocity.x * nx + s.velocity.z * nz
    if (into < 0) {
      const bounce = -into > t.bounceSpeed ? 0.3 : 0
      s.velocity.x -= nx * into * (1 + bounce)
      s.velocity.z -= nz * into * (1 + bounce)
      s.bump = Math.max(s.bump, Math.min(1, -into / t.bumpSpeed))
    }
  }
  // ...but the ball must not carry the nose into something new
  if (
    s.tipping &&
    (move.x !== 0 || move.z !== 0) &&
    capsuleTouchesNew(physics, s.heading, position, move)
  ) {
    move.x = 0
    move.z = 0
    s.velocity.x = 0
    s.velocity.z = 0
  }
  if (s.grounded) {
    if (!wasGrounded && fallSpeed > 60 * u)
      s.bump = Math.max(s.bump, Math.min(1, fallSpeed / (300 * u)))
    s.velocity.y = 0
  }

  const x = position.x + move.x
  const y = position.y + move.y
  const z = position.z + move.z
  body.setNextKinematicTranslation({ x, y, z })
  quat.setFromAxisAngle(UP, s.heading)
  body.setNextKinematicRotation(quat)
  s.speed = s.velocity.x * fx + s.velocity.z * fz

  // the wheels find the ground: pitch on ramps, the model sits on the surface
  const lift = 2 * u
  const reach = t.wheelRadius + 5 * u
  const front = groundBelow(
    physics,
    x + fx * t.wheelOffset,
    y + lift,
    z + fz * t.wheelOffset,
    reach,
    body
  )
  const rear = groundBelow(
    physics,
    x - fx * t.wheelOffset,
    y + lift,
    z - fz * t.wheelOffset,
    reach,
    body
  )
  const floor = y - t.wheelRadius - t.scooterSkin
  if (s.grounded && !s.tipping) {
    // nothing under the middle: the front or back hangs over a drop. The
    // allowance keeps ramps (where the middle rides higher) out of it.
    const middle = groundBelow(
      physics,
      x,
      y + lift,
      z,
      lift + t.wheelRadius + t.scooterSkin + t.tipDrop,
      body
    )
    if (!middle) s.tipping = true
  } else if (s.tipping && s.grounded) {
    shapeRotation.setFromAxisAngle(UP, s.heading).multiply(CAPSULE_TO_X)
    const clear = !physics.world.intersectionWithShape(
      { x, y: y + 0.05 * u, z },
      shapeRotation,
      physics.shapes.body,
      physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS |
        physics.rapier.QueryFilterFlags.EXCLUDE_DYNAMIC,
      undefined,
      undefined,
      body,
      (collider) => !belongsTo(collider, physics.riderBody)
    )
    if (clear) s.tipping = false
  }
  let pitch = 0
  if (front && rear && s.grounded) {
    pitch = Math.atan2(front.y - rear.y, t.wheelOffset * 2)
    s.groundY = Math.max((front.y + rear.y) / 2, floor - 0.6 * u)
  } else if (!s.grounded) {
    pitch = clamp(s.velocity.y / (500 * u), -0.35, 0.25)
    s.groundY = floor
  } else {
    s.groundY = Math.max(front?.y ?? floor, rear?.y ?? floor, floor - 0.6 * u)
  }
  s.slope = s.grounded ? -Math.sin(pitch) : 0
  s.pitch += (pitch - s.pitch) * ease(s.grounded ? 16 : 4, dt)

  let lean = 0
  if (courier.mode === "riding" && s.grounded)
    lean = -s.steer * clamp(Math.abs(s.speed) / t.leanSpeedRef, 0, 1) * 0.38
  else if (courier.mode === "walking" || courier.mode === "dismounting")
    lean = -0.12 // resting on the side stand
  s.lean += (lean - s.lean) * ease(6, dt)
  s.bump *= Math.exp(-5 * dt)
  s.wheelSpin += (s.speed / t.wheelRadius) * dt
  s.still = Math.abs(s.speed) < 1.5 * u ? s.still + dt : 0
  const footDown = courier.mode === "riding" && s.still > 0.35 ? 1 : 0
  s.footDown += (footDown - s.footDown) * ease(8, dt)
}

// the seated rider's feet position for the scooter's current pose
export function seatRoot(
  courier: Courier,
  physics: CourierPhysics,
  out: Vector3
) {
  const t = physics.tuning
  const s = courier.scooter
  const position = physics.scooterBody.translation()
  const along = SEAT_OFFSET.x * t.modelScale
  return out.set(
    position.x + Math.cos(s.heading) * along,
    s.groundY + SEAT_OFFSET.y * t.modelScale,
    position.z - Math.sin(s.heading) * along
  )
}

function beginDismount(courier: Courier, physics: CourierPhysics) {
  const t = physics.tuning
  const s = courier.scooter
  const position = physics.scooterBody.translation()
  const fx = Math.cos(s.heading)
  const fz = -Math.sin(s.heading)
  const drop = riderRootDrop(t)
  const y = s.groundY + drop + 0.05 * t.unit
  for (const [along, side] of t.dismountSpots) {
    const x = position.x + fx * along - fz * side
    const z = position.z + fz * along + fx * side
    const blocked = physics.world.intersectionWithShape(
      { x, y, z },
      IDENTITY,
      physics.shapes.rider,
      physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS
    )
    if (blocked) continue
    physics.riderBody.setEnabled(true)
    physics.riderBody.setTranslation({ x, y, z }, true)
    physics.riderBody.setNextKinematicTranslation({ x, y, z })
    const r = courier.rider
    seatRoot(courier, physics, seat)
    r.hop.set(seat.x - x, seat.y - (y - drop), seat.z - z)
    r.yaw = s.heading
    r.yawFrom = s.heading
    r.velocity.set(0, 0, 0)
    r.grounded = true
    r.air = 0
    r.action = "none"
    courier.mode = "dismounting"
    courier.modeTime = 0
    return
  }
}

function beginMount(courier: Courier, physics: CourierPhysics) {
  const r = courier.rider
  const position = physics.riderBody.translation()
  seatRoot(courier, physics, seat)
  r.hop.set(
    seat.x - position.x,
    seat.y - (position.y - riderRootDrop(physics.tuning)),
    seat.z - position.z
  )
  r.yawFrom = r.yaw
  r.velocity.set(0, 0, 0)
  courier.mode = "mounting"
  courier.modeTime = 0
  courier.canMount = false
}

function stepRider(
  courier: Courier,
  physics: CourierPhysics,
  input: DriveInput,
  dt: number,
  paused: boolean
) {
  const t = physics.tuning
  const u = t.unit
  const drop = riderRootDrop(t)
  const r = courier.rider
  if (courier.mode === "riding") return
  if (courier.mode === "dismounting" || courier.mode === "mounting") {
    const mounting = courier.mode === "mounting"
    if (courier.modeTime >= (mounting ? MOUNT_TIME : DISMOUNT_TIME)) {
      courier.mode = mounting ? "riding" : "walking"
      courier.modeTime = 0
      if (mounting) physics.riderBody.setEnabled(false)
    }
    return
  }

  const body = physics.riderBody
  const position = body.translation()
  r.landing *= Math.exp(-7 * dt)

  if (r.action !== "none") {
    r.actionTime += dt
    if (r.actionTime >= ACTION_DURATION[r.action]) {
      if (r.action === "mantle") {
        r.grounded = true
        r.landing = 0.35
      }
      r.action = "none"
    }
  }

  if (r.action === "mantle") {
    const k = r.actionTime / ACTION_DURATION.mantle
    const up = smoothstep(clamp(k / 0.6, 0, 1))
    const over = smoothstep(clamp((k - 0.35) / 0.65, 0, 1))
    body.setNextKinematicTranslation({
      x: r.mantleFrom.x + (r.mantleTo.x - r.mantleFrom.x) * over,
      y: r.mantleFrom.y + (r.mantleTo.y - r.mantleFrom.y) * up,
      z: r.mantleFrom.z + (r.mantleTo.z - r.mantleFrom.z) * over,
    })
    r.velocity.set(0, 0, 0)
    r.air = Math.max(0, r.air - dt * 6)
    return
  }

  // camera-relative movement
  const f = t.cameraForward
  const along = paused ? 0 : (input.forward ? 1 : 0) - (input.back ? 1 : 0)
  const across = paused ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0)
  let dx = f.x * along - f.z * across
  let dz = f.z * along + f.x * across
  const length = Math.hypot(dx, dz)
  if (length > 0) {
    dx /= length
    dz /= length
  }
  const busy = r.action === "wave" || (r.action === "kick" && r.grounded)
  const moving = length > 0 && !busy
  const feetY = position.y - drop
  r.wading = t.wadingAt?.(position.x, position.z, feetY) ?? false
  const running = input.run && moving
  r.run += ((running ? 1 : 0) - r.run) * ease(6, dt)
  const target =
    (moving ? (running ? t.runSpeed : t.walkSpeed) : 0) * (r.wading ? 0.45 : 1)
  const response = ease(r.grounded ? 12 : 3.5, dt)
  r.velocity.x += (dx * target - r.velocity.x) * response
  r.velocity.z += (dz * target - r.velocity.z) * response
  if (moving) r.yaw = angleTowards(r.yaw, Math.atan2(-dz, dx), ease(14, dt))

  // jump with coyote time and a short input buffer
  const jumpSpeed = Math.sqrt(2 * t.gravity * t.jumpHeight)
  r.jumpBuffer = input.jump && !paused ? t.jumpBuffer : r.jumpBuffer - dt
  r.coyote = r.grounded ? t.coyoteTime : r.coyote - dt
  if (r.jumpBuffer > 0 && r.coyote > 0 && r.action !== "kick") {
    r.velocity.y = jumpSpeed * (r.wading ? 0.75 : 1)
    r.jumpBuffer = 0
    r.coyote = 0
    r.grounded = false
    if (r.action === "wave") r.action = "none"
  }
  if (!r.grounded || r.velocity.y > 0) {
    const multiplier =
      r.velocity.y < 0
        ? t.fallMultiplier
        : input.drift
          ? 1
          : t.shortHopMultiplier
    r.velocity.y = Math.max(
      r.velocity.y - t.gravity * multiplier * dt,
      -t.maxFall
    )
  } else {
    r.velocity.y = -u
  }

  if (!paused && r.grounded && r.action === "none") {
    if (input.kick) {
      r.action = "kick"
      r.actionTime = 0
      r.kicked = false
    } else if (input.wave) {
      r.action = "wave"
      r.actionTime = 0
    }
  }
  if (r.action === "kick" && !r.kicked && r.actionTime > 0.2) {
    r.kicked = true
    kick(physics, position, r.yaw)
  }

  const controller = physics.riderController
  controller.computeColliderMovement(
    physics.riderCollider,
    { x: r.velocity.x * dt, y: r.velocity.y * dt, z: r.velocity.z * dt },
    physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS,
    undefined,
    (collider) => !belongsTo(collider, body)
  )
  const computed = controller.computedMovement()
  const wasGrounded = r.grounded
  const fallSpeed = -r.velocity.y
  r.grounded = controller.computedGrounded()

  for (let i = 0; i < controller.numComputedCollisions(); i++) {
    const hit = controller.computedCollision(i)
    if (!hit) continue
    const n = hit.normal1
    if (n.y < -0.7 && r.velocity.y > 0) r.velocity.y = 0
    if (Math.abs(n.y) > 0.35) continue
    const length = Math.hypot(n.x, n.z)
    const nx = n.x / length
    const nz = n.z / length
    const into = r.velocity.x * nx + r.velocity.z * nz
    if (into < 0) {
      r.velocity.x -= nx * into
      r.velocity.z -= nz * into
    }
    // pushing into a wall in mid-air: try to climb onto it
    if (
      !r.grounded &&
      moving &&
      dx * -nx + dz * -nz > 0.5 &&
      r.velocity.y < jumpSpeed * 0.6 &&
      tryMantle(courier, physics, position, -nx, -nz)
    ) {
      return
    }
  }

  if (r.grounded) {
    if (!wasGrounded && fallSpeed > jumpSpeed * 0.35)
      r.landing = Math.max(
        r.landing,
        clamp((fallSpeed - jumpSpeed * 0.35) / (jumpSpeed * 2.3), 0.2, 1)
      )
    r.velocity.y = 0
    r.airTime = 0
  } else {
    r.airTime += dt
  }
  const airborne = !r.grounded && r.airTime > 0.07 ? 1 : 0
  r.air += (airborne - r.air) * ease(10, dt)

  const x = position.x + computed.x
  const y = position.y + computed.y
  const z = position.z + computed.z
  body.setNextKinematicTranslation({ x, y, z })

  const planar = Math.hypot(r.velocity.x, r.velocity.z)
  r.gait += (clamp(planar / t.walkSpeed, 0, 1) - r.gait) * ease(8, dt)
  r.phase +=
    ((planar * dt) / (t.strideWalk + t.strideRun * r.run)) * Math.PI * 2

  const scooter = physics.scooterBody.translation()
  courier.canMount =
    r.grounded &&
    r.action === "none" &&
    Math.hypot(x - scooter.x, z - scooter.z) < t.mountRange &&
    Math.abs(y - drop - courier.scooter.groundY) < 4 * u
}

// Climbing onto a ledge: look for a flat top within reach just beyond the
// wall, a little further in each try (a thin rim, a deeper floor behind it).
const MANTLE_STEPS = [0.7, 1.6, 2.6, 3.6]

function tryMantle(
  courier: Courier,
  physics: CourierPhysics,
  position: { x: number; y: number; z: number },
  dirX: number,
  dirZ: number
) {
  const t = physics.tuning
  const u = t.unit
  const drop = riderRootDrop(t)
  const feetY = position.y - drop
  for (const step of MANTLE_STEPS) {
    const reach = t.riderRadius + step * u
    const top = groundBelow(
      physics,
      position.x + dirX * reach,
      feetY + t.mantleReach + 0.3 * u,
      position.z + dirZ * reach,
      t.mantleReach + 0.3 * u - 0.8 * u,
      physics.riderBody
    )
    if (!top || top.normalY < 0.75) continue
    point.set(
      position.x + dirX * reach,
      top.y + drop + 0.05 * u,
      position.z + dirZ * reach
    )
    const blocked = physics.world.intersectionWithShape(
      point,
      IDENTITY,
      physics.shapes.rider,
      physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      physics.riderCollider
    )
    if (blocked) continue
    const r = courier.rider
    r.action = "mantle"
    r.actionTime = 0
    r.mantleFrom.set(position.x, position.y, position.z)
    r.mantleTo.copy(point)
    r.velocity.set(0, 0, 0)
    r.yaw = Math.atan2(-dirZ, dirX)
    return true
  }
  return false
}

function kick(
  physics: CourierPhysics,
  position: { x: number; y: number; z: number },
  yaw: number
) {
  const t = physics.tuning
  const u = t.unit
  const fx = Math.cos(yaw)
  const fz = -Math.sin(yaw)
  physics.world.intersectionsWithShape(
    {
      x: position.x + fx * 2.6 * u,
      y: position.y - riderRootDrop(t) + 1.6 * u,
      z: position.z + fz * 2.6 * u,
    },
    IDENTITY,
    physics.shapes.kick,
    (collider) => {
      const body = collider.parent()
      if (body?.isDynamic()) {
        const mass = body.mass()
        body.applyImpulse(
          {
            x: fx * mass * t.kickSpeed,
            y: mass * t.kickLift,
            z: fz * mass * t.kickSpeed,
          },
          true
        )
        body.applyTorqueImpulse(
          { x: -fz * mass * 4 * u, y: mass * 2 * u, z: fx * mass * 4 * u },
          true
        )
      }
      return true
    },
    physics.rapier.QueryFilterFlags.ONLY_DYNAMIC
  )
}
