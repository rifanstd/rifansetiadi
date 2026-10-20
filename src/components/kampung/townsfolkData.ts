import type { RiderAction } from "@/components/courier/riderPose"
import { FIELD, PARKED_MOTORS, SIDEWALK } from "./layout"
import { PIER } from "./terrain"

// The people of the kampung and what they do all day. Every one of them is
// the same jointed rider model with different clothes and accessories.

export interface Look {
  jacket: string
  pants?: string
  hair?: "rambut_pendek" | "rambut_panjang"
  hat?: "peci" | "kerudung" | "topi"
  hatColor?: string
  helmet?: boolean
  scale?: number
}

export type Routine =
  | {
      kind: "stand"
      at: [number, number]
      yaw: number
      floor?: number
      action?: RiderAction
    }
  | { kind: "chat"; at: [number, number]; partner: string }
  | { kind: "walk"; path: [number, number][]; speed: number; pause: number }
  | { kind: "push"; path: [number, number][]; speed: number; pause: number }
  | { kind: "ride"; motor: number }
  | { kind: "play"; home: [number, number] }

export type Chatter = "bakso" | "ojek" | "greet"

export interface NpcDef {
  id: string
  look: Look
  routine: Routine
  chatter?: Chatter
}

const FACE_SOUTH = -Math.PI / 2
const FACE_NORTH = Math.PI / 2
const KERB = SIDEWALK.height

function walker(
  id: string,
  jacket: string,
  path: [number, number][],
  speed: number,
  extra: Partial<Look> = {}
): NpcDef {
  return {
    id,
    look: { jacket, ...extra },
    routine: { kind: "walk", path, speed, pause: 2 + (speed % 1) * 2 },
    chatter: "greet",
  }
}

export const TOWNSFOLK: NpcDef[] = [
  {
    id: "rekan",
    look: { jacket: "#2E6FA3", pants: "#3B3F4A", hair: "rambut_pendek" },
    routine: { kind: "stand", at: [-20.6, -7.1], yaw: FACE_SOUTH },
  },
  {
    id: "pemilik-toko",
    look: { jacket: "#F1ECE2", hat: "topi", hatColor: "#25262A" },
    routine: { kind: "stand", at: [-4, -8.7], yaw: FACE_SOUTH, floor: 0.2 },
  },
  {
    id: "ibu-warung",
    look: { jacket: "#F2D27A", hat: "kerudung", hatColor: "#E8973A" },
    routine: { kind: "stand", at: [30, -8.4], yaw: FACE_SOUTH, floor: 0.2 },
  },
  {
    id: "tetangga-a",
    look: { jacket: "#7C6FD0", hat: "kerudung", hatColor: "#C9A0B8" },
    routine: { kind: "chat", at: [25.4, -4.75], partner: "tetangga-b" },
  },
  {
    id: "tetangga-b",
    look: { jacket: "#3E9C8C", hat: "peci" },
    routine: { kind: "chat", at: [26.6, -4.7], partner: "tetangga-a" },
  },
  walker(
    "pejalan-1",
    "#C8452F",
    [
      [-70, -3.95],
      [50, -3.95],
    ],
    1.25,
    {
      hat: "topi",
      hatColor: "#2B2D33",
    }
  ),
  walker(
    "pejalan-2",
    "#C8452F",
    [
      [52, 3.95],
      [-36, 3.95],
    ],
    1.05,
    {
      hat: "kerudung",
      hatColor: "#5CC8B8",
    }
  ),
  walker(
    "pejalan-3",
    "#2F8A6E",
    [
      [30, -4.0],
      [-24, -4.0],
    ],
    1.4,
    {
      hair: "rambut_panjang",
    }
  ),
  walker(
    "pejalan-4",
    "#E2584A",
    [
      [-35.9, 8],
      [-35.9, 57],
    ],
    1.15,
    {
      hair: "rambut_pendek",
    }
  ),
  walker(
    "pejalan-5",
    "#4E9BD1",
    [
      [-30, 58.4],
      [16, 58.4],
    ],
    1.2,
    {
      hat: "peci",
    }
  ),
  walker(
    "pejalan-6",
    "#D9A441",
    [
      [-62, -58.4],
      [44, -58.4],
    ],
    1.3,
    {
      hat: "kerudung",
      hatColor: "#2F8A6E",
    }
  ),
  walker(
    "pejalan-7",
    "#9C5A8E",
    [
      [24.1, 8],
      [24.1, 56],
    ],
    1.1,
    {
      hair: "rambut_panjang",
    }
  ),
  walker(
    "pejalan-8",
    "#3E7C5A",
    [
      [-71.1, -8],
      [-71.1, -57],
    ],
    1.0,
    {
      hat: "peci",
    }
  ),
  // neighbours along the gangs
  walker(
    "pejalan-9",
    "#B5553A",
    [
      [-60, -30.9],
      [40, -30.9],
    ],
    0.95,
    {
      hat: "kerudung",
      hatColor: "#F2D27A",
    }
  ),
  walker(
    "pejalan-10",
    "#5C7FA8",
    [
      [-90, 31.6],
      [-46, 31.6],
    ],
    1.1,
    {
      hair: "rambut_pendek",
    }
  ),
  {
    id: "tukang-bakso",
    look: { jacket: "#F1ECE2", hat: "topi", hatColor: "#C8452F" },
    routine: {
      kind: "push",
      path: [
        [-10, 4.5],
        [40, 4.5],
      ],
      speed: 0.75,
      pause: 5,
    },
    chatter: "bakso",
  },
  ...PARKED_MOTORS.map((_, i) => ({
    id: `ojek-${i}`,
    look: { jacket: i ? "#4E9BD1" : "#2F8A6E", helmet: true },
    routine: { kind: "ride" as const, motor: i },
    chatter: "ojek" as const,
  })),
  {
    id: "pak-sapu",
    look: { jacket: "#F1ECE2", hat: "peci" },
    routine: {
      kind: "stand",
      at: [-36.6, 4.7],
      yaw: FACE_NORTH + 0.5,
      floor: KERB,
      action: "sweep",
    },
    chatter: "greet",
  },
  // fishermen on the jetty, looking out to sea
  ...[
    [PIER.x + 1.0, PIER.z0 + 19.5, 0.3],
    [PIER.x - 0.9, PIER.z1 - 2.5, -0.2],
  ].map(([x, z, turn], i) => ({
    id: `nelayan-${i}`,
    look: {
      jacket: i ? "#2E6FA3" : "#B5553A",
      hat: "topi" as const,
      hatColor: "#D9C38A",
    },
    routine: {
      kind: "stand" as const,
      at: [x, z] as [number, number],
      yaw: FACE_SOUTH + turn,
      floor: PIER.deck,
    },
    chatter: "greet" as const,
  })),
  ...[
    [FIELD.x - 3, FIELD.z - 2],
    [FIELD.x + 3, FIELD.z],
    [FIELD.x, FIELD.z + 2.5],
  ].map(([x, z], i) => ({
    id: `anak-${i}`,
    look: {
      jacket: ["#E2584A", "#F2D27A", "#5CC8B8"][i],
      hair: "rambut_pendek" as const,
      scale: 0.66,
    },
    routine: { kind: "play" as const, home: [x, z] as [number, number] },
  })),
]
