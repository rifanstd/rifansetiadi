import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import {
  ConvexHullCollider,
  CuboidCollider,
  RigidBody,
} from "@react-three/rapier"
import {
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { useI18n } from "@/i18n/context"
import { bakeAsset, enhance, instanceGroup, type BakedAsset } from "./batch"
import { paintSign, shadows, tint, useKit, type Kit } from "./kit"
import {
  BOATS,
  buildBoats,
  buildForest,
  buildPier,
  buildSawah,
  buildSea,
  buildTerrain,
  buildVolcano,
  roadSurfaces,
  sidewalkGeometry,
} from "./landscape"
import {
  COLLIDERS,
  FIELD,
  HOUSES,
  POLE_ROWS,
  PROPS,
  SPECIAL,
  WIRE_POINTS,
  type Placement,
  type SignKey,
} from "./layout"
import { CARRIAGEWAYS, SIDEWALKS, slabPoints, STREETS } from "./roads"
import { surfaceTextures } from "./surfaces"
import { PIER, SHORE, WALK, WATER_Y } from "./terrain"

const SIGN_COLORS: Record<SignKey, { background: string; ink: string }> = {
  office: { background: "#2E6FA3", ink: "#F4F1EA" },
  projects: { background: "#E8973A", ink: "#1A1714" },
  shop: { background: "#2E6FA3", ink: "#F4F1EA" },
  repair: { background: "#2F8A6E", ink: "#F4F1EA" },
  warung: { background: "#F2D27A", ink: "#2B2620" },
}

function placeSpecial(kit: Kit, p: Placement, signs: Record<SignKey, string>) {
  const object = kit.take(p.asset)
  object.position.set(p.x, 0, p.z)
  object.rotation.y = p.yaw ?? 0
  if (p.wall) tint(object, "Dinding", p.wall)
  if (p.roof) tint(object, "Genteng", p.roof)
  if (p.sign)
    paintSign(
      object,
      "PapanNama",
      signs[p.sign],
      SIGN_COLORS[p.sign],
      p.asset === "warung" ? 4.7 : 7
    )
  if (p.id) object.name = p.id
  return shadows(enhance(object))
}

// the beach slopes are tilted boxes whose top follows the sand
const SLOPE = 0.08
const SLOPE_LENGTH = 24

function slopeBox(towards: "south" | "west") {
  const a = Math.atan(SLOPE)
  const half = SLOPE_LENGTH / 2
  if (towards === "south") {
    const x0 = SHORE.west
    const x1 = WALK.x1 + 10
    const top = new Vector3(
      (x0 + x1) / 2,
      -Math.sin(a) * half,
      SHORE.south + Math.cos(a) * half
    )
    return {
      args: [(x1 - x0) / 2, 1, half] as [number, number, number],
      position: top.sub(new Vector3(0, Math.cos(a), Math.sin(a))).toArray(),
      rotation: [a, 0, 0] as [number, number, number],
    }
  }
  const z0 = WALK.z0 - 10
  const z1 = SHORE.south
  const top = new Vector3(
    SHORE.west - Math.cos(a) * half,
    -Math.sin(a) * half,
    (z0 + z1) / 2
  )
  return {
    args: [half, 1, (z1 - z0) / 2] as [number, number, number],
    position: top.sub(new Vector3(-Math.sin(a), Math.cos(a), 0)).toArray(),
    rotation: [0, 0, a] as [number, number, number],
  }
}

const SOUTH_SLOPE = slopeBox("south")
const WEST_SLOPE = slopeBox("west")
const RAMP_LENGTH = 3.4
const RAMP_ANGLE = Math.atan2(PIER.deck, RAMP_LENGTH)
const SIDEWALK_POINTS = SIDEWALKS.map(
  (r) => new Float32Array(slabPoints(r).flat())
)

export function Town() {
  const kit = useKit()
  const { t } = useI18n()
  const signs = t.kampung.signs

  const special = useMemo(() => {
    const group = new Group()
    for (const p of SPECIAL) group.add(placeSpecial(kit, p, signs))
    return group
  }, [kit, signs])

  // the generated kampung: every house and prop drawn with instancing
  const town = useMemo(() => {
    const baked = new Map<string, BakedAsset>()
    for (const p of [...HOUSES, ...PROPS])
      if (!baked.has(p.asset)) baked.set(p.asset, bakeAsset(kit.take(p.asset)))
    const group = new Group()
    group.add(instanceGroup(baked, HOUSES))
    group.add(instanceGroup(baked, PROPS))
    return group
  }, [kit])

  const scenery = useMemo(() => {
    const group = new Group()
    group.add(buildTerrain(), buildSawah(), buildForest(), buildPier())
    group.add(buildVolcano())
    group.add(roadSurfaces(), buildMarkings(), buildPavements(), buildField())
    group.add(buildWires())
    return group
  }, [])
  const sea = useMemo(() => buildSea(), [])
  const boats = useMemo(() => {
    const group = new Group()
    for (const boat of buildBoats()) group.add(boat.object)
    return group
  }, [])
  const boatsRef = useRef<Group>(null)

  useEffect(
    () => () => {
      for (const child of town.children) {
        child.traverse((o) => {
          if (o instanceof InstancedMesh) o.dispose()
        })
      }
    },
    [town]
  )

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    sea.tick(time)
    boatsRef.current?.children.forEach((object, i) => {
      const boat = BOATS[i]
      if (!boat?.floating) return
      const t = time + boat.phase
      object.position.y = WATER_Y - 0.05 + Math.sin(t * 1.1) * 0.06
      object.rotation.x = Math.sin(t * 0.9) * 0.05
      object.rotation.z = Math.sin(t * 1.3 + 1) * 0.03
    })
  })

  return (
    <>
      <primitive object={scenery} />
      <primitive object={town} />
      <primitive object={special} />
      <primitive object={sea.object} />
      <primitive ref={boatsRef} object={boats} />
      <RigidBody type="fixed" colliders={false}>
        {/* flat land, and the sand sloping into the sea south and west */}
        <CuboidCollider
          args={[
            (WALK.x1 + 10 - SHORE.west) / 2,
            1,
            (SHORE.south - WALK.z0 + 10) / 2,
          ]}
          position={[
            (WALK.x1 + 10 + SHORE.west) / 2,
            -1,
            (SHORE.south + WALK.z0 - 10) / 2,
          ]}
        />
        <CuboidCollider {...SOUTH_SLOPE} />
        <CuboidCollider {...WEST_SLOPE} />
        {/* pavements: chamfered slabs, so wheels and feet roll up */}
        {SIDEWALK_POINTS.map((points, i) => (
          <ConvexHullCollider key={i} args={[points]} />
        ))}
        {COLLIDERS.map((b, i) => (
          <CuboidCollider
            key={i}
            args={b.half}
            position={b.center}
            rotation={[0, b.yaw, 0]}
          />
        ))}
        {/* the jetty: a ramp, the deck and its rails */}
        <CuboidCollider
          args={[PIER.half, 0.1, RAMP_LENGTH / 2 / Math.cos(RAMP_ANGLE)]}
          position={[
            PIER.x,
            PIER.deck / 2 - 0.1 * Math.cos(RAMP_ANGLE),
            PIER.z0 - RAMP_LENGTH / 2,
          ]}
          rotation={[-RAMP_ANGLE, 0, 0]}
        />
        <CuboidCollider
          args={[PIER.half, 0.1, (PIER.z1 - PIER.z0) / 2]}
          position={[PIER.x, PIER.deck - 0.1, (PIER.z0 + PIER.z1) / 2]}
        />
        {[-1, 1].map((side) => (
          <CuboidCollider
            key={side}
            args={[0.06, 0.6, (PIER.z1 - PIER.z0) / 2]}
            position={[
              PIER.x + side * (PIER.half - 0.05),
              PIER.deck + 0.6,
              (PIER.z0 + PIER.z1) / 2,
            ]}
          />
        ))}
        <CuboidCollider
          args={[PIER.half, 0.6, 0.06]}
          position={[PIER.x, PIER.deck + 0.6, PIER.z1]}
        />
        {BOATS.filter((b) => !b.floating).map((b, i) => (
          <CuboidCollider
            key={i}
            args={[3.1, 0.35, 0.45]}
            position={[b.x, 0.1, b.z]}
            rotation={[0, b.yaw, 0]}
          />
        ))}
        {/* the edge of the world: hills, rice fields and deeper water */}
        <CuboidCollider
          args={[(WALK.x1 - WALK.x0) / 2 + 2, 4, 1]}
          position={[(WALK.x0 + WALK.x1) / 2, 3, WALK.z0 - 1]}
        />
        <CuboidCollider
          args={[1, 4, (WALK.z1 - WALK.z0) / 2 + 2]}
          position={[WALK.x0 - 1, 3, (WALK.z0 + WALK.z1) / 2]}
        />
        <CuboidCollider
          args={[1, 4, (WALK.z1 - WALK.z0) / 2 + 2]}
          position={[WALK.x1 + 1, 3, (WALK.z0 + WALK.z1) / 2]}
        />
        {[
          [WALK.x0 - 2, PIER.x - PIER.half - 0.1],
          [PIER.x + PIER.half + 0.1, WALK.x1 + 2],
        ].map(([x0, x1]) => (
          <CuboidCollider
            key={x0}
            args={[(x1 - x0) / 2, 2, 1]}
            position={[(x0 + x1) / 2, 1.5, WALK.z1 + 1]}
          />
        ))}
      </RigidBody>
    </>
  )
}

const std = (color: string, roughness = 0.85) =>
  new MeshStandardMaterial({ color: new Color(color), roughness })

function buildPavements() {
  const textures = surfaceTextures()
  const mesh = new Mesh(
    sidewalkGeometry(),
    new MeshStandardMaterial({ map: textures.paving, roughness: 0.82 })
  )
  mesh.receiveShadow = true
  return mesh
}

// dashed centre lines, broken at junctions, and zebra crossings at the
// places people cross to the field and the warung
function buildMarkings() {
  const pieces: BufferGeometry[] = []
  STREETS.forEach((road, index) => {
    if (!road.marked) return
    const alongX = road.a[1] === road.b[1]
    const from = alongX ? road.a[0] : road.a[1]
    const to = alongX ? road.b[0] : road.b[1]
    for (let s = Math.min(from, to) + 2; s < Math.max(from, to) - 2; s += 3.3) {
      const x = alongX ? s : road.a[0]
      const z = alongX ? road.a[1] : s
      const crossing = CARRIAGEWAYS.some(
        (r, k) =>
          k !== index &&
          x > r.x0 - 1.5 &&
          x < r.x1 + 1.5 &&
          z > r.z0 - 1.5 &&
          z < r.z1 + 1.5
      )
      if (crossing) continue
      const dash = new BoxGeometry(
        alongX ? 1.8 : 0.13,
        0.004,
        alongX ? 0.13 : 1.8
      )
      dash.translate(x, 0.024, z)
      pieces.push(dash)
    }
  })
  for (const x of [-14, 24]) {
    for (let z = -2.9; z <= 2.95; z += 0.85) {
      const stripe = new BoxGeometry(2.6, 0.004, 0.45)
      stripe.translate(x, 0.024, z)
      pieces.push(stripe)
    }
  }
  const mesh = new Mesh(mergeGeometries(pieces), std("#EDE6D6", 0.6))
  for (const g of pieces) g.dispose()
  mesh.receiveShadow = true
  return mesh
}

function buildField() {
  const group = new Group()
  const textures = surfaceTextures()
  const field = new Mesh(
    new PlaneGeometry(FIELD.halfX * 2 + 0.8, FIELD.halfZ * 2 + 0.8),
    new MeshStandardMaterial({ map: textures.field, roughness: 0.9 })
  )
  field.material.map?.repeat.set(4, 3)
  field.rotation.x = -Math.PI / 2
  field.position.set(FIELD.x, 0.006, FIELD.z)
  field.receiveShadow = true
  group.add(field)
  const line = std("#F1ECE2", 0.6)
  const { x, z, halfX, halfZ } = FIELD
  const lines: [number, number, number, number][] = [
    [x, z - halfZ, halfX * 2, 0.12],
    [x, z + halfZ, halfX * 2, 0.12],
    [x - halfX, z, 0.12, halfZ * 2],
    [x + halfX, z, 0.12, halfZ * 2],
    [x, z, 0.12, halfZ * 2],
  ]
  for (const [lx, lz, w, d] of lines) {
    const m = new Mesh(new BoxGeometry(w, 0.01, d), line)
    m.position.set(lx, 0.012, lz)
    m.receiveShadow = true
    group.add(m)
  }
  const post = new CylinderGeometry(0.05, 0.05, 2, 10)
  const bar = new CylinderGeometry(
    0.05,
    0.05,
    FIELD.goalZ[1] - FIELD.goalZ[0] + 0.1,
    10
  )
  for (const gx of [x - halfX + 0.2, x + halfX - 0.2]) {
    for (const gz of FIELD.goalZ) {
      const p = new Mesh(post, line)
      p.position.set(gx, 1, gz)
      p.castShadow = true
      group.add(p)
    }
    const b = new Mesh(bar, line)
    b.rotation.x = Math.PI / 2
    b.position.set(gx, 2, (FIELD.goalZ[0] + FIELD.goalZ[1]) / 2)
    b.castShadow = true
    group.add(b)
  }
  return group
}

// wires sag between neighbouring poles along each row
function buildWires() {
  const pieces: BufferGeometry[] = []
  for (const row of POLE_ROWS) {
    for (let i = 0; i < row.length - 1; i++) {
      const p = row[i]
      const q = row[i + 1]
      if (Math.abs(q.x - p.x) > 30) continue
      for (const [y, dz] of WIRE_POINTS) {
        const a = new Vector3(p.x, y, p.z + dz)
        const b = new Vector3(q.x, y, q.z + dz)
        const points: Vector3[] = []
        for (let k = 0; k <= 10; k++) {
          const t = k / 10
          const point = a.clone().lerp(b, t)
          point.y -= 0.85 * 4 * t * (1 - t)
          points.push(point)
        }
        pieces.push(
          new TubeGeometry(new CatmullRomCurve3(points), 20, 0.012, 4)
        )
      }
    }
  }
  const mesh = new Mesh(mergeGeometries(pieces), std("#1C1B1B", 0.6))
  for (const g of pieces) g.dispose()
  mesh.castShadow = true
  return mesh
}
