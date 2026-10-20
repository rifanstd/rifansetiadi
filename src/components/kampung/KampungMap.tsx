import { memo, useEffect, useRef, type RefObject } from "react"
import { Map as MapIcon, X } from "lucide-react"
import type { Courier } from "@/components/courier/physics"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/context"
import { cn } from "@/lib/utils"
import {
  FIELD,
  HALTE,
  HOUSES,
  PARKED_MOTORS,
  PLACES,
  SPECIAL,
  type PlaceId,
} from "./layout"
import { CARRIAGEWAYS, GANGWAYS, SIDEWALKS } from "./roads"
import { PIER, SAWAH, SHORE, WALK } from "./terrain"
import { VEHICLES, type Traffic } from "./trafficSim"

// A paper map of the kampung, drawn in world metres (x east, z south, so
// north is up). The corner minimap follows the player; M opens the whole
// map, where picking a place points the guide arrow at it.

const VIEW = {
  x0: WALK.x0 - 6,
  z0: WALK.z0 - 10,
  x1: WALK.x1 + 6,
  z1: PIER.z1 + 4,
}
const MINI = 70

type PoiKey = PlaceId | "halte" | "ojek" | "field" | "pier"

interface Poi {
  key: PoiKey
  at: [number, number]
  // where the label sits relative to the pin
  label: [number, number, "start" | "end"]
  // where the guide arrow points
  spot: [number, number]
  portfolio: boolean
}

const place = (id: PlaceId) => PLACES.find((p) => p.id === id)?.spot ?? [0, 0]

const POIS: Poi[] = [
  {
    key: "experience",
    at: [-20, -14],
    label: [-4.5, -3, "end"],
    spot: place("experience"),
    portfolio: true,
  },
  {
    key: "projects",
    at: [-4, -11],
    label: [0, -6, "start"],
    spot: place("projects"),
    portfolio: true,
  },
  {
    key: "contact",
    at: [30, -9.2],
    label: [4.5, 1.6, "start"],
    spot: place("contact"),
    portfolio: true,
  },
  {
    key: "halte",
    at: [HALTE[0], 4.3],
    label: [4, -1.2, "start"],
    spot: [HALTE[0], 4.3],
    portfolio: false,
  },
  {
    key: "ojek",
    at: [PARKED_MOTORS[0].x + 2, PARKED_MOTORS[0].z + 1],
    label: [4, 3.4, "start"],
    spot: [PARKED_MOTORS[0].x + 2, 5.6],
    portfolio: false,
  },
  {
    key: "field",
    at: [FIELD.x, FIELD.z],
    label: [4, 1.4, "start"],
    spot: [FIELD.x, FIELD.z - FIELD.halfZ],
    portfolio: false,
  },
  {
    key: "pier",
    at: [PIER.x, (PIER.z0 + PIER.z1) / 2],
    label: [4, 1.4, "start"],
    spot: [PIER.x, PIER.z0 + 2],
    portfolio: false,
  },
]

const FOOTPRINT: Record<string, [number, number]> = {
  kantor: [13, 10],
  ruko: [6, 10],
  warung: [5, 4],
}

const deg = (radians: number) => (radians * 180) / Math.PI

const MapBase = memo(function MapBase({ labels }: { labels: boolean }) {
  const { t } = useI18n()
  const areas = t.kampung.map.areas
  const label = "fill-[#4A3F33] font-serif italic"
  return (
    <g>
      <rect x={-400} y={-400} width={900} height={900} fill="#3E95A3" />
      {/* land, with the beach along the water */}
      <rect
        x={SHORE.west - 1.5}
        y={-400}
        width={600}
        height={400 + SHORE.south + 1.5}
        fill="#E6D3A6"
      />
      <rect
        x={SHORE.west + 3}
        y={-400}
        width={600}
        height={400 + SHORE.south - 3}
        fill="#C9CC93"
      />
      <rect
        x={-400}
        y={-400}
        width={900}
        height={400 + WALK.z0}
        fill="#7F9A5C"
      />
      <rect
        x={WALK.x1}
        y={-400}
        width={400}
        height={400 + SHORE.south - 11}
        fill="#7F9A5C"
      />
      <rect
        x={SAWAH.x0}
        y={SAWAH.z0}
        width={SAWAH.x1 - SAWAH.x0}
        height={SAWAH.z1 - SAWAH.z0}
        fill="#9DBB6A"
      />
      {CARRIAGEWAYS.map((r, i) => (
        <rect
          key={`r${i}`}
          x={r.x0}
          y={r.z0}
          width={r.x1 - r.x0}
          height={r.z1 - r.z0}
          fill="#6B655E"
        />
      ))}
      {GANGWAYS.map((r, i) => (
        <rect
          key={`g${i}`}
          x={r.x0}
          y={r.z0}
          width={r.x1 - r.x0}
          height={r.z1 - r.z0}
          fill="#CFC3AE"
        />
      ))}
      {SIDEWALKS.map((r, i) => (
        <rect
          key={`s${i}`}
          x={r.x0}
          y={r.z0}
          width={r.x1 - r.x0}
          height={r.z1 - r.z0}
          fill="#D8CFBF"
        />
      ))}
      <rect
        x={FIELD.x - FIELD.halfX}
        y={FIELD.z - FIELD.halfZ}
        width={FIELD.halfX * 2}
        height={FIELD.halfZ * 2}
        fill="#86AC5C"
        stroke="#F1ECE2"
        strokeWidth={0.4}
      />
      <rect
        x={PIER.x - PIER.half}
        y={PIER.z0 - 3.4}
        width={PIER.half * 2}
        height={PIER.z1 - PIER.z0 + 3.4}
        fill="#8A6A4A"
      />
      {HOUSES.map((h, i) => (
        <rect
          key={`h${i}`}
          x={-3.2}
          y={-3.6}
          width={6.4}
          height={7.2}
          fill={h.roof ?? "#B5553A"}
          opacity={0.85}
          transform={`translate(${h.x} ${h.z}) rotate(${-deg(h.yaw ?? 0)})`}
        />
      ))}
      {SPECIAL.map((s) => {
        const [w, d] = FOOTPRINT[s.asset] ?? [6, 6]
        return (
          <rect
            key={s.id}
            x={s.x - w / 2}
            y={s.z - d / 2}
            width={w}
            height={d}
            rx={0.6}
            fill="#E8973A"
          />
        )
      })}
      {labels && (
        <g fontSize={5.2}>
          <text x={-100} y={SHORE.south + 20} className={label}>
            {areas.sea}
          </text>
          <text x={10} y={SHORE.south + 3.6} fontSize={3.4} className={label}>
            {areas.beach}
          </text>
          <text x={SAWAH.x0 + 8} y={-30} className={label}>
            {areas.sawah}
          </text>
          <text x={-30} y={-64} className={label}>
            {areas.kebun}
          </text>
          <text x={-10} y={WALK.z0 - 4} className={label}>
            {areas.hills}
          </text>
        </g>
      )}
    </g>
  )
})

interface KampungMapProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courierRef: RefObject<Courier>
  trafficRef: RefObject<Traffic>
  // a place picked on the map: the guide arrow points there
  onGuide: (spot: [number, number]) => void
  // the corner map gives way to the dialogue
  compact: boolean
}

export function KampungMap({
  open,
  onOpenChange,
  courierRef,
  trafficRef,
  onGuide,
  compact,
}: KampungMapProps) {
  const { t } = useI18n()
  const m = t.kampung.map
  const miniRef = useRef<SVGSVGElement>(null)
  const playerRefs = useRef<(SVGGElement | null)[]>([])
  const vehicleRefs = useRef<(SVGCircleElement | null)[][]>([[], []])

  // the markers move every frame without re-rendering
  useEffect(() => {
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const courier = courierRef.current
      const traffic = trafficRef.current
      const riding = courier.mode === "riding" || courier.mode === "mounting"
      let x = courier.focus.x
      let z = courier.focus.z
      let heading = riding ? courier.scooter.heading : courier.rider.yaw
      if (traffic.passenger !== null) {
        const v = traffic.vehicles[traffic.passenger]
        x = v.at.x
        z = v.at.z
        heading = v.at.heading
      }
      const transform = `translate(${x.toFixed(2)} ${z.toFixed(2)}) rotate(${(-deg(heading)).toFixed(1)})`
      for (const g of playerRefs.current)
        g?.setAttribute("transform", transform)
      for (const list of vehicleRefs.current)
        traffic.vehicles.forEach((v, i) => {
          const dot = list[i]
          if (!dot) return
          dot.setAttribute("cx", v.at.x.toFixed(2))
          dot.setAttribute("cy", v.at.z.toFixed(2))
        })
      miniRef.current?.setAttribute(
        "viewBox",
        `${(x - MINI / 2).toFixed(2)} ${(z - MINI / 2).toFixed(2)} ${MINI} ${MINI}`
      )
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [courierRef, trafficRef])

  // M toggles the map, Escape closes it
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable=true]")) return
      if (event.code === "KeyM" && !event.repeat) onOpenChange(!open)
      else if (event.code === "Escape" && open) onOpenChange(false)
    }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [open, onOpenChange])

  const markers = (slot: number, scale: number) => (
    <>
      {VEHICLES.map((spec, i) => (
        <circle
          key={i}
          ref={(el) => {
            vehicleRefs.current[slot][i] = el
          }}
          r={(spec.kind === "motor" ? 0.9 : 1.4) * scale}
          fill={spec.kind === "angkot" ? "#2F8A6E" : "#2B2620"}
          stroke="#F4F1EA"
          strokeWidth={0.35 * scale}
        />
      ))}
      <g
        ref={(el) => {
          playerRefs.current[slot] = el
        }}
      >
        <circle r={3.2 * scale} fill="#E8973A" opacity={0.25} />
        <path
          d={`M ${2.6 * scale} 0 L ${-1.6 * scale} ${1.7 * scale} L ${-0.8 * scale} 0 L ${-1.6 * scale} ${-1.7 * scale} Z`}
          fill="#E8973A"
          stroke="#1A1714"
          strokeWidth={0.35 * scale}
        />
      </g>
    </>
  )

  return (
    <>
      {!compact && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="pointer-events-auto absolute top-4 right-4 size-40 overflow-hidden rounded-full border-4 border-[#F4F1EA]/85 bg-[#C9CC93] shadow-lg sm:size-44"
          aria-label={m.title}
        >
          <svg
            ref={miniRef}
            className="size-full"
            viewBox={`0 0 ${MINI} ${MINI}`}
          >
            <MapBase labels={false} />
            {POIS.filter((p) => p.portfolio).map((p) => (
              <circle
                key={p.key}
                cx={p.at[0]}
                cy={p.at[1]}
                r={2.2}
                fill="#1A1714"
                stroke="#F4F1EA"
                strokeWidth={0.6}
              />
            ))}
            {markers(0, 1)}
          </svg>
          <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-[#EFE8DD]">
            <MapIcon className="size-3" />M
          </span>
        </button>
      )}

      {open && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/45 p-3 sm:p-8"
          onClick={() => onOpenChange(false)}
        >
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-col gap-3 rounded-lg bg-[#F4ECDD] p-3 text-[#2B2620] shadow-2xl sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl">{m.title}</h2>
                <p className="text-sm text-[#6B5F50]">{m.hint}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label={m.close}
              >
                <X />
              </Button>
            </div>
            <svg
              className="min-h-0 w-full flex-1 rounded-md"
              viewBox={`${VIEW.x0} ${VIEW.z0} ${VIEW.x1 - VIEW.x0} ${VIEW.z1 - VIEW.z0}`}
            >
              <MapBase labels />
              {markers(1, 1.6)}
              {POIS.map((p) => (
                <g
                  key={p.key}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-[#1A1714]"
                  onClick={() => {
                    onGuide(p.spot)
                    onOpenChange(false)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return
                    event.preventDefault()
                    onGuide(p.spot)
                    onOpenChange(false)
                  }}
                >
                  <circle
                    cx={p.at[0]}
                    cy={p.at[1]}
                    r={p.portfolio ? 3.4 : 2.4}
                    fill={p.portfolio ? "#1A1714" : "#F4F1EA"}
                    stroke={p.portfolio ? "#E8973A" : "#4A3F33"}
                    strokeWidth={0.8}
                  />
                  <text
                    x={p.at[0] + p.label[0]}
                    y={p.at[1] + p.label[1]}
                    textAnchor={p.label[2]}
                    fontSize={p.portfolio ? 4.6 : 3.8}
                    className={cn(
                      "fill-[#1A1714] stroke-[#F4ECDD]",
                      p.portfolio && "font-semibold"
                    )}
                    strokeWidth={1.2}
                    style={{ paintOrder: "stroke" }}
                  >
                    {m.places[p.key]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </>
  )
}
