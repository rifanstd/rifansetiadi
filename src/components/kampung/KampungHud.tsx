import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react"
import {
  ArrowBigUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  Hand,
} from "lucide-react"
import { Vector3 } from "three"
import { Button } from "@/components/ui/button"
import type { DriveInput, DriveKey } from "@/components/courier/input"
import { useI18n } from "@/i18n/context"
import { caseStudyPath } from "@/lib/router"
import type { PortfolioData } from "@/types/portfolio"
import { useBubbleLayer, type BubbleStore } from "./bubbles"
import { buildScript, type DialogueChoice } from "./dialogues"
import type { PlaceId } from "./layout"
import type { Crowd, TalkState } from "./townsfolkSim"

export type Prompt =
  | { kind: "talk"; place: PlaceId; npc: string }
  | { kind: "board" }
  | { kind: "alight" }
  | { kind: "ride" }
  | { kind: "getOff" }
  | null

export type ControlMode = "walking" | "riding" | "passenger"

const NPC_NAMES: Record<string, "rekan" | "pemilikToko" | "ibuWarung"> = {
  rekan: "rekan",
  "pemilik-toko": "pemilikToko",
  "ibu-warung": "ibuWarung",
}

interface KampungHudProps {
  data: PortfolioData
  mode: ControlMode
  prompt: Prompt
  dialogue: { place: PlaceId; npc: string } | null
  summary: PlaceId | null
  coarse: boolean
  inputRef: RefObject<DriveInput>
  bubblesRef: RefObject<BubbleStore>
  talkRef: RefObject<TalkState>
  crowdRef: RefObject<Crowd | null>
  onCloseDialogue: (guide?: PlaceId) => void
  onSummary: (place: PlaceId) => void
  onCloseSummary: () => void
}

export function KampungHud(props: KampungHudProps) {
  const { t } = useI18n()
  const layerRef = useRef<HTMLDivElement>(null)
  useBubbleLayer(layerRef, props.bubblesRef)
  const k = t.kampung

  const promptText = (() => {
    const p = props.prompt
    if (!p || props.dialogue) return null
    if (p.kind === "talk")
      return k.prompts.talk.replace("{name}", k.people[NPC_NAMES[p.npc]])
    if (p.kind === "board") return k.prompts.board
    if (p.kind === "alight") return k.prompts.alight
    if (p.kind === "ride") return k.prompts.ride
    return k.prompts.getOff
  })()

  return (
    <div className="pointer-events-none absolute inset-0 text-[#EFE8DD]">
      <div ref={layerRef} className="absolute inset-0 overflow-hidden" />

      <div className="pointer-events-auto absolute top-4 left-4">
        <Button asChild variant="secondary" size="sm">
          <a href="/">
            <ChevronLeft />
            {k.back}
          </a>
        </Button>
      </div>

      {!props.coarse && !props.dialogue && <Legend mode={props.mode} />}

      {promptText && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-3 py-1.5 text-sm">
          {!props.coarse && (
            <span className="mr-2 font-mono text-[#CFC6B8]">E</span>
          )}
          {promptText}
        </p>
      )}

      {props.coarse && !props.dialogue && (
        <TouchPad inputRef={props.inputRef} mode={props.mode} />
      )}

      {props.dialogue && (
        <DialogueBox
          key={props.dialogue.place}
          data={props.data}
          place={props.dialogue.place}
          npc={props.dialogue.npc}
          bubblesRef={props.bubblesRef}
          talkRef={props.talkRef}
          crowdRef={props.crowdRef}
          onClose={props.onCloseDialogue}
          onSummary={props.onSummary}
        />
      )}

      {props.summary && (
        <SummaryPanel
          data={props.data}
          place={props.summary}
          onClose={props.onCloseSummary}
        />
      )}
    </div>
  )
}

function Legend({ mode }: { mode: ControlMode }) {
  const { t } = useI18n()
  const c = t.kampung.controls
  const rows: [string, string][] =
    mode === "passenger"
      ? [["E", t.kampung.prompts.alight]]
      : mode === "riding"
        ? [
            ["W A S D", c.drive],
            ["Space", c.drift],
            ["E", t.kampung.prompts.getOff],
            ["R", c.reset],
            ["M", c.map],
            [c.mouse, c.look],
          ]
        : [
            ["W A S D", c.walk],
            ["Shift", c.run],
            ["Space", c.jump],
            ["E", c.interact],
            ["F", c.kick],
            ["Q", c.wave],
            ["R", c.reset],
            ["M", c.map],
            [c.mouse, c.look],
          ]
  return (
    <dl className="absolute bottom-4 left-4 grid grid-cols-[auto_auto] gap-x-3 gap-y-1 rounded-md bg-black/45 px-3 py-2 text-xs">
      {rows.map(([key, label]) => (
        <div key={key} className="contents">
          <dt className="font-mono text-[#CFC6B8]">{key}</dt>
          <dd>{label}</dd>
        </div>
      ))}
    </dl>
  )
}

const head = new Vector3()

function DialogueBox({
  data,
  place,
  npc,
  bubblesRef,
  talkRef,
  crowdRef,
  onClose,
  onSummary,
}: {
  data: PortfolioData
  place: PlaceId
  npc: string
  bubblesRef: RefObject<BubbleStore>
  talkRef: RefObject<TalkState>
  crowdRef: RefObject<Crowd | null>
  onClose: (guide?: PlaceId) => void
  onSummary: (place: PlaceId) => void
}) {
  const { t } = useI18n()
  const k = t.kampung
  const script = useMemo(
    () => buildScript(place, data, k.dialogue),
    [place, data, k.dialogue]
  )
  const [nodeId, setNodeId] = useState("start")
  const [line, setLine] = useState(0)
  const [shown, setShown] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const node = script[nodeId] ?? script.start
  const text = node.lines[line] ?? ""
  const typing = shown < text.length
  const lastLine = line >= node.lines.length - 1

  // typewriter
  useEffect(() => {
    if (!typing) return
    const timer = window.setInterval(() => setShown((n) => n + 2), 28)
    return () => window.clearInterval(timer)
  }, [typing, nodeId, line])

  useEffect(() => {
    talkRef.current.speaking = typing
  }, [typing, talkRef])

  // keep the box beside the speaker's head
  useEffect(() => {
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const box = boxRef.current
      const camera = bubblesRef.current.camera
      const person = crowdRef.current?.byId.get(npc)
      if (!box || !camera || !person) return
      head.set(person.x, person.y + 2.05, person.z).project(camera)
      const parent = box.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      const x = ((head.x + 1) / 2) * w
      const y = ((1 - head.y) / 2) * h
      const left = Math.min(Math.max(16, x + 24), w - box.offsetWidth - 16)
      const top = Math.min(
        Math.max(72, y - box.offsetHeight * 0.35),
        h - box.offsetHeight - 16
      )
      box.style.transform = `translate(${left}px, ${top}px)`
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [bubblesRef, crowdRef, npc])

  const advance = () => {
    if (typing) setShown(text.length)
    else if (!lastLine) {
      setLine(line + 1)
      setShown(0)
    }
  }

  const choose = (choice: DialogueChoice) => {
    if (choice.href) return
    if (choice.next) {
      setNodeId(choice.next)
      setLine(0)
      setShown(0)
    } else onClose(choice.guide)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Escape") onClose()
      else if (event.code === "Enter" || event.code === "Space") advance()
      else if (!typing && lastLine && /^Digit[1-9]$/.test(event.code)) {
        const choice = node.choices[Number(event.code.slice(5)) - 1]
        if (choice && !choice.href) choose(choice)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const name = k.people[NPC_NAMES[npc]]
  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-label={name}
      className="pointer-events-auto absolute top-0 left-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    >
      <div className="text-xs font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
        {name}
      </div>
      <button
        type="button"
        onClick={advance}
        className="rounded-2xl bg-[#FFFDF8] px-4 py-3 text-left text-[15px] leading-relaxed text-[#1A1714] shadow-lg"
      >
        {text.slice(0, shown)}
        {typing && <span className="opacity-0">{text.slice(shown)}</span>}
        {!typing && !lastLine && (
          <span className="mt-1 block text-xs text-[#6A6056]">
            {k.dialogue.continue} ↵
          </span>
        )}
      </button>
      {!typing && lastLine && (
        <div className="flex flex-wrap gap-2">
          {node.choices.map((choice, i) =>
            choice.href ? (
              <a
                key={i}
                href={choice.href}
                target={choice.href.startsWith("#") ? undefined : "_blank"}
                rel="noreferrer"
                download={choice.download || undefined}
                className="rounded-lg border border-[#1A1714]/10 bg-[#E8973A] px-3 py-2 text-sm font-medium text-[#1A1714]"
              >
                {choice.label}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => choose(choice)}
                className="rounded-lg border border-[#1A1714]/10 bg-[#FFFDF8] px-3 py-2 text-sm text-[#1A1714] hover:bg-[#F2EBDD]"
              >
                <span className="mr-1.5 font-mono text-xs text-[#6A6056]">
                  {i + 1}
                </span>
                {choice.label}
              </button>
            )
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSummary(place)}
          className="rounded-lg bg-black/65 px-3 py-1.5 text-xs text-[#EFE8DD]"
        >
          {k.dialogue.summary}
        </button>
        <button
          type="button"
          onClick={() => onClose()}
          className="rounded-lg bg-black/65 px-3 py-1.5 text-xs text-[#EFE8DD]"
        >
          {k.dialogue.close}
        </button>
      </div>
    </div>
  )
}

function SummaryPanel({
  data,
  place,
  onClose,
}: {
  data: PortfolioData
  place: PlaceId
  onClose: () => void
}) {
  const { t } = useI18n()
  const k = t.kampung
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-label={k.summary[place]}
        className="flex max-h-[85vh] w-[min(40rem,100%)] flex-col gap-4 overflow-y-auto rounded-xl bg-[#F2EEE6] p-6 text-[#1A1714] shadow-xl"
      >
        <h2 className="font-heading text-2xl font-semibold">
          {k.summary[place]}
        </h2>
        {place === "experience" && (
          <ul className="flex flex-col gap-4">
            {data.experience.experiences.map((job) => (
              <li key={job.company + job.period}>
                <p className="font-semibold">{job.role}</p>
                <p className="text-sm text-[#5A5048]">
                  {job.company} ·{" "}
                  <span className="font-mono text-xs">{job.period}</span>
                </p>
                <p className="mt-1 text-sm">{job.summary}</p>
              </li>
            ))}
          </ul>
        )}
        {place === "projects" && (
          <ul className="flex flex-col gap-4">
            {data.projects.projects.map((project) => (
              <li key={project.slug}>
                <p className="font-semibold">{project.title}</p>
                <p className="text-sm">
                  {project.summary ?? project.description}
                </p>
                {project.caseStudy && (
                  <a
                    href={caseStudyPath(project.slug)}
                    className="text-sm underline"
                  >
                    {k.dialogue.caseStudy}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {place === "contact" && (
          <ul className="flex flex-col gap-2">
            <li>
              <a className="underline" href={`mailto:${data.personal.email}`}>
                {data.personal.email}
              </a>
            </li>
            <li>
              <a
                className="underline"
                href={data.personal.social.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                className="underline"
                href={data.personal.social.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a className="underline" href={data.personal.cvUrl} download>
                {k.dialogue.cv}
              </a>
            </li>
          </ul>
        )}
        <Button onClick={onClose} className="self-start">
          {k.dialogue.close}
        </Button>
      </section>
    </div>
  )
}

const PAD: { key: DriveKey; icon: typeof ArrowUp; area: string }[] = [
  { key: "forward", icon: ArrowUp, area: "col-start-2 row-start-1" },
  { key: "left", icon: ArrowLeft, area: "col-start-1 row-start-2" },
  { key: "back", icon: ArrowDown, area: "col-start-2 row-start-2" },
  { key: "right", icon: ArrowRight, area: "col-start-3 row-start-2" },
]

function TouchPad({
  inputRef,
  mode,
}: {
  inputRef: RefObject<DriveInput>
  mode: ControlMode
}) {
  const { t } = useI18n()
  const labels: Record<string, string> = {
    forward: t.kampung.pad.forward,
    back: t.kampung.pad.back,
    left: t.kampung.pad.left,
    right: t.kampung.pad.right,
  }
  const press = (event: PointerEvent<HTMLButtonElement>) => {
    const key = event.currentTarget.dataset.key as DriveKey
    inputRef.current[key] = true
    if (key === "jump") inputRef.current.drift = true
  }
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const key = event.currentTarget.dataset.key as DriveKey
    inputRef.current[key] = false
    if (key === "jump") inputRef.current.drift = false
  }
  const button =
    "pointer-events-auto flex touch-none items-center justify-center rounded-full bg-black/50 text-[#EFE8DD] active:bg-[#E8973A] active:text-[#1A1714]"
  return (
    <>
      <div className="pointer-events-auto absolute bottom-6 left-4 grid grid-cols-3 grid-rows-2 gap-2">
        {PAD.map(({ key, icon: Icon, area }) => (
          <button
            key={key}
            type="button"
            aria-label={labels[key]}
            className={`${area} flex size-14 touch-none items-center justify-center rounded-lg bg-black/50 text-[#EFE8DD] active:bg-[#E8973A] active:text-[#1A1714]`}
            data-key={key}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={release}
          >
            <Icon />
          </button>
        ))}
      </div>
      <div className="absolute right-4 bottom-6 flex flex-col items-end gap-3">
        <button
          type="button"
          aria-label={t.kampung.controls.interact}
          className={`${button} size-12`}
          data-key="interact"
          onPointerDown={press}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
        >
          <Hand />
        </button>
        {mode === "walking" && (
          <button
            type="button"
            aria-label={t.kampung.pad.jump}
            className={`${button} size-16`}
            data-key="jump"
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={release}
          >
            <ArrowBigUp />
          </button>
        )}
      </div>
    </>
  )
}
