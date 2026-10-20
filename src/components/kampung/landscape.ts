import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Object3D,
} from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { addGrain, surfaceTextures } from "./surfaces"
import {
  BEACH_SLOPE,
  fbm,
  PIER,
  SAWAH,
  SHORE,
  terrainHeight,
  sandiness,
  WALK,
  WATER_Y,
} from "./terrain"
import { CARRIAGEWAYS, GANGWAYS, SIDEWALKS, slabPoints } from "./roads"

// Everything around the streets, drawn in code: the ground, the sea, rice
// fields, wooded hills, the jetty with its outrigger boats and Krakatau.

const std = (
  color: string,
  roughness = 0.85,
  extra: Partial<MeshStandardMaterial> = {}
) => new MeshStandardMaterial({ color: new Color(color), roughness, ...extra })

// sample positions: fine near the town, coarse out to the horizon
function axis(from: number, to: number, nearFrom: number, nearTo: number) {
  const out: number[] = []
  for (let v = from; v < nearFrom; v += 8) out.push(v)
  for (let v = nearFrom; v < nearTo; v += 2) out.push(v)
  for (let v = nearTo; v <= to; v += 8) out.push(v)
  return out
}

const GRASS_DARK = new Color("#5F7A3E")
const ROCK = new Color("#8A7F6A")

export function buildTerrain(): Mesh {
  const xs = axis(-340, 440, WALK.x0 - 24, WALK.x1 + 30)
  const zs = axis(-360, 320, WALK.z0 - 30, WALK.z1 + 24)
  const nx = xs.length
  const nz = zs.length
  const position = new Float32Array(nx * nz * 3)
  const uv = new Float32Array(nx * nz * 2)
  const color = new Float32Array(nx * nz * 3)
  const sand = new Float32Array(nx * nz)
  const c = new Color()
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i
      const x = xs[i]
      const z = zs[j]
      const y = terrainHeight(x, z)
      position.set([x, y, z], k * 3)
      uv.set([x / 7, z / 7], k * 2)
      sand[k] = sandiness(x, z)
      // hills darken into forest green and show rock where steep
      const lift = Math.min(1, Math.max(0, y / 14))
      const patch = fbm(x * 0.05, z * 0.05)
      c.setRGB(1, 1, 1)
        .lerp(GRASS_DARK, lift * 0.7)
        .lerp(ROCK, Math.max(0, lift - 0.75) * patch * 1.6)
      const shade = 0.92 + patch * 0.16
      color.set([c.r * shade, c.g * shade, c.b * shade], k * 3)
    }
  }
  const index: number[] = []
  for (let j = 0; j < nz - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i
      const b = a + 1
      const d = a + nx
      const e = d + 1
      index.push(a, d, b, b, d, e)
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(position, 3))
  geometry.setAttribute("uv", new BufferAttribute(uv, 2))
  geometry.setAttribute("color", new BufferAttribute(color, 3))
  geometry.setAttribute("sandy", new BufferAttribute(sand, 1))
  geometry.setIndex(index)
  geometry.computeVertexNormals()

  const textures = surfaceTextures()
  const material = new MeshStandardMaterial({
    map: textures.grass,
    vertexColors: true,
    roughness: 0.95,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.sandMap = { value: textures.sand }
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float sandy;\nvarying float vSandy;"
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvSandy = sandy;"
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D sandMap;\nvarying float vSandy;"
      )
      .replace(
        "#include <color_fragment>",
        `vec3 sandColor = texture2D(sandMap, vMapUv * 1.4).rgb;
        #include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, sandColor, vSandy);`
      )
  }
  material.customProgramCacheKey = () => "kampung-terrain"
  const mesh = new Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}

// ---- the sea: depth from the same beach profile, waves in the normals

export interface Sea {
  object: Object3D
  tick: (time: number) => void
}

export function buildSea(): Sea {
  const time = { value: 0 }
  const material = new MeshStandardMaterial({
    color: "#1D7F93",
    roughness: 0.22,
    metalness: 0,
    envMapIntensity: 0.55,
    transparent: true,
    depthWrite: false,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.seaTime = time
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeaPos;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvSeaPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vSeaPos;
        uniform float seaTime;
        float seaDepth(vec2 p) {
          float c = max(p.y - ${SHORE.south.toFixed(2)}, ${SHORE.west.toFixed(2)} - p.x);
          float ground = c <= 0.0 ? 0.0 : -c * ${BEACH_SLOPE.toFixed(3)} - c * c * 0.0016;
          return ${WATER_Y.toFixed(3)} - ground;
        }
        vec2 seaWaves(vec2 p, float t) {
          vec2 g = vec2(0.0);
          vec4 dirs[4];
          dirs[0] = vec4(0.8, 0.6, 0.55, 1.1);
          dirs[1] = vec4(-0.4, 0.92, 0.9, 1.6);
          dirs[2] = vec4(0.2, -0.98, 1.7, 2.3);
          dirs[3] = vec4(0.95, -0.3, 2.9, 3.1);
          for (int i = 0; i < 4; i++) {
            float k = dirs[i].z;
            float phase = dot(dirs[i].xy, p) * k + t * dirs[i].w;
            g += dirs[i].xy * k * cos(phase) * (0.05 / k);
          }
          return g;
        }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float depth = seaDepth(vSeaPos.xz);
        vec3 shallow = vec3(0.07, 0.36, 0.33);
        vec3 deep = vec3(0.012, 0.11, 0.17);
        float far = smoothstep(4.0, 40.0, depth);
        diffuseColor.rgb = mix(shallow, deep, smoothstep(0.0, 1.8, depth));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.01, 0.07, 0.13), far);
        // a band of foam that breathes on the sand
        float swash = 0.035 + 0.025 * sin(seaTime * 0.9 + vSeaPos.x * 0.21 + vSeaPos.z * 0.17);
        float foam = 1.0 - smoothstep(swash * 0.5, swash, depth);
        foam *= 0.55 + 0.45 * sin(vSeaPos.x * 3.1 + vSeaPos.z * 2.3 + seaTime * 1.7);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.84, 0.8), clamp(foam, 0.0, 1.0) * 0.8);
        diffuseColor.a = clamp(0.5 + depth * 1.8 + foam, 0.0, 1.0);`
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        vec2 slope = seaWaves(vSeaPos.xz, seaTime) + seaWaves(vSeaPos.xz * 2.7 + 13.0, seaTime * 1.4) * 0.5;
        normal = normalize(normal + (viewMatrix * vec4(-slope.x, 0.0, -slope.y, 0.0)).xyz);`
      )
  }
  material.customProgramCacheKey = () => "kampung-sea"
  const water = new Mesh(new PlaneGeometry(2400, 2400, 1, 1), material)
  water.rotation.x = -Math.PI / 2
  water.position.set(0, WATER_Y, 0)
  water.renderOrder = 1
  return {
    object: water,
    tick: (t) => {
      time.value = t
    },
  }
}

// ---- rice fields east of the kampung

function riceTexture() {
  const element = document.createElement("canvas")
  element.width = element.height = 256
  const c = element.getContext("2d")
  if (c) {
    c.fillStyle = "#6F9A3E"
    c.fillRect(0, 0, 256, 256)
    for (let row = 0; row < 16; row++) {
      for (let k = 0; k < 40; k++) {
        const x = (k * 6.4 + (row % 2) * 3) % 256
        const y = row * 16 + 8
        c.fillStyle = k % 3 ? "#83AE4C" : "#5C8834"
        c.beginPath()
        c.ellipse(x, y, 2.6, 5.5, (k % 5) * 0.2 - 0.4, 0, Math.PI * 2)
        c.fill()
      }
    }
    // standing water glinting between the rows
    c.fillStyle = "rgba(160,200,190,0.25)"
    for (let row = 0; row < 16; row++) c.fillRect(0, row * 16 + 14, 256, 2)
  }
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.anisotropy = 8
  return texture
}

export function buildSawah(): Object3D {
  const group = new Group()
  const plots: BufferGeometry[] = []
  const dikes: BufferGeometry[] = []
  const blocks = [
    { z0: SAWAH.z0, z1: -6 },
    { z0: 6, z1: SAWAH.z1 },
  ]
  const plotW = 10
  const plotD = 8
  const dike = 0.55
  for (const block of blocks) {
    for (let x = SAWAH.x0; x < SAWAH.x1 - 2; x += plotW) {
      for (let z = block.z0; z < block.z1 - 2; z += plotD) {
        const w = Math.min(plotW, SAWAH.x1 - x) - dike
        const d = Math.min(plotD, block.z1 - z) - dike
        const plane = new PlaneGeometry(w, d)
        plane.rotateX(-Math.PI / 2)
        // world-space texture coordinates so the rows line up
        const uv = plane.getAttribute("uv")
        const pos = plane.getAttribute("position")
        for (let i = 0; i < uv.count; i++)
          uv.setXY(
            i,
            (pos.getX(i) + x + w / 2) / 6,
            (pos.getZ(i) + z + d / 2) / 6
          )
        plane.translate(x + dike / 2 + w / 2, 0.03, z + dike / 2 + d / 2)
        plots.push(plane)
        // the dike along the west and north edges of each plot
        const a = new BoxGeometry(dike, 0.18, plotD)
        a.translate(x + dike / 2, 0.06, z + plotD / 2)
        const b = new BoxGeometry(plotW, 0.18, dike)
        b.translate(x + plotW / 2, 0.06, z + dike / 2)
        dikes.push(a, b)
      }
    }
  }
  const field = new Mesh(
    mergeGeometries(plots),
    new MeshStandardMaterial({ map: riceTexture(), roughness: 0.7 })
  )
  field.receiveShadow = true
  group.add(field)
  const banks = new Mesh(
    mergeGeometries(dikes),
    addGrain(std("#8E8A55", 0.95), 0.12, 0)
  )
  banks.receiveShadow = true
  group.add(banks)
  for (const g of [...plots, ...dikes]) g.dispose()
  // a few scarecrows with flags in the wind
  const pole = std("#6B4A2E", 0.8)
  const cloth = std("#C8452F", 0.8, { side: DoubleSide })
  for (const [x, z] of [
    [78, -30],
    [101, 22],
    [92, -55],
  ]) {
    const scarecrow = new Group()
    const post = new Mesh(new CylinderGeometry(0.05, 0.06, 2.2, 6), pole)
    post.position.y = 1.1
    const arm = new Mesh(new CylinderGeometry(0.035, 0.035, 1.4, 6), pole)
    arm.rotation.z = Math.PI / 2
    arm.position.y = 1.6
    const shirt = new Mesh(new BoxGeometry(0.7, 0.6, 0.18), cloth)
    shirt.position.y = 1.4
    const hat = new Mesh(
      new CylinderGeometry(0.02, 0.45, 0.3, 12),
      std("#D9C38A", 0.9)
    )
    hat.position.y = 2.2
    scarecrow.add(post, arm, shirt, hat)
    scarecrow.position.set(x, 0, z)
    scarecrow.rotation.y = x * 0.1
    scarecrow.traverse((o) => {
      if (o instanceof Mesh) o.castShadow = true
    })
    group.add(scarecrow)
  }
  return group
}

// ---- trees on the hills: cheap rounded canopies, thousands of them

export function buildForest(): Object3D {
  const spots: { x: number; z: number; y: number; s: number }[] = []
  for (let x = -330; x < 430; x += 6.5) {
    for (let z = -350; z < 60; z += 6.5) {
      const px = x + (fbm(x * 0.7, z * 0.7) - 0.5) * 7
      const pz = z + (fbm(z * 0.7 + 9, x * 0.7) - 0.5) * 7
      const y = terrainHeight(px, pz)
      if (y < 1.2) continue
      // clearings
      if (fbm(px * 0.03, pz * 0.03) < 0.36) continue
      spots.push({ x: px, z: pz, y, s: 2.2 + fbm(px, pz) * 2.6 })
    }
  }
  const canopy = new IcosahedronGeometry(1, 1)
  canopy.scale(1, 0.9, 1)
  canopy.translate(0, 2.1, 0)
  const trunk = new CylinderGeometry(0.12, 0.2, 2, 5)
  trunk.translate(0, 1, 0)
  const leaves = new InstancedMesh(
    canopy,
    new MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
    spots.length
  )
  const wood = new InstancedMesh(trunk, std("#5B4636", 0.9), spots.length)
  const matrix = new Matrix4()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const tone = new Color()
  spots.forEach((p, i) => {
    q.setFromAxisAngle(up, p.x * 1.7)
    const size = new Vector3(p.s, p.s * (0.9 + fbm(p.z, p.x) * 0.4), p.s)
    matrix.compose(new Vector3(p.x, p.y - 0.3, p.z), q, size)
    leaves.setMatrixAt(i, matrix)
    wood.setMatrixAt(i, matrix)
    tone.setHSL(
      0.24 + fbm(p.x * 0.3, p.z * 0.3) * 0.08,
      0.42,
      0.24 + fbm(p.z * 0.2, p.x * 0.2) * 0.12
    )
    leaves.setColorAt(i, tone)
  })
  // far up the hills: no shadows to cast near the player
  for (const mesh of [leaves, wood]) {
    mesh.receiveShadow = true
    mesh.computeBoundingSphere()
  }
  const group = new Group()
  group.add(leaves, wood)
  return group
}

// ---- the jetty and the boats

const WOOD = "#8A6A4A"

export function buildPier(): Object3D {
  const group = new Group()
  const wood = addGrain(std(WOOD, 0.85), 0.16, 0)
  const length = PIER.z1 - PIER.z0
  const planks = Math.floor(length / 0.3)
  const plank = new BoxGeometry(PIER.half * 2, 0.06, 0.26)
  const deck = new InstancedMesh(plank, wood, planks + 12)
  const matrix = new Matrix4()
  const tone = new Color()
  for (let i = 0; i < planks; i++) {
    matrix.makeTranslation(
      PIER.x + (i % 3) * 0.015,
      PIER.deck - 0.03,
      PIER.z0 + 0.15 + i * 0.3
    )
    deck.setMatrixAt(i, matrix)
    deck.setColorAt(i, tone.setHSL(0.08, 0.3, 0.42 + ((i * 37) % 11) * 0.012))
  }
  // the ramp up from the sand
  const rampFrom = PIER.z0 - 3.4
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12
    const m = new Matrix4().makeRotationX(Math.atan2(PIER.deck, 3.4))
    m.setPosition(PIER.x, PIER.deck * t - 0.03, rampFrom + t * 3.4)
    deck.setMatrixAt(planks + i, m)
    deck.setColorAt(planks + i, tone.setHSL(0.08, 0.3, 0.44))
  }
  deck.castShadow = true
  deck.receiveShadow = true
  group.add(deck)
  // posts down into the water, with a rail on top
  const postGeometry = new CylinderGeometry(0.09, 0.1, 1, 8)
  const posts: [number, number, number, number][] = []
  for (let z = PIER.z0; z <= PIER.z1 + 0.01; z += 3) {
    for (const side of [-1, 1]) {
      const x = PIER.x + side * (PIER.half - 0.05)
      const bottom = terrainHeight(x, z) - 0.4
      posts.push([x, bottom, z, PIER.deck + 1.05 - bottom])
    }
  }
  const postMesh = new InstancedMesh(postGeometry, wood, posts.length)
  posts.forEach(([x, bottom, z, height], i) => {
    matrix.compose(
      new Vector3(x, bottom + height / 2, z),
      new Quaternion(),
      new Vector3(1, height, 1)
    )
    postMesh.setMatrixAt(i, matrix)
  })
  postMesh.castShadow = true
  group.add(postMesh)
  for (const side of [-1, 1]) {
    const rail = new Mesh(new BoxGeometry(0.08, 0.1, length), wood)
    rail.position.set(
      PIER.x + side * (PIER.half - 0.05),
      PIER.deck + 1.0,
      (PIER.z0 + PIER.z1) / 2
    )
    rail.castShadow = true
    group.add(rail)
  }
  const end = new Mesh(new BoxGeometry(PIER.half * 2, 0.1, 0.08), wood)
  end.position.set(PIER.x, PIER.deck + 1.0, PIER.z1)
  group.add(end)
  // a lamp at the end of the jetty
  const lamp = new Mesh(
    new SphereGeometry(0.16, 16, 10),
    new MeshStandardMaterial({
      color: "#FFE2A8",
      emissive: new Color("#FFC870"),
      emissiveIntensity: 2.2,
    })
  )
  lamp.position.set(PIER.x + PIER.half - 0.05, PIER.deck + 2.3, PIER.z1)
  const lampPost = new Mesh(
    new CylinderGeometry(0.04, 0.05, 1.3, 6),
    std("#2B2B2E", 0.5, { metalness: 0.6 })
  )
  lampPost.position.set(PIER.x + PIER.half - 0.05, PIER.deck + 1.6, PIER.z1)
  group.add(lamp, lampPost)
  return group
}

// A jukung: a slim painted hull with bamboo outriggers on both sides.
function jukung(hull: string, stripe: string): Object3D {
  const group = new Group()
  const length = 6.4
  const segments = 28
  const around = 10
  const position: number[] = []
  const colors: number[] = []
  const index: number[] = []
  const a = new Color(hull)
  const b = new Color(stripe)
  for (let i = 0; i <= segments; i++) {
    const u = i / segments
    const x = (u - 0.5) * length
    const taper = Math.pow(Math.max(0, 1 - Math.pow(2 * u - 1, 2)), 0.55)
    const width = 0.42 * taper + 0.02
    const depth = 0.5 * taper + 0.05
    // the bow and stern curl up
    const lift = Math.pow(Math.abs(2 * u - 1), 3) * 0.55
    for (let k = 0; k <= around; k++) {
      const v = (k / around) * Math.PI
      const y = -Math.sin(v) * depth + lift + 0.2
      const z = Math.cos(v) * width
      position.push(x, y, z)
      const band = k <= 1 || k >= around - 1
      const c = band ? b : a
      colors.push(c.r, c.g, c.b)
    }
  }
  for (let i = 0; i < segments; i++)
    for (let k = 0; k < around; k++) {
      const p = i * (around + 1) + k
      const q = p + around + 1
      index.push(p, q, p + 1, p + 1, q, q + 1)
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(position), 3)
  )
  geometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(colors), 3)
  )
  geometry.setIndex(index)
  geometry.computeVertexNormals()
  const body = new Mesh(
    geometry,
    addGrain(
      new MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.6,
        side: DoubleSide,
      }),
      0.1,
      0
    )
  )
  group.add(body)
  const bamboo = std("#C9B07A", 0.7)
  for (const side of [-1, 1]) {
    const float = new Mesh(new CylinderGeometry(0.06, 0.06, 4.6, 8), bamboo)
    float.rotation.z = Math.PI / 2
    float.position.set(0, 0.02, side * 1.9)
    group.add(float)
  }
  for (const x of [-1.2, 1.2]) {
    const arm = new Mesh(new CylinderGeometry(0.045, 0.045, 3.9, 6), bamboo)
    arm.rotation.x = Math.PI / 2
    arm.position.set(x, 0.42, 0)
    group.add(arm)
  }
  const mast = new Mesh(
    new CylinderGeometry(0.04, 0.05, 2.4, 6),
    std("#6B4A2E", 0.8)
  )
  mast.position.set(0.6, 1.4, 0)
  group.add(mast)
  group.traverse((o) => {
    if (o instanceof Mesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return group
}

export interface Boat {
  object: Object3D
  x: number
  z: number
  yaw: number
  // moored boats float; beached ones sit on the sand
  floating: boolean
  phase: number
}

export const BOATS: Omit<Boat, "object">[] = [
  {
    x: PIER.x - 4.3,
    z: PIER.z0 + 11.5,
    yaw: Math.PI / 2 + 0.06,
    floating: true,
    phase: 0,
  },
  {
    x: PIER.x + 4.3,
    z: PIER.z0 + 17.5,
    yaw: Math.PI / 2 - 0.1,
    floating: true,
    phase: 1.7,
  },
  {
    x: PIER.x - 4.4,
    z: PIER.z0 + 24.5,
    yaw: Math.PI / 2 - 0.05,
    floating: true,
    phase: 3.1,
  },
  { x: -58, z: SHORE.south + 0.6, yaw: 0.25, floating: false, phase: 0 },
  { x: -18, z: SHORE.south + 0.4, yaw: -0.15, floating: false, phase: 0 },
]

const PAINT: [string, string][] = [
  ["#2E6FA3", "#F2D27A"],
  ["#C8452F", "#F1ECE2"],
  ["#2F8A6E", "#E8973A"],
  ["#F1ECE2", "#2E6FA3"],
  ["#E8973A", "#1A1714"],
]

export function buildBoats(): Boat[] {
  return BOATS.map((spec, i) => {
    const object = jukung(...PAINT[i % PAINT.length])
    object.position.set(
      spec.x,
      spec.floating ? WATER_Y : terrainHeight(spec.x, spec.z) - 0.1,
      spec.z
    )
    object.rotation.y = spec.yaw
    if (!spec.floating) object.rotation.z = 0.06
    return { ...spec, object }
  })
}

// ---- Anak Krakatau smoking on the horizon, out in the strait

export function buildVolcano(): Object3D {
  const group = new Group()
  const profile: Vector2[] = []
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    profile.push(new Vector2(10 + 80 * t, 46 * Math.pow(1 - t, 1.7)))
  }
  const volcano = new Mesh(
    new LatheGeometry(profile.reverse(), 72),
    addGrain(std("#4A4246", 0.95), 0.25, 0)
  )
  volcano.position.set(-420, -2, 140)
  group.add(volcano)
  const smoke = std("#EEE3DA", 1, {
    emissive: new Color("#F2C9A8"),
    emissiveIntensity: 0.22,
    transparent: true,
    opacity: 0.9,
  })
  for (let k = 0; k < 8; k++) {
    const t = k / 7
    const puff = new Mesh(new SphereGeometry(5 + t * 11, 18, 12), smoke)
    puff.position.set(-420 + t * 40, 48 + t * 32, 140 + t * 10)
    puff.scale.set(1.25, 0.8, 1)
    group.add(puff)
  }
  return group
}

// ---- streets: asphalt, markings, pavements with sloped kerbs

export function roadSurfaces(): Object3D {
  const group = new Group()
  const textures = surfaceTextures()
  const asphalt = new MeshStandardMaterial({
    map: textures.asphalt,
    roughness: 0.88,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  })
  const pieces: BufferGeometry[] = []
  CARRIAGEWAYS.forEach((r, i) => {
    const w = r.x1 - r.x0
    const d = r.z1 - r.z0
    const plane = new PlaneGeometry(w, d)
    plane.rotateX(-Math.PI / 2)
    const uv = plane.getAttribute("uv")
    const pos = plane.getAttribute("position")
    for (let k = 0; k < uv.count; k++)
      uv.setXY(
        k,
        (pos.getX(k) + r.x0 + w / 2) / 5,
        (pos.getZ(k) + r.z0 + d / 2) / 5
      )
    plane.translate(r.x0 + w / 2, 0.012 + i * 0.001, r.z0 + d / 2)
    pieces.push(plane)
  })
  const road = new Mesh(mergeGeometries(pieces), asphalt)
  road.receiveShadow = true
  group.add(road)
  // the gangs are poured concrete, a shade lighter than the pavements
  const alleys = GANGWAYS.map((r) => {
    const w = r.x1 - r.x0
    const d = r.z1 - r.z0
    const plane = new PlaneGeometry(w, d)
    plane.rotateX(-Math.PI / 2)
    const uv = plane.getAttribute("uv")
    const pos = plane.getAttribute("position")
    for (let k = 0; k < uv.count; k++)
      uv.setXY(
        k,
        (pos.getX(k) + r.x0 + w / 2) / 2.4,
        (pos.getZ(k) + r.z0 + d / 2) / 2.4
      )
    plane.translate(r.x0 + w / 2, 0.008, r.z0 + d / 2)
    return plane
  })
  const gang = new Mesh(
    mergeGeometries(alleys),
    new MeshStandardMaterial({
      map: textures.paving,
      color: "#E8E0D2",
      roughness: 0.85,
    })
  )
  gang.receiveShadow = true
  group.add(gang)
  return group
}

export function sidewalkGeometry() {
  const pieces: BufferGeometry[] = []
  for (const r of SIDEWALKS) {
    const p = slabPoints(r)
    // top, then the four sloped sides (bottom is never seen)
    const quads = [
      [7, 6, 5, 4],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ]
    const position: number[] = []
    const uv: number[] = []
    for (const q of quads) {
      const [a, b, c, d] = q.map((k) => p[k])
      for (const v of [a, b, c, a, c, d]) {
        position.push(...v)
        uv.push(v[0] / 2.4, v[2] / 2.4)
      }
    }
    const g = new BufferGeometry()
    g.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(position), 3)
    )
    g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2))
    // make every face point up and out
    const pos = g.getAttribute("position")
    for (let k = 0; k < pos.count; k += 3) {
      const v0 = new Vector3().fromBufferAttribute(pos, k)
      const v1 = new Vector3().fromBufferAttribute(pos, k + 1)
      const v2 = new Vector3().fromBufferAttribute(pos, k + 2)
      const n = v1.clone().sub(v0).cross(v2.clone().sub(v0))
      if (n.y < 0) {
        pos.setXYZ(k + 1, v2.x, v2.y, v2.z)
        pos.setXYZ(k + 2, v1.x, v1.y, v1.z)
        const u = [uv[(k + 1) * 2], uv[(k + 1) * 2 + 1]]
        g.getAttribute("uv").setXY(k + 1, uv[(k + 2) * 2], uv[(k + 2) * 2 + 1])
        g.getAttribute("uv").setXY(k + 2, u[0], u[1])
      }
    }
    g.computeVertexNormals()
    pieces.push(g)
  }
  const merged = mergeGeometries(pieces)
  for (const g of pieces) g.dispose()
  return merged
}
