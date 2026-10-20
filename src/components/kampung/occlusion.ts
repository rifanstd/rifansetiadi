import type { Vector3 } from "three"
import { HOUSES, SPECIAL, type Placement } from "./layout"

// Buildings as solid blocks up to their roof ridge, for the camera only: the
// follow camera climbs over a roof rather than looking through it.

interface Block {
  x: number
  z: number
  cos: number
  sin: number
  hx: number
  hz: number
  top: number
}

const SIZE: Record<string, [number, number, number]> = {
  rumah_pelana: [3.8, 4.0, 6.2],
  rumah_limas: [3.5, 4.0, 6.0],
  kantor: [6.6, 5.2, 11.8],
  ruko: [3.1, 5.1, 7.6],
  warung: [2.7, 2.3, 4.0],
}

function block(p: Placement): Block | null {
  const size = SIZE[p.asset]
  if (!size) return null
  const yaw = p.yaw ?? 0
  return {
    x: p.x,
    z: p.z,
    cos: Math.cos(yaw),
    sin: Math.sin(yaw),
    hx: size[0],
    hz: size[1],
    top: size[2],
  }
}

const BLOCKS = [...SPECIAL, ...HOUSES]
  .map(block)
  .filter((b): b is Block => b !== null)

// does the segment from origin along direction for distance enter a block?
export function cameraBlocked(
  origin: Vector3,
  direction: Vector3,
  distance: number
) {
  for (const b of BLOCKS) {
    // quick reject on a bounding circle in plan
    const r = Math.hypot(b.hx, b.hz)
    const mx = origin.x + (direction.x * distance) / 2 - b.x
    const mz = origin.z + (direction.z * distance) / 2 - b.z
    if (Math.hypot(mx, mz) > r + distance / 2) continue
    // into the block's frame: x' = x cos - z sin, z' = x sin + z cos
    const ox = origin.x - b.x
    const oz = origin.z - b.z
    const lx = ox * b.cos - oz * b.sin
    const lz = ox * b.sin + oz * b.cos
    const dx = direction.x * b.cos - direction.z * b.sin
    const dz = direction.x * b.sin + direction.z * b.cos
    // standing inside (an open shop): that roof is not in the way
    if (Math.abs(lx) < b.hx && Math.abs(lz) < b.hz) continue
    let near = 0
    let far = distance
    const slabs: [number, number, number, number][] = [
      [lx, dx, -b.hx, b.hx],
      [origin.y, direction.y, 0, b.top],
      [lz, dz, -b.hz, b.hz],
    ]
    let hit = true
    for (const [o, d, lo, hi] of slabs) {
      if (Math.abs(d) < 1e-6) {
        if (o < lo || o > hi) {
          hit = false
          break
        }
        continue
      }
      let t0 = (lo - o) / d
      let t1 = (hi - o) / d
      if (t0 > t1) [t0, t1] = [t1, t0]
      near = Math.max(near, t0)
      far = Math.min(far, t1)
      if (near > far) {
        hit = false
        break
      }
    }
    if (hit) return true
  }
  return false
}
