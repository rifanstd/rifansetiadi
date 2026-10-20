import { HALTE, LANES } from "./layout"

// Traffic drives closed routes over the street network, keeping left as in
// Indonesia. A route is a loop of road corners; it is offset into the left
// lane, its corners are rounded, and it is resampled so one number, s, places
// a vehicle on it.

export interface LoopPoint {
  x: number
  z: number
  heading: number
}

export interface Route {
  id: string
  xs: Float32Array
  zs: Float32Array
  headings: Float32Array
  // the speed limit for the bend coming up
  limits: Float32Array
  length: number
}

const STEP = 0.25
const CORNER = 5.5

function buildRoute(id: string, corners: [number, number][]): Route {
  const n = corners.length
  // offset every corner into the left lane of both its legs
  const lane = corners.map((p, i) => {
    const prev = corners[(i - 1 + n) % n]
    const next = corners[(i + 1) % n]
    const inDir = norm(p[0] - prev[0], p[1] - prev[1])
    const outDir = norm(next[0] - p[0], next[1] - p[1])
    // left of travel is (dz, -dx) with z pointing south
    const nIn = [inDir[1], -inDir[0]]
    const nOut = [outDir[1], -outDir[0]]
    const o = LANES.offset
    // the intersection of the two offset lines (legs are axis-aligned)
    const x = Math.abs(inDir[0]) > 0.5 ? p[0] + nOut[0] * o : p[0] + nIn[0] * o
    const z = Math.abs(inDir[0]) > 0.5 ? p[1] + nIn[1] * o : p[1] + nOut[1] * o
    return [x, z] as [number, number]
  })
  // a dense polyline with rounded corners
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const p = lane[i]
    const prev = lane[(i - 1 + n) % n]
    const next = lane[(i + 1) % n]
    const inDir = norm(p[0] - prev[0], p[1] - prev[1])
    const outDir = norm(next[0] - p[0], next[1] - p[1])
    const a: [number, number] = [
      p[0] - inDir[0] * CORNER,
      p[1] - inDir[1] * CORNER,
    ]
    const b: [number, number] = [
      p[0] + outDir[0] * CORNER,
      p[1] + outDir[1] * CORNER,
    ]
    for (let k = 0; k <= 12; k++) {
      const t = k / 12
      const u = 1 - t
      points.push([
        u * u * a[0] + 2 * u * t * p[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * p[1] + t * t * b[1],
      ])
    }
  }
  points.push(points[0])
  // resample at equal steps
  const cumulative = [0]
  for (let i = 1; i < points.length; i++)
    cumulative.push(
      cumulative[i - 1] +
        Math.hypot(
          points[i][0] - points[i - 1][0],
          points[i][1] - points[i - 1][1]
        )
    )
  const length = cumulative[cumulative.length - 1]
  const count = Math.floor(length / STEP)
  const xs = new Float32Array(count)
  const zs = new Float32Array(count)
  let j = 0
  for (let k = 0; k < count; k++) {
    const s = k * STEP
    while (cumulative[j + 1] < s) j++
    const t = (s - cumulative[j]) / (cumulative[j + 1] - cumulative[j] || 1)
    xs[k] = points[j][0] + (points[j + 1][0] - points[j][0]) * t
    zs[k] = points[j][1] + (points[j + 1][1] - points[j][1]) * t
  }
  const headings = new Float32Array(count)
  for (let k = 0; k < count; k++) {
    const q = (k + 1) % count
    headings[k] = Math.atan2(-(zs[q] - zs[k]), xs[q] - xs[k])
  }
  // slow down ahead of a bend: the turn over the next 10 m sets the limit
  const limits = new Float32Array(count)
  const look = Math.round(10 / STEP)
  for (let k = 0; k < count; k++) {
    const turn = Math.abs(wrap(headings[(k + look) % count] - headings[k]))
    limits[k] = turn > 0.25 ? 4.2 : 99
  }
  return { id, xs, zs, headings, limits, length: count * STEP }
}

function norm(x: number, z: number): [number, number] {
  const l = Math.hypot(x, z) || 1
  return [x / l, z / l]
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

export function pointAt(route: Route, s: number, out: LoopPoint): LoopPoint {
  const count = route.xs.length
  const f = (((s % route.length) + route.length) % route.length) / STEP
  const i = Math.floor(f) % count
  const j = (i + 1) % count
  const t = f - Math.floor(f)
  out.x = route.xs[i] + (route.xs[j] - route.xs[i]) * t
  out.z = route.zs[i] + (route.zs[j] - route.zs[i]) * t
  out.heading =
    route.headings[i] + wrap(route.headings[j] - route.headings[i]) * t
  return out
}

function closest(route: Route, x: number, z: number) {
  let best = 0
  let distance = Infinity
  for (let k = 0; k < route.xs.length; k++) {
    const d = Math.hypot(route.xs[k] - x, route.zs[k] - z)
    if (d < distance) {
      distance = d
      best = k
    }
  }
  return best * STEP
}

// Corners are road centre-line junctions; each route is a closed cycle.
export const ROUTES: Route[] = [
  // the angkot: west along the main road past the halte, down to the beach
  buildRoute("angkot", [
    [20, 0],
    [-40, 0],
    [-40, 62],
    [20, 62],
  ]),
  // round the back of the kampung
  buildRoute("belakang", [
    [-75, 0],
    [55, 0],
    [55, -62],
    [-75, -62],
  ]),
  // the same loop the other way
  buildRoute("belakang-balik", [
    [-75, 0],
    [-75, -62],
    [55, -62],
    [55, 0],
  ]),
  // a long figure through the whole kampung
  buildRoute("keliling", [
    [20, 0],
    [55, 0],
    [55, -62],
    [-75, -62],
    [-75, 0],
    [-40, 0],
    [-40, 62],
    [20, 62],
  ]),
]

const HALTE_S = closest(ROUTES[0], HALTE[0], HALTE[1])

export type VehicleKind = "angkot" | "mobil" | "motor"

export interface VehicleSpec {
  kind: VehicleKind
  route: number
  start: number
  maxSpeed: number
  half: [number, number, number]
  length: number
  // body colour for cars and the rider's jacket for motorbikes
  paint?: string
}

const ANGKOT = {
  kind: "angkot" as const,
  half: [2.05, 1.0, 0.82] as [number, number, number],
  length: 4.1,
}
const MOBIL = {
  kind: "mobil" as const,
  half: [2.15, 0.82, 0.88] as [number, number, number],
  length: 4.3,
}
const MOTOR = {
  kind: "motor" as const,
  half: [0.95, 0.6, 0.35] as [number, number, number],
  length: 1.9,
}

export const VEHICLES: VehicleSpec[] = [
  { ...ANGKOT, route: 0, start: 40, maxSpeed: 6.5 },
  { ...MOTOR, route: 0, start: 120, maxSpeed: 9, paint: "#C8452F" },
  { ...MOBIL, route: 1, start: 30, maxSpeed: 8.5 },
  { ...MOTOR, route: 1, start: 190, maxSpeed: 9.5, paint: "#2E6FA3" },
  { ...MOBIL, route: 2, start: 120, maxSpeed: 8, paint: "#F1ECE2" },
  { ...MOTOR, route: 2, start: 260, maxSpeed: 8.5, paint: "#F2D27A" },
  { ...MOBIL, route: 3, start: 10, maxSpeed: 8.5, paint: "#2F8A6E" },
  { ...MOTOR, route: 3, start: 210, maxSpeed: 9, paint: "#7C6FD0" },
  { ...MOTOR, route: 3, start: 330, maxSpeed: 8.8, paint: "#E8973A" },
]

export interface Vehicle {
  index: number
  spec: VehicleSpec
  route: Route
  s: number
  speed: number
  wait: number
  served: boolean
  spin: number
  at: LoopPoint
}

export interface Traffic {
  vehicles: Vehicle[]
  // index of the vehicle the player sits in, if any
  passenger: number | null
  // the player said "Kiri!": stop and let them off
  alight: boolean
  // set by the angkot when it stands at the halte
  atHalte: boolean
}

export function createTraffic(): Traffic {
  return {
    vehicles: VEHICLES.map((spec, index) => {
      const route = ROUTES[spec.route]
      return {
        index,
        spec,
        route,
        s: spec.start,
        speed: spec.maxSpeed * 0.5,
        wait: 0,
        served: false,
        spin: 0,
        at: pointAt(route, spec.start, { x: 0, z: 0, heading: 0 }),
      }
    }),
    passenger: null,
    alight: false,
    atHalte: false,
  }
}

export interface TrafficEvents {
  // the angkot reached the halte (the kenek calls out)
  onHalte?: (vehicle: Vehicle) => void
  // the angkot stopped for a passenger who wants off
  onStopped?: (vehicle: Vehicle) => void
}

// how fast a vehicle may go with something at `ahead` metres in front
const approach = (ahead: number, keep: number) =>
  Math.max(0, (ahead - keep) * 1.3)

export function stepTraffic(
  traffic: Traffic,
  dt: number,
  player: { x: number; z: number },
  events: TrafficEvents
) {
  traffic.atHalte = false
  for (const v of traffic.vehicles) {
    const { at, spec } = v
    const fx = Math.cos(at.heading)
    const fz = -Math.sin(at.heading)
    const front = spec.length / 2
    let target = Math.min(
      spec.maxSpeed,
      v.route.limits[Math.floor(v.s / STEP) % v.route.limits.length]
    )
    // the player in the lane ahead
    if (traffic.passenger !== v.index) {
      const rx = player.x - at.x
      const rz = player.z - at.z
      const ahead = rx * fx + rz * fz
      const side = Math.abs(rx * -fz + rz * fx)
      if (ahead > 0 && ahead < front + 9 && side < 1.6)
        target = Math.min(target, approach(ahead, front + 1.2))
    }
    // anything else in front: follow it, and give way at junctions to
    // vehicles that came first in the list so two never wait for each other
    for (const o of traffic.vehicles) {
      if (o === v) continue
      const rx = o.at.x - at.x
      const rz = o.at.z - at.z
      const ahead = rx * fx + rz * fz
      if (ahead <= 0 || ahead > 14) continue
      const side = Math.abs(rx * -fz + rz * fx)
      const keep = front + o.spec.length / 2 + 1.6
      const same = Math.cos(o.at.heading - at.heading) > 0.5
      if (same && side < 1.4) target = Math.min(target, approach(ahead, keep))
      else if (!same && side < 2.4 && o.index < v.index && ahead < keep + 3)
        target = Math.min(target, approach(ahead, keep))
    }
    if (spec.kind === "angkot") {
      const toHalte = (HALTE_S - v.s + v.route.length) % v.route.length
      if (toHalte > 25) v.served = false
      if (!v.served && toHalte < 14) {
        target = Math.min(target, Math.max(1.2, toHalte * 0.8))
        // close enough: pull in and wait for passengers
        if (toHalte < 1) {
          v.served = true
          v.speed = 0
          v.wait = 6
          events.onHalte?.(v)
        }
      }
      if (v.wait > 0) {
        v.wait -= dt
        target = 0
        traffic.atHalte = true
      }
      if (traffic.passenger === v.index && traffic.alight) {
        target = 0
        if (v.speed < 0.25) events.onStopped?.(v)
      }
    }
    const rate = target < v.speed ? 7 : 2.4
    v.speed +=
      Math.sign(target - v.speed) *
      Math.min(Math.abs(target - v.speed), rate * dt)
    v.s = (v.s + v.speed * dt) % v.route.length
    v.spin += v.speed * dt
    pointAt(v.route, v.s, v.at)
  }
}
