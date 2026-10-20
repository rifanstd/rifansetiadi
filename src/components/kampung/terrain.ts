// The land around the kampung: a flat town, beaches that slope into the sea
// to the south and west, rice fields to the east and wooded hills behind.
// One height function feeds the terrain mesh, the water shader and the
// colliders, so they always agree. Metres; x east, z south.

export const WATER_Y = -0.12

// where the sand starts to slope into the water
export const SHORE = { south: 71, west: -110 }
export const BEACH_SLOPE = 0.07

// the walkable area; the hills and the sea lie beyond it
export const WALK = { x0: -116, x1: 124, z0: -96, z1: 77 }

export const SAWAH = { x0: 64, x1: 118, z0: -86, z1: 58 }

// the wooden jetty at the south end of Jalan Dermaga
export const PIER = { x: -40, z0: 70.5, z1: 102, half: 1.6, deck: 0.55 }

function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function noise(x: number, z: number) {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = x - ix
  const fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uz = fz * fz * (3 - 2 * fz)
  const a = hash(ix, iz)
  const b = hash(ix + 1, iz)
  const c = hash(ix, iz + 1)
  const d = hash(ix + 1, iz + 1)
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz
}

export function fbm(x: number, z: number) {
  return (
    noise(x, z) * 0.55 +
    noise(x * 2.1, z * 2.1) * 0.3 +
    noise(x * 4.3, z * 4.3) * 0.15
  )
}

// how far past the start of the beach slope a point is (negative on land)
export function seaward(x: number, z: number) {
  return Math.max(z - SHORE.south, SHORE.west - x)
}

export function beachHeight(c: number) {
  return c <= 0 ? 0 : -c * BEACH_SLOPE - c * c * 0.0016
}

// hills rise behind the walkable area, gently at first
function hillRise(x: number, z: number) {
  const north = WALK.z0 - z
  const east = x - WALK.x1
  const south = Math.min(1, Math.max(0, (SHORE.south - 9 - z) / 10))
  return Math.max(north, east * south)
}

export function terrainHeight(x: number, z: number) {
  const c = seaward(x, z)
  if (c > 0) return beachHeight(c)
  const rise = hillRise(x, z)
  if (rise <= 0) return 0
  const shape = 0.55 + 0.9 * fbm(x * 0.018, z * 0.018)
  const height = Math.min(rise * 0.42, 9 + rise * 0.22) * shape
  // fade out where the hills meet the beach in the south-east
  const fade = Math.min(1, Math.max(0, (SHORE.south - 6 - z) / 14))
  return height * fade
}

// 0 for grass, 1 for sand
export function sandiness(x: number, z: number) {
  const c = seaward(x, z)
  const wobble = (fbm(x * 0.15, z * 0.15) - 0.5) * 2.2
  return Math.min(1, Math.max(0, (c + 2.6 + wobble) / 1.4))
}
