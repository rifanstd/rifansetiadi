import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import {
  BufferAttribute,
  CanvasTexture,
  Color,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three"
import { KIT, type KitFile } from "./layout"

const URLS: Record<KitFile, string> = {
  bangunan: "/models/kampung/bangunan.glb",
  kendaraan: "/models/kampung/kendaraan.glb",
  alam: "/models/kampung/alam.glb",
  props: "/models/kampung/props.glb",
  aksesori: "/models/kampung/aksesori.glb",
}
for (const url of Object.values(URLS)) useGLTF.preload(url)
export const RIDER_URL = "/models/rider.glb"
export const MOTOR_URL = "/models/ojek.glb"

export interface Kit {
  // a fresh copy of a kit asset; geometry and materials are shared
  take: (name: string) => Object3D
}

export function useKit(): Kit {
  const bangunan = useGLTF(URLS.bangunan).scene
  const kendaraan = useGLTF(URLS.kendaraan).scene
  const alam = useGLTF(URLS.alam).scene
  const props = useGLTF(URLS.props).scene
  const aksesori = useGLTF(URLS.aksesori).scene
  return useMemo(() => {
    const files: Record<KitFile, Object3D> = {
      bangunan,
      kendaraan,
      alam,
      props,
      aksesori,
    }
    return {
      take(name: string) {
        const file = KIT[name]
        const source = file ? files[file].getObjectByName(name) : undefined
        if (!source) throw new Error(`kit asset ${name} is missing`)
        const copy = source.clone(true)
        copy.position.set(0, 0, 0)
        copy.rotation.set(0, 0, 0)
        return copy
      },
    }
  }, [bangunan, kendaraan, alam, props, aksesori])
}

export function shadows(object: Object3D, cast = true) {
  object.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = cast
      child.receiveShadow = true
    }
  })
  return object
}

// Gives this copy its own colour for every material with the given name
// (the kit keeps names stable: Dinding, Genteng, CatAngkot, Jaket, …).
export function tint(object: Object3D, materialName: string, color: string) {
  const replaced = new Map<Material, Material>()
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return
    const swap = (material: Material) => {
      if (!material.name.startsWith(materialName)) return material
      let copy = replaced.get(material)
      if (!copy) {
        copy = material.clone()
        if (copy instanceof MeshStandardMaterial) copy.color = new Color(color)
        replaced.set(material, copy)
      }
      return copy
    }
    child.material = Array.isArray(child.material)
      ? child.material.map(swap)
      : swap(child.material)
  })
  return object
}

export function hideNamed(object: Object3D, names: string[]) {
  for (const name of names) {
    const node = object.getObjectByName(name)
    if (node) node.visible = false
  }
}

// A painted shop sign: the kit leaves a blank face named PapanNama (or
// PapanTrayek on the angkot) for the game to write on in either language.
export function paintSign(
  object: Object3D,
  faceName: string,
  text: string,
  colors: { background: string; ink: string },
  aspect = 4
) {
  const face = object.getObjectByName(faceName)
  if (!(face instanceof Mesh)) return
  planarUv(face, object)
  const width = 1024
  const height = Math.round(width / aspect)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return
  context.fillStyle = colors.background
  context.fillRect(0, 0, width, height)
  context.fillStyle = colors.ink
  context.textAlign = "center"
  context.textBaseline = "middle"
  let size = height * 0.62
  context.font = `700 ${size}px 'Archivo', 'IBM Plex Sans', sans-serif`
  while (context.measureText(text).width > width * 0.86 && size > 20) {
    size -= 4
    context.font = `700 ${size}px 'Archivo', 'IBM Plex Sans', sans-serif`
  }
  context.fillText(text, width / 2, height / 2 + size * 0.04)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  face.material = new MeshStandardMaterial({
    map: texture,
    roughness: 0.55,
    emissive: new Color("#ffffff"),
    emissiveMap: texture,
    emissiveIntensity: 0.12,
  })
}

// Sign faces get texture coordinates measured in world space: across the
// face as seen from the front, and up. The kit's own coordinates are not
// trusted (the optimiser may zero them, and they can run either way), and
// the front is the side facing away from the middle of the object.
function planarUv(face: Mesh, root: Object3D) {
  const geometry = face.geometry.clone() as BufferGeometry
  face.geometry = geometry
  root.updateWorldMatrix(true, true)
  const matrix = face.matrixWorld
  const normal = geometry.getAttribute("normal")
  const facing = new Vector3(
    normal.getX(0),
    normal.getY(0),
    normal.getZ(0)
  ).transformDirection(matrix)
  geometry.computeBoundingBox()
  const middle = new Vector3()
  geometry.boundingBox?.getCenter(middle)
  middle.applyMatrix4(matrix)
  const outward = middle.sub(
    new Vector3().setFromMatrixPosition(root.matrixWorld)
  )
  outward.y = 0
  if (outward.dot(facing) < 0) facing.negate()
  const up = new Vector3(0, 1, 0)
  const right = up.clone().cross(facing).normalize()
  const position = geometry.getAttribute("position")
  const point = new Vector3()
  const us: number[] = []
  const vs: number[] = []
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(matrix)
    us.push(point.dot(right))
    vs.push(point.dot(up))
  }
  const [u0, u1] = [Math.min(...us), Math.max(...us)]
  const [v0, v1] = [Math.min(...vs), Math.max(...vs)]
  const uv = new Float32Array(position.count * 2)
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = (us[i] - u0) / (u1 - u0 || 1)
    uv[i * 2 + 1] = (vs[i] - v0) / (v1 - v0 || 1)
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2))
}

// The neck pivot of rider.glb at rest; accessories were modelled around the
// head in the same rest pose, so they hang off the neck with this offset.
export const NECK_REST = new Vector3(0, 1.36, 0)

export function attachToNeck(rider: Object3D, accessory: Object3D) {
  const neck = rider.getObjectByName("Rig_Neck")
  if (!neck) return
  accessory.position.sub(NECK_REST)
  neck.add(accessory)
}
