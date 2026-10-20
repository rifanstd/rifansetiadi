import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Lightformer, Sky } from "@react-three/drei"
import { Physics, useBeforePhysicsStep } from "@react-three/rapier"
import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import { Vector3, type DirectionalLight, type Object3D } from "three"
import { Button } from "@/components/ui/button"
import {
  CourierRig,
  type CameraShot,
  type CourierStatus,
} from "@/components/courier/CourierRig"
import { useDriveInput, type DriveInput } from "@/components/courier/input"
import {
  createCourier,
  riderRootDrop,
  type Courier,
  type CourierPhysics,
} from "@/components/courier/physics"
import { useI18n } from "@/i18n/context"
import type { PortfolioData } from "@/types/portfolio"
import { createBubbleStore, type BubbleStore } from "./bubbles"
import { attachToNeck, hideNamed, shadows, useKit } from "./kit"
import { KampungHud, type ControlMode, type Prompt } from "./KampungHud"
import { KampungMap } from "./KampungMap"
import { PLACES, PLAYER_START, SIDEWALK, type PlaceId } from "./layout"
import { cameraBlocked } from "./occlusion"
import { Town } from "./Town"
import { Townsfolk } from "./Townsfolk"
import { Traffic } from "./Traffic"
import {
  createTraffic,
  type Traffic as TrafficState,
  type Vehicle,
} from "./trafficSim"
import type { Crowd, TalkState } from "./townsfolkSim"
import { KAMPUNG_CAMERA, KAMPUNG_TUNING } from "./tuning"

const SUN = new Vector3(-0.78, 0.36, -0.3).normalize()
const FAR = new Vector3(1e4, 0, 1e4)

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export default function KampungWorld({ data }: { data: PortfolioData }) {
  const { t } = useI18n()
  const [webgl] = useState(hasWebGL)
  const [coarse] = useState(
    () => window.matchMedia("(pointer: coarse)").matches
  )
  const inputRef = useDriveInput()
  const courierRef = useRef<Courier>(createCourier(KAMPUNG_TUNING, "walking"))
  const physicsRef = useRef<CourierPhysics | null>(null)
  const shotRef = useRef<CameraShot | null>(null)
  const hiddenRef = useRef(false)
  const bubblesRef = useRef<BubbleStore>(createBubbleStore())
  const talkRef = useRef<TalkState>({
    npc: null,
    speaking: false,
    facing: new Vector3(),
  })
  const crowdRef = useRef<Crowd | null>(null)
  const trafficRef = useRef<TrafficState>(createTraffic())
  const playerRef = useRef(new Vector3())
  const targetRef = useRef<[number, number] | null>(null)

  const [status, setStatus] = useState<CourierStatus>({
    onFoot: true,
    canMount: false,
    canDismount: false,
  })
  const [prompt, setPrompt] = useState<Prompt>(null)
  const [dialogue, setDialogue] = useState<{
    place: PlaceId
    npc: string
  } | null>(null)
  const [summary, setSummary] = useState<PlaceId | null>(null)
  const [passenger, setPassenger] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const guide = useCallback((spot: [number, number]) => {
    targetRef.current = spot
  }, [])

  const openDialogue = useCallback((place: PlaceId) => {
    const spot = PLACES.find((p) => p.id === place)
    if (!spot) return
    shotRef.current = {
      position: new Vector3(...spot.shot.position),
      target: new Vector3(...spot.shot.target),
    }
    talkRef.current.npc = spot.npc
    talkRef.current.facing.copy(courierRef.current.focus)
    if (targetRef.current && place === "projects") targetRef.current = null
    setDialogue({ place, npc: spot.npc })
  }, [])

  const closeDialogue = useCallback((guide?: PlaceId) => {
    shotRef.current = null
    talkRef.current.npc = null
    talkRef.current.speaking = false
    setDialogue(null)
    if (guide) {
      const spot = PLACES.find((p) => p.id === guide)
      if (spot) targetRef.current = spot.spot
    }
  }, [])

  const board = useCallback(() => {
    const traffic = trafficRef.current
    traffic.passenger = 0
    traffic.alight = false
    hiddenRef.current = true
    physicsRef.current?.riderBody.setEnabled(false)
    setPassenger(true)
  }, [])

  // the angkot stopped for us: step out onto the pavement on its left
  const alight = useCallback((vehicle: Vehicle) => {
    const traffic = trafficRef.current
    if (traffic.passenger === null) return
    traffic.passenger = null
    traffic.alight = false
    const h = vehicle.at.heading
    const x = vehicle.at.x - Math.sin(h) * 2.3
    const z = vehicle.at.z - Math.cos(h) * 2.3
    const y = SIDEWALK.height + riderRootDrop(KAMPUNG_TUNING) + 0.05
    const physics = physicsRef.current
    if (physics) {
      physics.riderBody.setEnabled(true)
      physics.riderBody.setTranslation({ x, y, z }, true)
      physics.riderBody.setNextKinematicTranslation({ x, y, z })
    }
    courierRef.current.rider.yaw = h
    hiddenRef.current = false
    shotRef.current = null
    setPassenger(false)
  }, [])

  const busy = dialogue !== null || summary !== null || mapOpen
  const mode: ControlMode = passenger
    ? "passenger"
    : status.onFoot
      ? "walking"
      : "riding"

  if (!webgl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <p className="text-muted-foreground">{t.kampung.noWebgl}</p>
        <Button asChild variant="outline">
          <a href="/">{t.kampung.back}</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#F2D6B8]">
      <Canvas
        style={{ touchAction: "none" }}
        shadows
        dpr={[1, 2]}
        camera={{
          fov: 40,
          near: 0.1,
          far: 2400,
          position: [PLAYER_START[0] + 8, 12, PLAYER_START[2] + 13],
        }}
      >
        <color attach="background" args={["#F2D6B8"]} />
        <fog attach="fog" args={["#EBCBAA", 140, 820]} />
        <Sky
          sunPosition={SUN.toArray()}
          turbidity={7}
          rayleigh={1.6}
          mieCoefficient={0.006}
          mieDirectionalG={0.85}
        />
        <hemisphereLight args={["#BFD3E6", "#8C7A5A", 0.6]} />
        <Environment resolution={128} frames={1} environmentIntensity={0.6}>
          <Lightformer
            form="rect"
            intensity={2}
            color="#E6F0FF"
            position={[0, 14, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[50, 50, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.4}
            color="#FFD9B0"
            position={SUN.clone().multiplyScalar(20).toArray()}
            scale={[30, 8, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            color="#8FB8C4"
            position={[0, 2, 30]}
            scale={[60, 4, 1]}
          />
        </Environment>
        <Sun courierRef={courierRef} />
        <CameraStore bubblesRef={bubblesRef} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Interactions
              inputRef={inputRef}
              courierRef={courierRef}
              trafficRef={trafficRef}
              playerRef={playerRef}
              hiddenRef={hiddenRef}
              targetRef={targetRef}
              busy={busy}
              onPrompt={setPrompt}
              onTalk={openDialogue}
              onBoard={board}
              status={status}
            />
            <Town />
            <CourierRig
              tuning={KAMPUNG_TUNING}
              camera={KAMPUNG_CAMERA}
              inputRef={inputRef}
              courierRef={courierRef}
              paused={busy}
              onStatus={setStatus}
              walkStart={PLAYER_START}
              shotRef={shotRef}
              hiddenRef={hiddenRef}
              physicsRef={physicsRef}
              targetRef={targetRef}
              arrow={{ color: "#E8973A", size: 0.22, ride: 2.2, walk: 2.4 }}
              walkerName="pemain-jalan"
              occluded={cameraBlocked}
            />
            <Traffic
              playerRef={playerRef}
              trafficRef={trafficRef}
              bubblesRef={bubblesRef}
              shotRef={shotRef}
              onAlight={alight}
            />
          </Physics>
          <Townsfolk
            playerRef={playerRef}
            bubblesRef={bubblesRef}
            talkRef={talkRef}
            crowdRef={crowdRef}
          />
          <Shutters courierRef={courierRef} />
          <PlayerLook />
        </Suspense>
        <Effects high={!coarse} />
      </Canvas>
      <KampungHud
        data={data}
        mode={mode}
        prompt={prompt}
        dialogue={dialogue}
        summary={summary}
        coarse={coarse}
        inputRef={inputRef}
        bubblesRef={bubblesRef}
        talkRef={talkRef}
        crowdRef={crowdRef}
        onCloseDialogue={closeDialogue}
        onSummary={setSummary}
        onCloseSummary={() => setSummary(null)}
      />
      <div className="pointer-events-none absolute inset-0">
        <KampungMap
          open={mapOpen}
          onOpenChange={setMapOpen}
          courierRef={courierRef}
          trafficRef={trafficRef}
          onGuide={guide}
          compact={dialogue !== null}
        />
      </div>
    </div>
  )
}

// Ambient occlusion grounds the houses, AgX keeps the warm light from
// clipping; phones skip the occlusion.
function Effects({ high }: { high: boolean }) {
  if (!high) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.92} intensity={0.35} />
        <SMAA />
        <ToneMapping mode={ToneMappingMode.AGX} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={0}>
      <N8AO halfRes aoRadius={1.6} intensity={2.2} distanceFalloff={0.7} />
      <Bloom mipmapBlur luminanceThreshold={0.92} intensity={0.35} />
      <SMAA />
      <Vignette offset={0.35} darkness={0.4} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}

// a warm low sun whose shadow box follows the player
function Sun({ courierRef }: { courierRef: RefObject<Courier> }) {
  const lightRef = useRef<DirectionalLight>(null)
  useFrame(() => {
    const light = lightRef.current
    if (!light) return
    const focus = courierRef.current.focus
    light.position.copy(focus).addScaledVector(SUN, 90)
    light.target.position.copy(focus)
    light.target.updateMatrixWorld()
  })
  return (
    <directionalLight
      ref={lightRef}
      color="#FFD3A0"
      intensity={2.6}
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0005}
      shadow-normalBias={0.06}
      shadow-radius={3}
      shadow-camera-left={-44}
      shadow-camera-right={44}
      shadow-camera-top={44}
      shadow-camera-bottom={-44}
      shadow-camera-near={1}
      shadow-camera-far={220}
    />
  )
}

function CameraStore({ bubblesRef }: { bubblesRef: RefObject<BubbleStore> }) {
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    bubblesRef.current.camera = camera
  }, [camera, bubblesRef])
  return null
}

// on foot in the kampung the player leaves the helmet with the motorbike
function PlayerLook() {
  const scene = useThree((state) => state.scene)
  const kit = useKit()
  const doneRef = useRef(false)
  useFrame(() => {
    if (doneRef.current) return
    const walker = scene.getObjectByName("pemain-jalan")
    if (!walker) return
    doneRef.current = true
    hideNamed(walker, ["J_Helm", "J_Visor"])
    const figure = walker.children[0]?.children[0]
    if (figure) attachToNeck(figure, shadows(kit.take("rambut_pendek")))
  })
  return null
}

// the projects shop rolls its shutter up when someone comes close
function Shutters({ courierRef }: { courierRef: RefObject<Courier> }) {
  const scene = useThree((state) => state.scene)
  const shutterRef = useRef<{
    node: Object3D | null
    x: number
    z: number
    open: number
  }>({
    node: null,
    x: 0,
    z: 0,
    open: 0,
  })
  useFrame((_, dt) => {
    const shutter = shutterRef.current
    if (!shutter.node) {
      const shop = scene.getObjectByName("ruko-proyek")
      const node = shop?.getObjectByName("Rolling")
      if (!shop || !node) return
      shutter.node = node
      shutter.x = shop.position.x
      shutter.z = shop.position.z + 5
    }
    const focus = courierRef.current.focus
    const near =
      Math.hypot(focus.x - shutter.x, focus.z - shutter.z) < 8 ? 1 : 0
    shutter.open +=
      (near - shutter.open) * (1 - Math.exp(-2.5 * Math.min(dt, 0.05)))
    shutter.node.scale.y = 1 - shutter.open * 0.86
  })
  return null
}

interface InteractionsProps {
  inputRef: RefObject<DriveInput>
  courierRef: RefObject<Courier>
  trafficRef: RefObject<TrafficState>
  playerRef: RefObject<Vector3>
  hiddenRef: RefObject<boolean>
  targetRef: RefObject<[number, number] | null>
  busy: boolean
  status: CourierStatus
  onPrompt: (prompt: Prompt) => void
  onTalk: (place: PlaceId) => void
  onBoard: () => void
}

// Runs before the courier each physics step so E can mean "talk" or "get on
// the angkot" before it falls through to getting on or off the motorbike.
function Interactions({
  inputRef,
  courierRef,
  trafficRef,
  playerRef,
  hiddenRef,
  targetRef,
  busy,
  status,
  onPrompt,
  onTalk,
  onBoard,
}: InteractionsProps) {
  const lastRef = useRef("")
  useBeforePhysicsStep(() => {
    const input = inputRef.current
    const courier = courierRef.current
    const traffic = trafficRef.current
    const focus = courier.focus
    playerRef.current.copy(hiddenRef.current ? FAR : focus)
    // the guide arrow is done once you get there
    const target = targetRef.current
    if (target && Math.hypot(focus.x - target[0], focus.z - target[1]) < 3)
      targetRef.current = null

    let prompt: Prompt = null
    if (traffic.passenger !== null) {
      prompt = { kind: "alight" }
      if (input.interact) {
        traffic.alight = true
        input.interact = false
      }
    } else if (!busy && courier.mode === "walking") {
      const place = PLACES.find(
        (p) => Math.hypot(focus.x - p.spot[0], focus.z - p.spot[1]) < p.radius
      )
      const angkot = traffic.vehicles.find((v) => v.spec.kind === "angkot")
      const h = angkot?.at.heading ?? 0
      const door = angkot && {
        x: angkot.at.x - Math.sin(h) * 1.2,
        z: angkot.at.z - Math.cos(h) * 1.2,
      }
      const canBoard =
        angkot &&
        door &&
        angkot.speed < 0.3 &&
        Math.hypot(focus.x - door.x, focus.z - door.z) < 2.6
      if (place) {
        prompt = { kind: "talk", place: place.id, npc: place.npc }
        if (input.interact) {
          input.interact = false
          onTalk(place.id)
        }
      } else if (canBoard) {
        prompt = { kind: "board" }
        if (input.interact) {
          input.interact = false
          onBoard()
        }
      } else if (status.canMount) {
        prompt = { kind: "ride" }
      }
    } else if (!busy && status.canDismount) {
      prompt = { kind: "getOff" }
    }
    const key = prompt ? JSON.stringify(prompt) : ""
    if (key !== lastRef.current) {
      lastRef.current = key
      onPrompt(prompt)
    }
  })
  return null
}
