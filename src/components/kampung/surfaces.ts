import {
  CanvasTexture,
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  type Texture,
} from "three"

// Surfaces drawn in code: ground textures, normal maps for tiles and zinc,
// and a fine plaster grain with ground grime for every opaque material.

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function canvas(
  size: number,
  draw: (c: CanvasRenderingContext2D, size: number) => void
) {
  const element = document.createElement("canvas")
  element.width = size
  element.height = size
  const context = element.getContext("2d")
  if (context) draw(context, size)
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.anisotropy = 8
  return texture
}

function speckle(
  c: CanvasRenderingContext2D,
  size: number,
  base: string,
  dots: [string, number, number][],
  seed: number
) {
  c.fillStyle = base
  c.fillRect(0, 0, size, size)
  const r = rng(seed)
  for (const [color, count, radius] of dots) {
    c.fillStyle = color
    for (let i = 0; i < count; i++) {
      c.globalAlpha = 0.25 + r() * 0.5
      c.beginPath()
      c.arc(r() * size, r() * size, radius * (0.4 + r()), 0, Math.PI * 2)
      c.fill()
    }
  }
  c.globalAlpha = 1
}

let cache: Record<string, Texture> | null = null

export function surfaceTextures() {
  if (cache) return cache
  const asphalt = canvas(512, (c, s) => {
    speckle(
      c,
      s,
      "#57534F",
      [
        ["#3F3C39", 900, 2.2],
        ["#6E6A64", 700, 1.6],
        ["#4A4743", 40, 26],
      ],
      3
    )
  })
  const paving = canvas(512, (c, s) => {
    speckle(
      c,
      s,
      "#BDB3A3",
      [
        ["#A79D8D", 500, 2],
        ["#CFC6B6", 400, 1.6],
      ],
      5
    )
    // block joints: four rows of half-bond pavers per repeat
    c.strokeStyle = "rgba(90,82,72,0.55)"
    c.lineWidth = 3
    const rows = 4
    const cell = s / rows
    for (let row = 0; row <= rows; row++) {
      c.beginPath()
      c.moveTo(0, row * cell)
      c.lineTo(s, row * cell)
      c.stroke()
      for (let k = 0; k < 3; k++) {
        const x = ((k + (row % 2) * 0.5) * s) / 2
        c.beginPath()
        c.moveTo(x, row * cell)
        c.lineTo(x, (row + 1) * cell)
        c.stroke()
      }
    }
  })
  const kerb = canvas(256, (c, s) => {
    speckle(
      c,
      s,
      "#9A9286",
      [
        ["#8A8276", 300, 1.6],
        ["#ABA397", 300, 1.4],
      ],
      9
    )
  })
  const grass = canvas(512, (c, s) => {
    speckle(
      c,
      s,
      "#98A266",
      [
        ["#7F8E52", 1400, 3],
        ["#AEB27A", 900, 2.4],
        ["#A28F64", 260, 7],
      ],
      11
    )
  })
  const sand = canvas(512, (c, s) => {
    speckle(
      c,
      s,
      "#E0CB9E",
      [
        ["#D2BB8C", 1200, 1.8],
        ["#EADAB4", 900, 1.4],
      ],
      13
    )
  })
  const field = canvas(512, (c, s) => {
    speckle(
      c,
      s,
      "#7FA35A",
      [
        ["#6E944C", 1400, 2.6],
        ["#93B46A", 1000, 2.2],
      ],
      17
    )
  })
  cache = { asphalt, paving, kerb, grass, sand, field }
  return cache
}

// a normal map from a height function over one repeat (u across, v along)
function normalMap(
  size: number,
  height: (u: number, v: number) => number,
  strength: number
) {
  const data = new Uint8Array(size * size * 4)
  const h = (x: number, y: number) =>
    height(
      (((x % size) + size) % size) / size,
      (((y % size) + size) % size) / size
    )
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      data[i] = ((-dx / len) * 0.5 + 0.5) * 255
      data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      data[i + 3] = 255
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

let maps: { tile: Texture; zinc: Texture } | null = null

export function reliefMaps() {
  if (maps) return maps
  // barrel tiles: a rounded hump across, each row overlapping the one below
  const tile = normalMap(
    128,
    (u, v) =>
      Math.pow(Math.sin(Math.PI * u), 0.7) * 0.55 +
      (1 - v) * 0.45 -
      (v < 0.06 ? 0.4 : 0),
    9
  )
  tile.repeat.set(1 / 0.27, 1 / 0.33)
  const zinc = normalMap(64, (u) => 0.5 + 0.5 * Math.sin(2 * Math.PI * u), 4)
  zinc.repeat.set(1 / 0.12, 1)
  maps = { tile, zinc }
  return maps
}

// Plaster grain and a darker band near the ground, in world space so it needs
// no texture coordinates and works on instanced geometry.
export function addGrain(
  material: MeshStandardMaterial,
  amount = 0.07,
  grime = 0.18
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.grainAmount = { value: amount }
    shader.uniforms.grimeAmount = { value: grime }
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vGrainPos;"
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 grainWorld = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          grainWorld = instanceMatrix * grainWorld;
        #endif
        vGrainPos = (modelMatrix * grainWorld).xyz;`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vGrainPos;
        uniform float grainAmount;
        uniform float grimeAmount;
        float grainHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float grainNoise(vec3 x) {
          vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(grainHash(i), grainHash(i + vec3(1,0,0)), f.x), mix(grainHash(i + vec3(0,1,0)), grainHash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(grainHash(i + vec3(0,0,1)), grainHash(i + vec3(1,0,1)), f.x), mix(grainHash(i + vec3(0,1,1)), grainHash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float grain = grainNoise(vGrainPos * 9.0) * 0.6 + grainNoise(vGrainPos * 1.7) * 0.4;
        diffuseColor.rgb *= 1.0 + (grain - 0.5) * grainAmount * 2.0;
        float grime = (1.0 - smoothstep(0.0, 0.7, vGrainPos.y)) * grimeAmount;
        diffuseColor.rgb *= 1.0 - grime * (0.6 + grain * 0.4);`
      )
  }
  material.customProgramCacheKey = () => `grain-${amount}-${grime}`
  return material
}

export const WATER_COLOR = new Color("#1E8A92")
