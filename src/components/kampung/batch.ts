import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type Material,
  type Object3D,
} from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import type { Placement } from "./layout"
import { addGrain, reliefMaps } from "./surfaces"

// Many copies of a few kit assets: every asset is baked into a handful of
// merged geometries (one per kind of surface) with the kit's colours as
// vertex colours, then drawn with instancing, chunk by chunk so the camera
// can cull what it does not see. Walls and roofs take a colour per copy.

export type Layer =
  | "dinding"
  | "genteng"
  | "opaque"
  | "seng"
  | "metal"
  | "glass"
  | "glow"

export type BakedAsset = Partial<Record<Layer, BufferGeometry>>

function layerOf(material: MeshStandardMaterial): Layer {
  const name = material.name
  if (name.startsWith("Dinding")) return "dinding"
  if (name.startsWith("Genteng")) return "genteng"
  if (name.startsWith("Seng") || name.startsWith("Rolling")) return "seng"
  if (name.startsWith("Kaca") || name.startsWith("Visor")) return "glass"
  if (material.emissiveIntensity > 0.05 && material.emissive.getHex() !== 0)
    return "glow"
  if (material.metalness > 0.5) return "metal"
  return "opaque"
}

const p = new Vector3()

// a non-indexed, float copy with position, normal, uv and colour
function plain(geometry: BufferGeometry, matrix: Matrix4, color: Color) {
  const index = geometry.getIndex()
  const position = geometry.getAttribute("position")
  const normal = geometry.getAttribute("normal")
  const uv = geometry.getAttribute("uv")
  const count = index ? index.count : position.count
  const pos = new Float32Array(count * 3)
  const nor = new Float32Array(count * 3)
  const tex = new Float32Array(count * 2)
  const col = new Float32Array(count * 3)
  const normalMatrix = new Matrix3().getNormalMatrix(matrix)
  for (let k = 0; k < count; k++) {
    const i = index ? index.getX(k) : k
    p.fromBufferAttribute(position, i).applyMatrix4(matrix)
    pos.set([p.x, p.y, p.z], k * 3)
    if (normal) {
      p.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).normalize()
      nor.set([p.x, p.y, p.z], k * 3)
    }
    if (uv) tex.set([uv.getX(i), uv.getY(i)], k * 2)
    col.set([color.r, color.g, color.b], k * 3)
  }
  const out = new BufferGeometry()
  out.setAttribute("position", new BufferAttribute(pos, 3))
  out.setAttribute("normal", new BufferAttribute(nor, 3))
  out.setAttribute("uv", new BufferAttribute(tex, 2))
  out.setAttribute("color", new BufferAttribute(col, 3))
  return out
}

const WHITE = new Color(1, 1, 1)

export function bakeAsset(root: Object3D): BakedAsset {
  root.updateWorldMatrix(true, true)
  const inverse = root.matrixWorld.clone().invert()
  const parts: Partial<Record<Layer, BufferGeometry[]>> = {}
  root.traverse((child) => {
    if (!(child instanceof Mesh) || !child.visible) return
    const material = (
      Array.isArray(child.material) ? child.material[0] : child.material
    ) as Material
    if (!(material instanceof MeshStandardMaterial)) return
    const layer = layerOf(material)
    const tinted = layer === "dinding" || layer === "genteng"
    const color =
      layer === "glow" ? material.emissive : tinted ? WHITE : material.color
    const matrix = inverse.clone().multiply(child.matrixWorld)
    ;(parts[layer] ??= []).push(plain(child.geometry, matrix, color))
  })
  const baked: BakedAsset = {}
  for (const [layer, list] of Object.entries(parts) as [
    Layer,
    BufferGeometry[],
  ][]) {
    const merged = mergeGeometries(list, false)
    if (merged) {
      merged.computeBoundingSphere()
      baked[layer] = merged
    }
    for (const g of list) g.dispose()
  }
  return baked
}

let shared: Record<Layer, Material> | null = null

export function layerMaterials(): Record<Layer, Material> {
  if (shared) return shared
  const { tile, zinc } = reliefMaps()
  shared = {
    dinding: addGrain(
      new MeshStandardMaterial({ roughness: 0.92 }),
      0.08,
      0.22
    ),
    genteng: addGrain(
      new MeshStandardMaterial({ roughness: 0.72, normalMap: tile }),
      0.06,
      0
    ),
    opaque: addGrain(
      new MeshStandardMaterial({ vertexColors: true, roughness: 0.78 }),
      0.05,
      0.12
    ),
    seng: new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.55,
      normalMap: zinc,
      side: DoubleSide,
    }),
    metal: new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.75,
    }),
    glass: new MeshStandardMaterial({
      color: "#2B3E48",
      roughness: 0.06,
      metalness: 0.4,
      envMapIntensity: 1.4,
    }),
    glow: new MeshBasicMaterial({ vertexColors: true }),
  }
  return shared
}

// The original colours the kit used for walls and roofs, for copies that
// do not choose their own.
const DEFAULT_TINT: Partial<Record<Layer, string>> = {
  dinding: "#E9DFC8",
  genteng: "#B5553A",
}

const matrix = new Matrix4()
const quaternion = new Quaternion()
const scale = new Vector3()
const offset = new Vector3()
const up = new Vector3(0, 1, 0)

export function instanceGroup(
  baked: Map<string, BakedAsset>,
  placements: Placement[],
  options: { chunk?: number; castShadow?: boolean } = {}
): Group {
  const chunk = options.chunk ?? 48
  const group = new Group()
  const materials = layerMaterials()
  const cells = new Map<string, Placement[]>()
  for (const p of placements) {
    const key = `${p.asset}|${Math.floor(p.x / chunk)}|${Math.floor(p.z / chunk)}`
    const list = cells.get(key)
    if (list) list.push(p)
    else cells.set(key, [p])
  }
  for (const [key, list] of cells) {
    const asset = baked.get(key.split("|")[0])
    if (!asset) continue
    for (const [layer, geometry] of Object.entries(asset) as [
      Layer,
      BufferGeometry,
    ][]) {
      const mesh = new InstancedMesh(geometry, materials[layer], list.length)
      const tinted = layer === "dinding" || layer === "genteng"
      list.forEach((placement, i) => {
        offset.set(placement.x, 0, placement.z)
        quaternion.setFromAxisAngle(up, placement.yaw ?? 0)
        scale.setScalar(placement.scale ?? 1)
        mesh.setMatrixAt(i, matrix.compose(offset, quaternion, scale))
        if (tinted) {
          const color = layer === "dinding" ? placement.wall : placement.roof
          mesh.setColorAt(i, new Color(color ?? DEFAULT_TINT[layer]))
        }
      })
      mesh.castShadow = options.castShadow ?? layer !== "glass"
      mesh.receiveShadow = true
      mesh.computeBoundingSphere()
      group.add(mesh)
    }
  }
  return group
}

// The hand-placed special buildings keep their own nodes (shutters, signs)
// but get the same surfaces as the instanced town.
export function enhance(object: Object3D) {
  const { tile, zinc } = reliefMaps()
  const done = new Set<Material>()
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return
    const material = child.material as Material
    if (!(material instanceof MeshStandardMaterial) || done.has(material))
      return
    done.add(material)
    const layer = layerOf(material)
    if (layer === "genteng") material.normalMap = tile
    else if (layer === "seng") {
      material.normalMap = zinc
      material.side = DoubleSide
    } else if (layer === "dinding") addGrain(material, 0.08, 0.22)
    else if (layer === "opaque") addGrain(material, 0.05, 0.12)
    material.needsUpdate = true
  })
  return object
}
