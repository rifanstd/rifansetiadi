import { Vector3 } from "three"
import type { CourierCamera } from "@/components/courier/CourierRig"
import type { CourierTuning } from "@/components/courier/physics"
import { MOTOR_START } from "./layout"
import { sandiness, terrainHeight, WATER_Y } from "./terrain"

// The kampung is built in metres at real size, around a 1.67 m person: a
// low jump, a quick scooter, soft gravity.
const U = 1 / 5.8

export const KAMPUNG_TUNING: CourierTuning = {
  modelScale: 1,
  unit: U,
  gravity: 32,
  maxFall: 40,
  start: MOTOR_START,
  resetBelow: -20,
  cameraForward: new Vector3(-0.62, 0, -1).normalize(),

  wheelRadius: 0.276,
  wheelOffset: 0.63,
  scooterHalfLength: 0.62,
  scooterSkin: 0.014,
  maxSpeed: 13,
  maxReverse: 3,
  acceleration: 7,
  braking: 13,
  coasting: 3,
  turnRate: 2.1,
  steerSpeedRef: 3,
  grip: 9,
  driftGrip: 2.2,
  slopePull: 12,
  tipDrop: 0.35,
  dismountSpeed: 1.8,
  bounceSpeed: 4,
  bumpSpeed: 8,
  leanSpeedRef: 6,
  dismountSpots: [
    [-0.1, -0.72],
    [-0.1, 0.72],
    [-1.5, 0],
    [1.5, 0],
  ],

  riderRadius: 0.24,
  riderHalfHeight: 0.59,
  riderSkin: 0.01,
  walkSpeed: 2.4,
  runSpeed: 5.6,
  jumpHeight: 0.95,
  fallMultiplier: 1.5,
  shortHopMultiplier: 2.0,
  coyoteTime: 0.12,
  jumpBuffer: 0.14,
  mantleReach: 1.2,
  mountRange: 1.4,
  kickSpeed: 6,
  kickLift: 3.5,
  strideWalk: 1.25,
  strideRun: 0.5,

  controllers: {
    scooter: {
      offset: 0.014,
      autostep: [0.24, 0.2],
      snap: 0.15,
      climb: 35,
      slide: 30,
      mass: 120,
    },
    rider: {
      offset: 0.01,
      autostep: [0.36, 0.12],
      snap: 0.12,
      climb: 45,
      slide: 40,
      mass: 60,
    },
  },
  // sand is loose under the wheels; the shallows slow you down
  gripAt: (x, z) => (sandiness(x, z) > 0.6 ? 4.5 : null),
  wadingAt: (x, z, feetY) =>
    feetY < WATER_Y - 0.04 && terrainHeight(x, z) < WATER_Y,
}

export const KAMPUNG_CAMERA: CourierCamera = {
  direction: new Vector3(0.62, 0.95, 1).normalize(),
  ride: 17,
  walk: 12.5,
  walkLift: 0.8,
  orbit: { minPitch: 0.22, maxPitch: 1.35, minZoom: 0.35, maxZoom: 2.4 },
}
