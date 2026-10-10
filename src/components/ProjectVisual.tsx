import type { ReactNode } from "react"
import {
  Bike,
  BellRing,
  ChartColumn,
  GraduationCap,
  History,
  Landmark,
  MapPin,
  QrCode as QrCodeIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectVisualId } from "@/types/portfolio"

export type VisualSize = "lead" | "card" | "hero" | "feature"

export interface VisualPoint {
  label: string
  screen?: string
}

// Every illustration is drawn in em, so one font-size scales a composition.
const CONCEPT_SCALE: Record<VisualSize, string> = {
  lead: "text-[6px] sm:text-[9px] lg:text-[11.5px]",
  card: "text-[6px] sm:text-[8px] md:text-[5.5px] lg:text-[8px]",
  hero: "text-[7px] sm:text-[11px] lg:text-[15px]",
  feature: "text-[8px] sm:text-[9px]",
}

const SCALE: Record<ProjectVisualId, Record<VisualSize, string>> = {
  "wondr-merchant": CONCEPT_SCALE,
  "devkit-agent": {
    lead: "text-[7px] sm:text-[9px] lg:text-[11px]",
    card: "text-[6.5px] sm:text-[7px]",
    hero: "text-[7px] sm:text-[11px] lg:text-[14px]",
    feature: "text-[6px] sm:text-[6.5px]",
  },
  omaga: CONCEPT_SCALE,
}

// Concept icons keyed by the `screen` of a case-study feature.
const POINT_ICONS: Record<string, LucideIcon> = {
  register: QrCodeIcon,
  settlement: Landmark,
  notifications: BellRing,
  reports: ChartColumn,
  order: MapPin,
  rates: GraduationCap,
  history: History,
  driver: Bike,
}

interface ProjectVisualProps {
  visual: ProjectVisualId
  size: VisualSize
  screen?: string
  points?: VisualPoint[]
  label: string
  className?: string
}

export function ProjectVisual({
  visual,
  size,
  screen,
  points = [],
  label,
  className,
}: ProjectVisualProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden select-none",
        SCALE[visual][size],
        className
      )}
    >
      {visual === "devkit-agent" && <DevkitAgent screen={screen} />}
      {visual !== "devkit-agent" &&
        (screen ? (
          <FeatureIllustration screen={screen} />
        ) : (
          <Concept
            object={visual === "omaga" ? <CampusTile /> : <QrisStandee />}
            points={points}
          />
        ))}
    </div>
  )
}

/* ------------------------------------------------------------- concepts */

// These are explanatory illustrations, not app screens: one object that
// stands for the product plus its published features as callouts.

function Concept({
  object,
  points,
}: {
  object: ReactNode
  points: VisualPoint[]
}) {
  return (
    <div className="flex items-center gap-[2.5em]">
      {object}
      {points.length > 0 && (
        <ul className="relative flex flex-col gap-[1.4em] border-l border-dashed border-line pl-[2em]">
          {points.slice(0, 4).map((point) => {
            const Icon = (point.screen && POINT_ICONS[point.screen]) || null
            return (
              <li
                key={point.label}
                className="relative flex w-[19em] items-center gap-[1em]"
              >
                <span className="absolute top-1/2 -left-[2em] h-px w-[1.4em] bg-line" />
                <span className="flex size-[3.4em] shrink-0 items-center justify-center border border-line bg-card text-brand">
                  {Icon && <Icon className="size-[1.7em]" strokeWidth={1.75} />}
                </span>
                <span className="text-[1.3em] leading-snug font-medium text-foreground">
                  {point.label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FeatureIllustration({ screen }: { screen: string }) {
  const Icon = POINT_ICONS[screen]

  return (
    <div className="relative flex size-full items-center justify-center bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:1.6em_1.6em]">
      <span className="absolute size-[17em] border border-dashed border-line" />
      <span className="absolute size-[12.5em] border border-line bg-muted" />
      <span className="relative flex size-[8em] items-center justify-center border border-primary bg-card text-brand">
        {Icon && <Icon className="size-[4em]" strokeWidth={1.5} />}
      </span>
    </div>
  )
}

function QrisStandee() {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="flex w-[15em] flex-col overflow-hidden rounded-[1.2em] border border-line bg-card shadow-[0_1.5em_3em_-1.5em_rgb(0_0_0/0.35)]">
        <div className="bg-primary py-[0.8em] text-center font-mono text-[1.3em] font-bold tracking-[0.3em] text-primary-foreground">
          QRIS
        </div>
        <div className="flex flex-col items-center gap-[1em] p-[1.4em]">
          <div className="w-full bg-white p-[0.8em] text-[#1C1A17]">
            <QrPattern className="aspect-square w-full" />
          </div>
          <span className="h-[0.6em] w-3/4 bg-muted-foreground/25" />
          <span className="h-[0.6em] w-1/2 bg-muted-foreground/15" />
        </div>
      </div>
      <span className="h-[2.4em] w-[2.4em] bg-line [clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)]" />
    </div>
  )
}

function CampusTile() {
  return (
    <div className="w-[20em] shrink-0 overflow-hidden rounded-[1.2em] border border-line bg-card shadow-[0_1.5em_3em_-1.5em_rgb(0_0_0/0.35)]">
      <CampusMap className="block aspect-[4/5] w-full" />
    </div>
  )
}

// A fixed, decorative QR-like pattern: finder squares in three corners and
// seeded noise elsewhere. It does not encode anything.
const QR_SIZE = 25
const QR_PATH = (() => {
  let seed = 7
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) ||
    (x >= QR_SIZE - 8 && y < 8) ||
    (x < 8 && y >= QR_SIZE - 8)
  let path = ""
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      const filled = !inFinder(x, y) && random() > 0.52
      if (filled) path += `M${x} ${y}h1v1h-1z`
    }
  }
  return path
})()

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0h7v7h-7zM1 1v5h5v-5z" fillRule="evenodd" />
      <rect x="2" y="2" width="3" height="3" />
    </g>
  )
}

function QrPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`}
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={QR_PATH} />
      <Finder x={0} y={0} />
      <Finder x={QR_SIZE - 7} y={0} />
      <Finder x={0} y={QR_SIZE - 7} />
    </svg>
  )
}

/* --------------------------------------------------------- devkit agent */

const AGENTS = [
  {
    name: "orchestrator",
    role: "routes the work",
    skill: "subagent-driven-development",
  },
  { name: "analyst", role: "requirements", skill: "brainstorming" },
  { name: "planner", role: "implementation plan", skill: "writing-plans" },
  {
    name: "programmer",
    role: "writes the code",
    skill: "systematic-debugging",
  },
  {
    name: "reviewer",
    role: "review & testing",
    skill: "requesting-code-review",
  },
]

function DevkitAgent({ screen }: { screen?: string }) {
  if (screen === "install") {
    return (
      <Terminal title="~/my-app — install">
        <Prompt>npx devkit-agent</Prompt>
        <Comment>interactive install (recommended)</Comment>
        <Gap />
        <Prompt>npx devkit-agent -g</Prompt>
        <Comment>install to ~/.config/opencode/</Comment>
        <Gap />
        <Prompt>npx devkit-agent -g -y</Prompt>
        <Comment>all agents, no prompts</Comment>
        <Gap />
        <Prompt>npx devkit-agent -u</Prompt>
        <Comment>uninstall agents and skills</Comment>
      </Terminal>
    )
  }

  if (screen === "agents") {
    return (
      <Terminal title="agents">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="flex flex-col py-[0.35em]">
            <span>
              <span className="text-[#E8B84B]">◆</span> {agent.name}
              <span className="text-[#A39E94]"> — {agent.role}</span>
            </span>
            <span className="pl-[1.3em] text-[#A39E94]">
              skill: {agent.skill}
            </span>
          </div>
        ))}
      </Terminal>
    )
  }

  if (screen === "checkpoints") {
    return (
      <Terminal title="pipeline">
        <Comment>request</Comment>
        <Line>
          orchestrator <Muted>assesses complexity</Muted>
        </Line>
        <Line>
          {"  ↓ "}analyst <Muted>requirements</Muted>
        </Line>
        <Line accent>{"    ◆ waiting for your approval"}</Line>
        <Line>
          {"  ↓ "}planner <Muted>plan</Muted>
        </Line>
        <Line accent>{"    ◆ waiting for your approval"}</Line>
        <Line>{"  ↓ "}programmer ⇄ reviewer</Line>
        <Line>
          <Muted>{"    until review passes"}</Muted>
        </Line>
        <Gap />
        <Line>
          <Muted>saved → .knowledge/sessions/&lt;id&gt;/</Muted>
        </Line>
      </Terminal>
    )
  }

  return (
    <Terminal title="~/my-app" className="w-[38em]">
      <Prompt>npx devkit-agent</Prompt>
      <Comment>installs agents + skills for OpenCode</Comment>
      <Gap />
      <Line>orchestrator</Line>
      <Line>
        {" ├─ analyst      "}
        <Accent>◆ approval</Accent>
      </Line>
      <Line>
        {" ├─ planner      "}
        <Accent>◆ approval</Accent>
      </Line>
      <Line>{" └─ programmer ⇄ reviewer"}</Line>
      <Gap />
      <Line>
        <Muted>→ .knowledge/sessions/&lt;id&gt;/</Muted>
      </Line>
      <Line>
        <Muted>~/my-app $ </Muted>
        <span className="animate-caret text-[#E8B84B]">▍</span>
      </Line>
    </Terminal>
  )
}

function Terminal({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-[34em] max-w-[92%] flex-col overflow-hidden border border-line bg-[#0E0E0C] font-mono text-[#EDE9E1] shadow-[0_2em_4em_-2em_rgb(0_0_0/0.45)]",
        className
      )}
    >
      <div className="flex items-center gap-[0.5em] border-b border-[#2A2925] bg-[#141412] px-[1em] py-[0.7em]">
        <span className="size-[0.7em] rounded-full bg-[#3A3832]" />
        <span className="size-[0.7em] rounded-full bg-[#3A3832]" />
        <span className="size-[0.7em] rounded-full bg-[#3A3832]" />
        <span className="ml-[0.6em] text-[0.9em] text-[#A39E94]">{title}</span>
      </div>
      <div className="flex flex-col px-[1.4em] py-[1.2em] text-[1.15em] leading-[1.7] whitespace-pre">
        {children}
      </div>
    </div>
  )
}

function Line({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={accent ? "text-[#E8B84B]" : undefined}>{children}</span>
  )
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <span>
      <span className="text-[#E8B84B]">$ </span>
      {children}
    </span>
  )
}

function Comment({ children }: { children: ReactNode }) {
  return <span className="text-[#7A746A]"># {children}</span>
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-[#A39E94]">{children}</span>
}

function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[#E8B84B]">{children}</span>
}

function Gap() {
  return <span className="h-[0.6em]" />
}

/* ---------------------------------------------------------------- omaga */

function CampusMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      className={cn("text-muted-foreground", className)}
      aria-hidden="true"
    >
      <rect width="200" height="160" className="fill-muted" />
      <g className="fill-foreground" opacity="0.08">
        <rect x="12" y="10" width="46" height="30" />
        <rect x="70" y="10" width="58" height="30" />
        <rect x="140" y="10" width="50" height="52" />
        <rect x="12" y="52" width="46" height="44" />
        <rect x="70" y="52" width="58" height="44" />
        <rect x="12" y="108" width="80" height="44" />
        <rect x="104" y="108" width="86" height="44" />
        <rect x="140" y="74" width="50" height="22" />
      </g>
      <path
        d="M34 128 V102 H64 V46 H134 V68 H164"
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <circle cx="34" cy="128" r="6" className="fill-foreground" />
      <circle cx="34" cy="128" r="2.5" className="fill-background" />
      <circle cx="164" cy="68" r="6" className="fill-primary" />
      <circle cx="164" cy="68" r="2.5" className="fill-[#0E0E0C]" />
    </svg>
  )
}
