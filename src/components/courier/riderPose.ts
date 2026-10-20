import { Euler, Quaternion, type Object3D } from "three"

// The rider (rider.glb) is a jointed toy: every limb is a rigid capsule under
// a pivot empty, rest pose standing with the arms hanging straight down.
// Axes are three.js ones for a rider facing +X: Z is the hinge axis (positive
// swings a limb forward, negative bends a knee), X rolls a limb out to the
// side (positive is outward for the left limbs, which sit on -Z).

export const JOINTS = [
  "Spine",
  "Neck",
  "ShoulderL",
  "ShoulderR",
  "ElbowL",
  "ElbowR",
  "ThighL",
  "ThighR",
  "KneeL",
  "KneeR",
  "AnkleL",
  "AnkleR",
] as const

export type Joint = (typeof JOINTS)[number]
export type Pose = Record<Joint, Quaternion>
type Angles = Record<Joint, [number, number, number]>

export const HIPS_HEIGHT = 0.83

export interface RiderRig {
  hips: Object3D
  joints: Record<Joint, Object3D>
}

export function findRig(root: Object3D): RiderRig | null {
  const hips = root.getObjectByName("Rig_Hips")
  if (!hips) return null
  const joints = {} as Record<Joint, Object3D>
  for (const joint of JOINTS) {
    const node = root.getObjectByName(`Rig_${joint}`)
    if (!node) return null
    joints[joint] = node
  }
  return { hips, joints }
}

export function createPose(): Pose {
  const pose = {} as Pose
  for (const joint of JOINTS) pose[joint] = new Quaternion()
  return pose
}

function createAngles(): Angles {
  const angles = {} as Angles
  for (const joint of JOINTS) angles[joint] = [0, 0, 0]
  return angles
}

// Seated on the scooter with hands on the grips, solved in Blender against
// the original modelled rider.
const RIDE_QUATERNIONS: Record<Joint, [number, number, number, number]> = {
  Spine: [0, 0, -0.1564, 0.9877],
  Neck: [0, 0, 0.1168, 0.9932],
  ShoulderL: [0.1454, 0, 0.5501, 0.8224],
  ShoulderR: [-0.1454, 0, 0.5501, 0.8224],
  ElbowL: [-0.0352, 0, 0.1723, 0.9844],
  ElbowR: [0.0352, 0, 0.1723, 0.9844],
  ThighL: [0.1218, 0, 0.7309, 0.6715],
  ThighR: [-0.1218, 0, 0.7309, 0.6715],
  KneeL: [-0.1125, 0, -0.691, 0.714],
  KneeR: [0.1125, 0, -0.691, 0.714],
  AnkleL: [-0.0115, -0.002, -0.0579, 0.9983],
  AnkleR: [0.0115, 0.002, -0.0579, 0.9983],
}

export const RIDE_POSE: Pose = (() => {
  const pose = createPose()
  for (const joint of JOINTS) {
    const [x, y, z, w] = RIDE_QUATERNIONS[joint]
    pose[joint].set(x, y, z, w).normalize()
  }
  return pose
})()

// The seated rider's root sits slightly behind the scooter's centre.
export const SEAT_OFFSET = { x: -0.2, y: 0.01 }

export type RiderAction =
  | "none"
  | "kick"
  | "wave"
  | "mantle"
  // looping gestures for the townsfolk
  | "talk"
  | "push"
  | "sweep"

export const ACTION_DURATION: Record<RiderAction, number> = {
  none: 0,
  kick: 0.5,
  wave: 1.6,
  mantle: 0.34,
  talk: Infinity,
  push: Infinity,
  sweep: Infinity,
}

export interface RiderMotion {
  // 0 standing still … 1 full walking or running stride
  gait: number
  run: number
  phase: number
  // 0 on the ground … 1 in the air; vy picks tuck or reach
  air: number
  vy: number
  landing: number
  action: RiderAction
  actionTime: number
  wading: boolean
  time: number
}

const euler = new Euler()

function add(angles: Angles, joint: Joint, x: number, y: number, z: number) {
  const a = angles[joint]
  a[0] += x
  a[1] += y
  a[2] += z
}

const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

const angles = createAngles()

// Procedural on-foot pose. Returns the hips drop in model units.
export function standingPose(motion: RiderMotion, out: Pose) {
  for (const joint of JOINTS) angles[joint].fill(0)
  const { gait, run, phase, time } = motion
  const s = Math.sin(phase)
  const c = Math.cos(phase)
  let hipsDrop = 0

  // idle: breathe, arms just clear of the jacket, glance around now and then
  const ground = 1 - motion.air
  add(angles, "Spine", 0, 0, Math.sin(time * 2.1) * 0.025)
  add(angles, "ShoulderL", 0.13, 0, Math.sin(time * 2.1 + 0.4) * 0.03)
  add(angles, "ShoulderR", -0.13, 0, Math.sin(time * 2.1 + 0.4) * 0.03)
  add(angles, "ElbowL", 0, 0, 0.18)
  add(angles, "ElbowR", 0, 0, 0.18)
  const look = Math.sin(time * 0.43) * Math.sin(time * 0.17)
  add(angles, "Neck", 0, look * 0.6 * (1 - gait), 0)

  // walk / run cycle
  if (gait > 0) {
    const legAmp = (0.5 + 0.35 * run) * gait * ground
    const kneeAmp = (0.95 + 0.6 * run) * gait * ground
    add(angles, "ThighL", 0, 0, s * legAmp)
    add(angles, "ThighR", 0, 0, -s * legAmp)
    add(angles, "KneeL", 0, 0, -(0.08 + Math.max(0, c) * kneeAmp))
    add(angles, "KneeR", 0, 0, -(0.08 + Math.max(0, -c) * kneeAmp))
    const armAmp = (0.42 + 0.45 * run) * gait * ground
    add(angles, "ShoulderL", 0, 0, -s * armAmp)
    add(angles, "ShoulderR", 0, 0, s * armAmp)
    add(angles, "ElbowL", 0, 0, (0.15 + run * 1.1) * gait)
    add(angles, "ElbowR", 0, 0, (0.15 + run * 1.1) * gait)
    add(angles, "Spine", 0, s * 0.12 * gait, -(0.06 + 0.22 * run) * gait)
    add(angles, "Neck", 0, -s * 0.1 * gait, (0.04 + 0.16 * run) * gait)
    hipsDrop += (1 - Math.abs(c)) * (0.025 + 0.025 * run) * gait * ground
  }

  // airborne: tuck while rising, reach for the ground while falling
  if (motion.air > 0) {
    const a = motion.air
    const rising = clamp01(motion.vy / 80)
    const falling = 1 - rising
    add(angles, "ThighL", 0, 0, a * (0.95 * rising + 0.4 * falling))
    add(angles, "KneeL", 0, 0, -a * (1.35 * rising + 0.55 * falling))
    add(angles, "ThighR", 0, 0, a * (0.25 * rising + 0.1 * falling))
    add(angles, "KneeR", 0, 0, -a * (0.55 * rising + 0.3 * falling))
    add(angles, "ShoulderL", a * (0.45 + 0.6 * falling), 0, a * 0.5 * rising)
    add(angles, "ShoulderR", -a * (0.45 + 0.6 * falling), 0, -a * 0.2)
    add(angles, "ElbowL", 0, 0, a * 0.5)
    add(angles, "ElbowR", 0, 0, a * 0.5)
    add(angles, "Spine", 0, 0, -a * 0.12 * rising)
  }

  // landing squash
  if (motion.landing > 0) {
    const l = motion.landing
    add(angles, "ThighL", 0, 0, l * 0.75)
    add(angles, "ThighR", 0, 0, l * 0.75)
    add(angles, "KneeL", 0, 0, -l * 1.35)
    add(angles, "KneeR", 0, 0, -l * 1.35)
    add(angles, "Spine", 0, 0, -l * 0.3)
    add(angles, "ShoulderL", l * 0.3, 0, l * 0.2)
    add(angles, "ShoulderR", -l * 0.3, 0, l * 0.2)
    hipsDrop += l * 0.1
  }

  // keep the coffee off the jacket
  if (motion.wading) {
    add(angles, "ShoulderL", 0.55, 0, 0.35)
    add(angles, "ShoulderR", -0.55, 0, 0.35)
    add(angles, "ElbowL", 0, 0, 0.6)
    add(angles, "ElbowR", 0, 0, 0.6)
  }

  const u = motion.actionTime / (ACTION_DURATION[motion.action] || 1)
  if (motion.action === "kick") {
    // wind up, strike, recover
    const windup = smooth(clamp01(u / 0.32))
    const strike = smooth(clamp01((u - 0.32) / 0.18))
    const recover = smooth(clamp01((u - 0.62) / 0.38))
    const swing = (-0.65 * windup + 1.95 * strike) * (1 - recover)
    const knee = (-1.25 * windup + 1.15 * strike) * (1 - recover)
    add(angles, "ThighR", 0, 0, swing)
    add(angles, "KneeR", 0, 0, knee)
    add(angles, "AnkleR", 0, 0, -0.3 * strike * (1 - recover))
    add(angles, "ShoulderL", 0.25, 0, 0.7 * strike * (1 - recover))
    add(angles, "ShoulderR", -0.35, 0, -0.5 * strike * (1 - recover))
    add(angles, "Spine", 0, 0, 0.18 * strike * (1 - recover))
    add(angles, "ThighL", 0, 0, -0.12 * strike * (1 - recover))
  } else if (motion.action === "wave") {
    const raise =
      smooth(clamp01(u / 0.18)) * (1 - smooth(clamp01((u - 0.82) / 0.18)))
    add(angles, "ShoulderL", 2.45 * raise, 0, 0.25 * raise)
    add(
      angles,
      "ElbowL",
      (-0.35 + Math.sin(motion.actionTime * 13) * 0.42) * raise,
      0,
      0.2 * raise
    )
    add(angles, "Neck", 0.12 * raise, 0.15 * raise, 0.05 * raise)
    add(angles, "Spine", -0.06 * raise, 0, 0)
  } else if (motion.action === "talk") {
    // one hand explains, the head nods along
    const t = motion.actionTime
    add(angles, "ShoulderR", -0.3, 0, 0.5 + Math.sin(t * 2.6) * 0.18)
    add(angles, "ElbowR", 0, 0, 1.15 + Math.sin(t * 4.1) * 0.25)
    add(angles, "ShoulderL", 0.05, 0, 0.12 + Math.sin(t * 1.7) * 0.06)
    add(angles, "Neck", 0, Math.sin(t * 0.9) * 0.12, Math.sin(t * 3.3) * 0.05)
  } else if (motion.action === "push") {
    add(angles, "ShoulderL", -0.05, 0, 1.15)
    add(angles, "ShoulderR", 0.05, 0, 1.15)
    add(angles, "ElbowL", 0, 0, 0.35)
    add(angles, "ElbowR", 0, 0, 0.35)
    add(angles, "Spine", 0, 0, -0.16)
  } else if (motion.action === "sweep") {
    const swing = Math.sin(motion.actionTime * 3.2)
    add(angles, "ShoulderL", 0.15, swing * 0.2, 0.75 + swing * 0.25)
    add(angles, "ShoulderR", -0.15, swing * 0.2, 0.55 + swing * 0.25)
    add(angles, "ElbowL", 0, 0, 0.6)
    add(angles, "ElbowR", 0, 0, 0.9)
    add(angles, "Spine", 0, swing * 0.15, -0.28)
  } else if (motion.action === "mantle") {
    // reach up, then push down and tuck the legs over the edge
    const reach = 1 - smooth(clamp01(u / 0.7))
    const tuck = Math.sin(Math.PI * clamp01(u))
    add(angles, "ShoulderL", 0.2, 0, 2.6 * reach + 0.3)
    add(angles, "ShoulderR", -0.2, 0, 2.6 * reach + 0.3)
    add(angles, "ElbowL", 0, 0, 0.9 * (1 - reach))
    add(angles, "ElbowR", 0, 0, 0.9 * (1 - reach))
    add(angles, "ThighL", 0, 0, 1.25 * tuck)
    add(angles, "ThighR", 0, 0, 0.8 * tuck)
    add(angles, "KneeL", 0, 0, -1.7 * tuck)
    add(angles, "KneeR", 0, 0, -1.3 * tuck)
    add(angles, "Spine", 0, 0, -0.35 * tuck)
  }

  // feet stay roughly flat whatever the legs do
  for (const side of ["L", "R"] as const) {
    const thigh = angles[`Thigh${side}`][2]
    const knee = angles[`Knee${side}`][2]
    angles[`Ankle${side}`][2] += -(thigh + knee) * 0.65
  }

  for (const joint of JOINTS) {
    const [x, y, z] = angles[joint]
    out[joint].setFromEuler(euler.set(x, y, z))
  }
  return hipsDrop
}

export interface RideMotion {
  steer: number
  lean: number
  speed: number
  // 0 … 1: one foot down on the ground when the scooter stands still
  footDown: number
  bump: number
  time: number
}

const footDownPose = createPose()
const extra = new Quaternion()

// Mounted rider: the solved riding pose, leaning into turns and putting a
// foot down at a standstill.
export function ridingPose(motion: RideMotion, out: Pose) {
  for (const joint of JOINTS) out[joint].copy(RIDE_POSE[joint])
  const f = motion.footDown
  if (f > 0) {
    footDownPose.ThighL.setFromEuler(euler.set(0.32, 0, 0.42))
    footDownPose.KneeL.setFromEuler(euler.set(0, 0, -0.38))
    footDownPose.AnkleL.setFromEuler(euler.set(0, 0, -0.05))
    out.ThighL.slerp(footDownPose.ThighL, f)
    out.KneeL.slerp(footDownPose.KneeL, f)
    out.AnkleL.slerp(footDownPose.AnkleL, f)
  }
  extra.setFromEuler(
    euler.set(
      -motion.lean * 0.5,
      motion.steer * 0.12,
      -Math.min(0.12, Math.abs(motion.speed) / 400) +
        Math.sin(motion.time * 2) * 0.012 -
        motion.bump * 0.25
    )
  )
  out.Spine.multiply(extra)
  extra.setFromEuler(euler.set(0, motion.steer * 0.3, motion.bump * 0.2))
  out.Neck.multiply(extra)
}

export function blendPose(out: Pose, from: Pose, to: Pose, t: number) {
  for (const joint of JOINTS)
    out[joint].slerpQuaternions(from[joint], to[joint], t)
}

export function applyPose(rig: RiderRig, pose: Pose, hipsDrop: number) {
  for (const joint of JOINTS) rig.joints[joint].quaternion.copy(pose[joint])
  rig.hips.position.y = HIPS_HEIGHT - hipsDrop
}
