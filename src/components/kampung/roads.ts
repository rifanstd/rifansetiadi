// The kampung's street network. Roads are axis-aligned strips; pavements run
// along both sides, are cut where another carriageway crosses, and every
// edge is a gentle chamfer so wheels and feet roll up instead of hitting a
// wall. Metres; x east, z south.

export interface Road {
  id: string
  a: [number, number]
  b: [number, number]
  width: number
  // drawn centre line
  marked?: boolean
  // a gang: a narrow paved alley between houses, no pavements, no traffic
  gang?: boolean
}

export interface Rect {
  x0: number
  x1: number
  z0: number
  z1: number
}

export const SIDEWALK = { width: 1.6, height: 0.15, chamfer: 0.35 }

export const ROADS: Road[] = [
  { id: "utama", a: [-104, 0], b: [108, 0], width: 7, marked: true },
  { id: "pantai", a: [-104, 62], b: [60, 62], width: 6, marked: true },
  { id: "dermaga", a: [-40, 3.5], b: [-40, 59], width: 6 },
  { id: "pasar", a: [20, 3.5], b: [20, 59], width: 6 },
  { id: "masjid", a: [-75, -3.5], b: [-75, -62], width: 6 },
  { id: "belakang", a: [-78, -62], b: [58, -62], width: 6, marked: true },
  { id: "kebun", a: [55, -3.5], b: [55, -86], width: 6 },
  // alleys through the middle of each block
  {
    id: "gang-utara",
    a: [-72, -31.25],
    b: [52, -31.25],
    width: 2.6,
    gang: true,
  },
  {
    id: "gang-selatan",
    a: [-101, 31.25],
    b: [56, 31.25],
    width: 2.6,
    gang: true,
  },
]

export const STREETS = ROADS.filter((r) => !r.gang)
export const GANGS = ROADS.filter((r) => r.gang)

export function carriageway(road: Road): Rect {
  const h = road.width / 2
  const [ax, az] = road.a
  const [bx, bz] = road.b
  return {
    x0: Math.min(ax, bx) - (az === bz ? 0 : h),
    x1: Math.max(ax, bx) + (az === bz ? 0 : h),
    z0: Math.min(az, bz) - (az === bz ? h : 0),
    z1: Math.max(az, bz) + (az === bz ? h : 0),
  }
}

// gangs cut the pavements they cross but have none of their own
export const CARRIAGEWAYS = STREETS.map(carriageway)
export const GANGWAYS = GANGS.map(carriageway)

function overlaps(a: Rect, b: Rect) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0
}

// a strip minus a rectangle that crosses it, split along the strip's length
function subtract(strip: Rect, cut: Rect): Rect[] {
  if (!overlaps(strip, cut)) return [strip]
  const alongX = strip.x1 - strip.x0 > strip.z1 - strip.z0
  const out: Rect[] = []
  if (alongX) {
    if (cut.x0 > strip.x0) out.push({ ...strip, x1: cut.x0 })
    if (cut.x1 < strip.x1) out.push({ ...strip, x0: cut.x1 })
  } else {
    if (cut.z0 > strip.z0) out.push({ ...strip, z1: cut.z0 })
    if (cut.z1 < strip.z1) out.push({ ...strip, z0: cut.z1 })
  }
  return out
}

function sidewalksOf(road: Road): Rect[] {
  const c = carriageway(road)
  const w = SIDEWALK.width
  const alongX = road.a[1] === road.b[1]
  const strips: Rect[] = alongX
    ? [
        { x0: c.x0, x1: c.x1, z0: c.z0 - w, z1: c.z0 },
        { x0: c.x0, x1: c.x1, z0: c.z1, z1: c.z1 + w },
      ]
    : [
        { x0: c.x0 - w, x1: c.x0, z0: c.z0, z1: c.z1 },
        { x0: c.x1, x1: c.x1 + w, z0: c.z0, z1: c.z1 },
      ]
  let pieces = strips
  for (const other of [...CARRIAGEWAYS, ...GANGWAYS])
    pieces = pieces.flatMap((p) => subtract(p, other))
  return pieces.filter((p) => p.x1 - p.x0 > 0.8 && p.z1 - p.z0 > 0.8)
}

// later roads give way to the pavements of earlier ones, so corners are
// covered once and never overlap
export const SIDEWALKS: Rect[] = STREETS.reduce<Rect[]>((done, road) => {
  let pieces = sidewalksOf(road)
  for (const earlier of done)
    pieces = pieces.flatMap((p) => subtract(p, earlier))
  return [
    ...done,
    ...pieces.filter((p) => p.x1 - p.x0 > 0.8 && p.z1 - p.z0 > 0.8),
  ]
}, [])

// The eight corners of a pavement slab whose top is inset by the chamfer:
// used both for the mesh and for the convex collider, so they match.
export function slabPoints(r: Rect): [number, number, number][] {
  const c = SIDEWALK.chamfer
  const h = SIDEWALK.height
  return [
    [r.x0, 0, r.z0],
    [r.x1, 0, r.z0],
    [r.x1, 0, r.z1],
    [r.x0, 0, r.z1],
    [r.x0 + c, h, r.z0 + c],
    [r.x1 - c, h, r.z0 + c],
    [r.x1 - c, h, r.z1 - c],
    [r.x0 + c, h, r.z1 - c],
  ]
}

// is a point on a carriageway or a pavement (used to keep buildings off them)
export function onStreet(x: number, z: number, margin = 0) {
  return [...CARRIAGEWAYS, ...GANGWAYS, ...SIDEWALKS].some(
    (r) =>
      x > r.x0 - margin &&
      x < r.x1 + margin &&
      z > r.z0 - margin &&
      z < r.z1 + margin
  )
}

// the height of the street surface at a point: pavement tops and their
// chamfered edges, zero elsewhere
export function pavementHeight(x: number, z: number) {
  const { chamfer, height } = SIDEWALK
  for (const r of SIDEWALKS) {
    if (x <= r.x0 || x >= r.x1 || z <= r.z0 || z >= r.z1) continue
    const edge = Math.min(x - r.x0, r.x1 - x, z - r.z0, r.z1 - z)
    return height * Math.min(1, edge / chamfer)
  }
  return 0
}

export function onCarriageway(x: number, z: number, margin = 0) {
  return CARRIAGEWAYS.some(
    (r) =>
      x > r.x0 - margin &&
      x < r.x1 + margin &&
      z > r.z0 - margin &&
      z < r.z1 + margin
  )
}
