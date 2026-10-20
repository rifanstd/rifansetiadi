// The kampung's single source of truth: where every building, prop, path,
// lane and portfolio place sits. Metres; x runs east along the main road,
// z runs south towards the sea. Kit assets face +z at yaw 0.
import {
  onCarriageway,
  onStreet,
  pavementHeight,
  ROADS,
  SIDEWALK,
  SIDEWALKS,
  type Rect,
} from "./roads"
import { PIER, SAWAH, SHORE, WALK } from "./terrain"

export { SIDEWALK }

export type KitFile = "bangunan" | "kendaraan" | "alam" | "props" | "aksesori"

export const KIT: Record<string, KitFile> = {
  rumah_pelana: "bangunan",
  rumah_limas: "bangunan",
  ruko: "bangunan",
  kantor: "bangunan",
  warung: "bangunan",
  angkot: "kendaraan",
  mobil: "kendaraan",
  gerobak: "kendaraan",
  pohon: "alam",
  palem: "alam",
  pisang: "alam",
  semak: "alam",
  tiang_listrik: "props",
  tiang_trafo: "props",
  bangku: "props",
  kursi: "props",
  meja: "props",
  tong: "props",
  jemuran: "props",
  rambut_pendek: "aksesori",
  rambut_panjang: "aksesori",
  peci: "aksesori",
  kerudung: "aksesori",
  topi: "aksesori",
}

export type SignKey = "office" | "projects" | "shop" | "repair" | "warung"

export interface Placement {
  asset: string
  x: number
  z: number
  yaw?: number
  scale?: number
  wall?: string
  roof?: string
  sign?: SignKey
  // interactive pieces look themselves up by id
  id?: string
}

export interface Box {
  center: [number, number, number]
  half: [number, number, number]
  yaw: number
}

export const LANES = { offset: 1.75 }

const WALLS = [
  "#E9DFC8",
  "#BFDCCB",
  "#F2D3AE",
  "#C9D8E6",
  "#F0E3A6",
  "#E7C9C3",
  "#D9E4BE",
  "#EDE3D2",
]
const ROOFS = ["#B5553A", "#8E3F2E", "#A9603F", "#9AA3A6"]

// a small seeded random so the kampung is the same on every visit
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- the places that matter, along the main road

export const SPECIAL: Placement[] = [
  { asset: "kantor", x: -20, z: -14, sign: "office", id: "kantor" },
  { asset: "ruko", x: -4, z: -11, sign: "projects", id: "ruko-proyek" },
  {
    asset: "ruko",
    x: 2.2,
    z: -11,
    sign: "shop",
    wall: "#F2D3AE",
    id: "ruko-toko",
  },
  {
    asset: "ruko",
    x: 8.4,
    z: -11,
    sign: "repair",
    wall: "#C9D8E6",
    id: "ruko-servis",
  },
  {
    asset: "warung",
    x: 30,
    z: -9.2,
    sign: "warung",
    wall: "#BFDCCB",
    id: "warung",
  },
]

export const FIELD = {
  x: -11,
  z: 16.5,
  halfX: 9.6,
  halfZ: 6.3,
  goalZ: [15.3, 17.7] as [number, number],
}

// areas the generated houses keep out of
const RESERVED: Rect[] = [
  { x0: -27.5, x1: -12.5, z0: -24, z1: -5 },
  { x0: -7.5, x1: 12, z0: -17, z1: -5 },
  { x0: 26.5, x1: 34, z0: -12.5, z1: -5 },
  { x0: FIELD.x - 12, x1: FIELD.x + 12, z0: FIELD.z - 8.5, z1: FIELD.z + 8.5 },
  { x0: -37, x1: -25, z0: 5, z1: 10 },
  // sawah to the east, the beach to the south and west, hills up north
  { x0: SAWAH.x0 - 2, x1: 200, z0: -200, z1: 200 },
  { x0: -200, x1: 200, z0: 65, z1: 200 },
  { x0: -200, x1: -98, z0: -200, z1: 200 },
  { x0: -200, x1: 200, z0: -200, z1: -70 },
]

interface Footprint {
  half: [number, number]
  // local z of the back and the front fence
  back: number
  front: number
}

const HOUSE: Footprint = { half: [3.6, 0], back: -3.7, front: 7.1 }

function worldRect(x: number, z: number, yaw: number, f: Footprint): Rect {
  const corners = [
    [-f.half[0], f.back],
    [f.half[0], f.back],
    [f.half[0], f.front],
    [-f.half[0], f.front],
  ].map(([lx, lz]) => [
    x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
    z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
  ])
  return {
    x0: Math.min(...corners.map((c) => c[0])),
    x1: Math.max(...corners.map((c) => c[0])),
    z0: Math.min(...corners.map((c) => c[1])),
    z1: Math.max(...corners.map((c) => c[1])),
  }
}

const hit = (a: Rect, b: Rect) =>
  a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0

function rectOnStreet(r: Rect) {
  for (let x = r.x0; x <= r.x1; x += 1.5)
    for (let z = r.z0; z <= r.z1; z += 1.5) if (onStreet(x, z)) return true
  return onStreet(r.x1, r.z1)
}

// houses along both sides of every road, set back behind a front yard
function frontages() {
  const random = seeded(7)
  const placed: Rect[] = [...RESERVED]
  const houses: Placement[] = []
  const yards: Placement[] = []
  for (const road of ROADS) {
    const alongX = road.a[1] === road.b[1]
    const from = alongX
      ? Math.min(road.a[0], road.b[0])
      : Math.min(road.a[1], road.b[1])
    const to = alongX
      ? Math.max(road.a[0], road.b[0])
      : Math.max(road.a[1], road.b[1])
    const axis = alongX ? road.a[1] : road.a[0]
    const setback = road.width / 2 + (road.gang ? 0.4 : SIDEWALK.width) + 7.4
    for (const side of [-1, 1]) {
      let t = from + 4 + random() * 4
      while (t < to - 4) {
        const x = alongX ? t : axis + side * setback
        const z = alongX ? axis + side * setback : t
        const yaw = alongX
          ? side < 0
            ? 0
            : Math.PI
          : side < 0
            ? Math.PI / 2
            : -Math.PI / 2
        const rect = worldRect(x, z, yaw, HOUSE)
        if (!placed.some((p) => hit(p, rect)) && !rectOnStreet(rect)) {
          if (random() < 0.12) {
            // an empty yard now and then: a tree, bananas or washing
            const kind = random()
            yards.push({
              asset: kind < 0.45 ? "pohon" : kind < 0.8 ? "pisang" : "jemuran",
              x,
              z,
              yaw: yaw + (random() - 0.5) * 0.6,
              scale: 0.8 + random() * 0.3,
            })
          } else {
            houses.push({
              asset: random() < 0.42 ? "rumah_limas" : "rumah_pelana",
              x,
              z,
              yaw,
              wall: WALLS[Math.floor(random() * WALLS.length)],
              roof: ROOFS[Math.floor(random() * ROOFS.length)],
            })
          }
          placed.push(rect)
        }
        t += 8.6 + random() * 1.6
      }
    }
  }
  return { houses, yards }
}

const generated = frontages()
export const HOUSES = generated.houses

// ---- street furniture and greenery

// rows of poles on the outer edge of the pavement, wherever there is one
function poleRow(z: number, from: number, to: number, step: number) {
  const row: { x: number; z: number }[] = []
  for (let x = from; x <= to; x += step)
    if (pavementHeight(x, z) > 0.1 && !onCarriageway(x, z, 0.6))
      row.push({ x, z })
  return row
}

export const POLE_ROWS = [
  poleRow(-4.85, -97, 104, 12),
  poleRow(57.65, -98, 58, 12.5),
  poleRow(-66.35, -72, 54, 12),
]
export const POLES = POLE_ROWS.flat()
// insulator tops in pole space, where the wires hang from
export const WIRE_POINTS: [number, number][] = [
  [8.64, -0.85],
  [8.64, 0],
  [8.64, 0.85],
]

export const PROPS: Placement[] = [
  ...POLES.map((p, i) => ({
    asset: i % 7 === 3 ? "tiang_trafo" : "tiang_listrik",
    x: p.x,
    z: p.z,
  })),
  ...generated.yards,
  { asset: "bangku", x: -31, z: 9.4, yaw: Math.PI },
  { asset: "tong", x: -9.5, z: -5.6 },
  { asset: "tong", x: 25.5, z: -5.6 },
  { asset: "kursi", x: 28.4, z: -5.8, yaw: 0.4 },
  { asset: "pohon", x: -29, z: -7.6, scale: 0.85 },
  { asset: "pohon", x: 36, z: -8, scale: 0.9 },
  { asset: "pohon", x: 4, z: 10 },
  { asset: "pohon", x: -24, z: 8.5, scale: 0.8 },
  // palms along the beach, and a plantation behind Jalan Belakang
  ...Array.from({ length: 18 }, (_, i) => ({
    asset: "palem",
    x: -102 + i * 9.4 + ((i * 7) % 3),
    z: SHORE.south - 2.4 + ((i * 5) % 3) * 0.7,
    yaw: 2.6 + ((i * 3) % 5) * 0.3,
  })).filter((p) => Math.abs(p.x - PIER.x) > 4),
  ...Array.from({ length: 9 }, (_, i) => ({
    asset: "palem",
    x: SHORE.west + 2.2 + (i % 2) * 0.8,
    z: -40 + i * 10.5,
    yaw: 1 + i,
  })),
  ...plantation(),
]

function plantation(): Placement[] {
  const random = seeded(23)
  const trees: Placement[] = []
  for (let x = -70; x < 50; x += 5.5)
    for (let z = -73; z > WALK.z0 + 3; z -= 5.5) {
      const px = x + (random() - 0.5) * 2.4
      const pz = z + (random() - 0.5) * 2.4
      if (onStreet(px, pz, 1.5)) continue
      const kind = random()
      trees.push({
        asset: kind < 0.5 ? "pisang" : kind < 0.8 ? "pohon" : "palem",
        x: px,
        z: pz,
        yaw: random() * Math.PI * 2,
        scale: 0.85 + random() * 0.4,
      })
    }
  return trees
}

// ---- collision footprints in asset space (front = +z)

const FOOTPRINTS: Record<string, (p: Placement) => Box[]> = {
  rumah_pelana: () => house(6.5),
  rumah_limas: () => house(6.0),
  kantor: () => [
    box(0, 5.85, 0, 6.5, 5.85, 5),
    box(-3, 1.6, 7.8, 0.15, 1.6, 0.15),
    box(3, 1.6, 7.8, 0.15, 1.6, 0.15),
    box(6, 4, 8.4, 0.08, 4, 0.08),
  ],
  ruko: (p) => [
    box(0, 0.1, 0, 3, 0.1, 5),
    box(-2.9, 1.9, 0, 0.1, 1.9, 5),
    box(2.9, 1.9, 0, 0.1, 1.9, 5),
    box(0, 1.9, -4.9, 3, 1.9, 0.1),
    box(0, 0.6, 3.0, 2.25, 0.5, 0.4),
    box(-2.83, 1.8, 4.83, 0.18, 1.8, 0.18),
    box(2.83, 1.8, 4.83, 0.18, 1.8, 0.18),
    box(0, 5.6, 0.6, 3, 1.8, 4.4),
    // only the projects shop opens its shutter
    ...(p.id === "ruko-proyek" ? [] : [box(0, 1.6, 4.95, 2.6, 1.5, 0.08)]),
  ],
  warung: () => [
    box(0, 1.6, 0, 2.5, 1.6, 2.0),
    box(0, 0.6, 2.2, 2.35, 0.6, 0.38),
    box(0.2, 0.25, 3.3, 1.3, 0.25, 0.25),
    box(-2.65, 1.4, 3.75, 0.06, 1.4, 0.06),
    box(2.65, 1.4, 3.75, 0.06, 1.4, 0.06),
  ],
  tiang_listrik: () => [box(0, 4.5, 0, 0.16, 4.5, 0.16)],
  tiang_trafo: () => [box(0, 4.5, 0, 0.16, 4.5, 0.16)],
  pohon: (p) => [
    box(0, 1.5, 0, 0.26 * (p.scale ?? 1), 1.5, 0.26 * (p.scale ?? 1)),
  ],
  palem: () => [box(0, 1.2, 0, 0.22, 1.2, 0.22)],
  pisang: () => [box(0, 1.0, 0, 0.2, 1.0, 0.2)],
  bangku: () => [box(0, 0.4, 0, 0.9, 0.4, 0.25)],
  tong: () => [box(0, 0.4, 0, 0.3, 0.4, 0.3)],
  kursi: () => [box(0, 0.25, 0, 0.22, 0.25, 0.22)],
}

function box(
  x: number,
  y: number,
  z: number,
  hx: number,
  hy: number,
  hz: number
): Box {
  return { center: [x, y, z], half: [hx, hy, hz], yaw: 0 }
}

function house(w: number): Box[] {
  const gate = -w * 0.2
  const tw = w * 0.78
  return [
    box(0, 1.73, 0, w / 2 + 0.05, 1.73, 3.55),
    box(0, 0.225, 4.5, tw / 2, 0.225, 1.0),
    // the front fence, open at the gate in front of the door
    box(
      (-w / 2 + gate - 0.65) / 2,
      0.62,
      6.8,
      (gate - 0.65 + w / 2) / 2,
      0.62,
      0.16
    ),
    box(
      (gate + 0.65 + w / 2) / 2,
      0.62,
      6.8,
      (w / 2 - gate - 0.65) / 2,
      0.62,
      0.16
    ),
  ]
}

function placeBoxes(p: Placement): Box[] {
  const make = FOOTPRINTS[p.asset]
  if (!make) return []
  const yaw = p.yaw ?? 0
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  return make(p).map((b) => {
    const [x, y, z] = b.center
    return {
      center: [p.x + x * c + z * s, y, p.z - x * s + z * c],
      half: b.half,
      yaw,
    }
  })
}

export const COLLIDERS: Box[] = [
  ...SPECIAL.flatMap(placeBoxes),
  ...HOUSES.flatMap(placeBoxes),
  ...PROPS.flatMap(placeBoxes),
]

// ---- people, vehicles and places

export const PLAYER_START: [number, number, number] = [
  -33,
  SIDEWALK.height,
  4.3,
]
// the ojek you can borrow waits at the base, facing the road
export const MOTOR_START = {
  position: [-31, 0.5, 7.2] as const,
  heading: Math.PI / 2,
}
export const PARKED_MOTORS: { x: number; z: number; heading: number }[] = [
  { x: -33.2, z: 7.2, heading: Math.PI / 2 },
  { x: -28.8, z: 7.3, heading: Math.PI / 2 + 0.15 },
]
// the angkot stops on the westbound side by the ojek base
export const HALTE: [number, number] = [-30, LANES.offset]

// pavement centre lines long enough to stroll along
export const WALKWAYS: [number, number][][] = SIDEWALKS.filter(
  (r) => Math.max(r.x1 - r.x0, r.z1 - r.z0) > 24
).map((r) =>
  r.x1 - r.x0 > r.z1 - r.z0
    ? [
        [r.x0 + 1, (r.z0 + r.z1) / 2],
        [r.x1 - 1, (r.z0 + r.z1) / 2],
      ]
    : [
        [(r.x0 + r.x1) / 2, r.z0 + 1],
        [(r.x0 + r.x1) / 2, r.z1 - 1],
      ]
)

export type PlaceId = "experience" | "projects" | "contact"

export interface Place {
  id: PlaceId
  // who you talk to there
  npc: string
  // where the player stands to start talking
  spot: [number, number]
  radius: number
  shot: { position: [number, number, number]; target: [number, number, number] }
}

export const PLACES: Place[] = [
  {
    id: "experience",
    npc: "rekan",
    spot: [-20.6, -5.0],
    radius: 2.6,
    shot: { position: [-16.6, 2.4, -1.2], target: [-20.6, 1.35, -6.4] },
  },
  {
    id: "projects",
    npc: "pemilik-toko",
    spot: [-4, -5.0],
    radius: 2.6,
    shot: { position: [-0.3, 2.6, -0.8], target: [-4.1, 1.4, -7.6] },
  },
  {
    id: "contact",
    npc: "ibu-warung",
    spot: [30, -5.2],
    radius: 2.6,
    shot: { position: [33.6, 2.4, -1.2], target: [29.8, 1.4, -7.0] },
  },
]
