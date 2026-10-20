import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Object3D,
} from "three"
import {
  applyPose,
  createPose,
  findRig,
  ridingPose,
  SEAT_OFFSET,
  standingPose,
  type Pose,
  type RiderAction,
  type RiderRig,
} from "@/components/courier/riderPose"
import { say, type BubbleStore } from "./bubbles"
import { attachToNeck, hideNamed, shadows, tint, type Kit } from "./kit"
import { FIELD, PARKED_MOTORS } from "./layout"
import { pavementHeight } from "./roads"
import { TOWNSFOLK, type NpcDef } from "./townsfolkData"

export interface Person {
  def: NpcDef
  body: Group
  rig: RiderRig | null
  pose: Pose
  scale: number
  x: number
  z: number
  y: number
  yaw: number
  speed: number
  phase: number
  gait: number
  run: number
  seg: number
  dir: number
  wait: number
  action: RiderAction
  actionTime: number
  look: number
  cooldown: number
  cart?: Object3D
}

export interface Crowd {
  people: Person[]
  byId: Map<string, Person>
  ball: Mesh
  ballVelocity: Vector3
  chatClock: number
  objects: Object3D[]
}

export interface ChatterLines {
  greet: string[]
  bakso: string
  ojek: string
  excuse: string
  goal: string
}

export interface TalkState {
  npc: string | null
  speaking: boolean
  facing: Vector3
}

const HEAD = 1.95

export function buildCrowd(kit: Kit, rider: Object3D, motor: Object3D): Crowd {
  const people: Person[] = []
  const objects: Object3D[] = []
  for (const def of TOWNSFOLK) {
    const body = new Group()
    const figure = rider.clone(true)
    tint(figure, "Jaket", def.look.jacket)
    if (def.look.pants) tint(figure, "Celana", def.look.pants)
    if (!def.look.helmet) hideNamed(figure, ["J_Helm", "J_Visor"])
    if (def.look.hair && !def.look.hat)
      attachToNeck(figure, kit.take(def.look.hair))
    if (def.look.hat) {
      const hat = kit.take(def.look.hat)
      if (def.look.hatColor)
        tint(
          hat,
          def.look.hat === "kerudung" ? "Kerudung" : "Topi",
          def.look.hatColor
        )
      attachToNeck(figure, hat)
    }
    const scale = def.look.scale ?? 1
    figure.scale.setScalar(scale)
    body.add(figure)
    shadows(body)

    const person: Person = {
      def,
      body,
      rig: findRig(figure),
      pose: createPose(),
      scale,
      x: 0,
      z: 0,
      y: 0,
      yaw: 0,
      speed: 0,
      phase: Math.random() * 6,
      gait: 0,
      run: 0,
      seg: 1,
      dir: 1,
      wait: Math.random() * 2,
      action: "none",
      actionTime: Math.random() * 10,
      look: 0,
      cooldown: 2 + Math.random() * 4,
    }
    const r = def.routine
    if (r.kind === "stand" || r.kind === "chat") {
      ;[person.x, person.z] = r.at
      person.y = r.kind === "stand" ? (r.floor ?? 0) : pavementHeight(...r.at)
      person.yaw = r.kind === "stand" ? r.yaw : 0
      person.action = r.kind === "stand" ? (r.action ?? "none") : "none"
    } else if (r.kind === "walk" || r.kind === "push") {
      ;[person.x, person.z] = r.path[0]
      person.y = pavementHeight(...r.path[0])
      if (r.kind === "push") {
        person.action = "push"
        const cart = shadows(kit.take("gerobak"))
        person.cart = cart
        objects.push(cart)
      }
    } else if (r.kind === "ride") {
      const spot = PARKED_MOTORS[r.motor]
      const bike = shadows(motor.clone(true))
      bike.position.set(spot.x, 0, spot.z)
      bike.rotation.y = spot.heading
      objects.push(bike)
      person.x = spot.x + Math.cos(spot.heading) * SEAT_OFFSET.x
      person.z = spot.z - Math.sin(spot.heading) * SEAT_OFFSET.x
      person.y = SEAT_OFFSET.y
      person.yaw = spot.heading
    } else if (r.kind === "play") {
      ;[person.x, person.z] = r.home
      person.y = 0.02
    }
    if (def.id.startsWith("nelayan")) {
      const rod = new Mesh(
        new CylinderGeometry(0.012, 0.02, 2.6, 6),
        new MeshStandardMaterial({ color: "#3B2A1E", roughness: 0.6 })
      )
      rod.position.set(0.95, 1.55, -0.12)
      rod.rotation.z = -0.95
      rod.castShadow = true
      body.add(rod)
    }
    if (def.id === "pak-sapu") {
      const broom = new Mesh(
        new CylinderGeometry(0.018, 0.018, 1.25, 6),
        new MeshStandardMaterial({ color: "#8A5A36", roughness: 0.7 })
      )
      broom.position.set(0.5, 0.55, 0.05)
      broom.rotation.z = 0.75
      broom.castShadow = true
      body.add(broom)
    }
    people.push(person)
    objects.push(body)
  }
  const ball = new Mesh(
    new SphereGeometry(0.11, 16, 12),
    new MeshStandardMaterial({ color: "#F1ECE2", roughness: 0.5 })
  )
  ball.castShadow = true
  ball.position.set(FIELD.x, 0.11, FIELD.z)
  objects.push(ball)
  return {
    people,
    byId: new Map(people.map((p) => [p.def.id, p])),
    ball,
    ballVelocity: new Vector3(),
    chatClock: 0,
    objects,
  }
}

const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const anchor = new Vector3()

function headOf(p: Person, out: Vector3) {
  return out.set(p.x, p.y + HEAD * p.scale, p.z)
}

function face(p: Person, x: number, z: number, rate: number, dt: number) {
  const target = Math.atan2(-(z - p.z), x - p.x)
  p.yaw += wrap(target - p.yaw) * ease(rate, dt)
}

export function stepCrowd(
  crowd: Crowd,
  dt: number,
  time: number,
  player: { x: number; z: number },
  talk: TalkState,
  bubbles: BubbleStore,
  lines: ChatterLines
) {
  crowd.chatClock += dt
  stepBall(crowd, dt, bubbles, lines)
  for (const p of crowd.people) {
    const r = p.def.routine
    const toPlayer = Math.hypot(player.x - p.x, player.z - p.z)
    const inTalk = talk.npc === p.def.id
    p.cooldown -= dt
    p.actionTime += dt

    if (r.kind === "walk" || r.kind === "push") {
      let target = r.speed
      if (p.wait > 0) {
        p.wait -= dt
        target = 0
      } else {
        const [tx, tz] = r.path[p.seg]
        const dx = tx - p.x
        const dz = tz - p.z
        const d = Math.hypot(dx, dz)
        if (d < 0.15) {
          p.wait = r.pause
          if (r.kind === "push" && p.cooldown <= 0) {
            say(bubbles, p.def.id, lines.bakso, headOf(p, anchor), 3)
            p.cooldown = 8
          }
          p.seg += p.dir
          if (p.seg < 0 || p.seg >= r.path.length) {
            p.dir = -p.dir
            p.seg += 2 * p.dir
          }
        } else {
          face(p, tx, tz, 6, dt)
        }
        // stop for the player standing in the way
        const fx = Math.cos(p.yaw)
        const fz = -Math.sin(p.yaw)
        const ahead = (player.x - p.x) * fx + (player.z - p.z) * fz
        if (ahead > 0 && toPlayer < (r.kind === "push" ? 2.6 : 1.3)) {
          target = 0
          if (p.cooldown <= 0) {
            say(bubbles, p.def.id, lines.excuse, headOf(p, anchor), 2)
            p.cooldown = 7
          }
        }
      }
      p.speed += (target - p.speed) * ease(5, dt)
      p.x += Math.cos(p.yaw) * p.speed * dt
      p.z -= Math.sin(p.yaw) * p.speed * dt
      p.y += (pavementHeight(p.x, p.z) - p.y) * ease(12, dt)
      p.phase += ((p.speed * dt) / 1.25) * Math.PI * 2
      p.gait = Math.min(1, p.speed / 1.2)
      if (r.kind === "push" && p.cart) {
        const cx = p.x + Math.cos(p.yaw) * 1.55
        const cz = p.z - Math.sin(p.yaw) * 1.55
        p.cart.position.set(cx, pavementHeight(cx, cz), cz)
        p.cart.rotation.y = p.yaw
        for (const name of ["RodaKiri", "RodaKanan"]) {
          const wheel = p.cart.getObjectByName(name)
          if (wheel) wheel.rotation.z -= (p.speed * dt) / 0.32
        }
        if (p.speed > 0.3 && p.cooldown <= 0 && Math.random() < dt * 0.08) {
          say(bubbles, p.def.id, lines.bakso, headOf(p, anchor), 3)
          p.cooldown = 10
        }
      }
    } else if (r.kind === "chat") {
      const partner = crowd.byId.get(r.partner)
      if (partner) face(p, partner.x, partner.z, 4, dt)
      // take turns talking every few seconds
      const turn = Math.floor(crowd.chatClock / 3.6) % 2
      const speaking = (p.def.id < r.partner ? 0 : 1) === turn
      p.action = speaking ? "talk" : "none"
      if (speaking && Math.floor(crowd.chatClock * 10) % 36 === 1)
        say(bubbles, p.def.id, "…", headOf(p, anchor), 1.6)
    } else if (r.kind === "stand") {
      if (inTalk) {
        face(p, talk.facing.x, talk.facing.z, 5, dt)
        p.action = talk.speaking ? "talk" : "none"
      } else {
        p.yaw += wrap(r.yaw - p.yaw) * ease(2, dt)
        p.action = r.action ?? "none"
      }
    } else if (r.kind === "ride") {
      if (toPlayer < 4.5 && p.cooldown <= 0) {
        say(bubbles, p.def.id, lines.ojek, headOf(p, anchor), 2.6)
        p.cooldown = 16
      }
    } else if (r.kind === "play") {
      stepKid(crowd, p, r.home, dt)
    }

    // look at the player as they pass, sometimes greet them
    const near = toPlayer < 4.5 && r.kind !== "play"
    const bearing = wrap(Math.atan2(-(player.z - p.z), player.x - p.x) - p.yaw)
    const lookTarget = inTalk
      ? 0
      : near && Math.abs(bearing) < 2.2
        ? Math.max(-1, Math.min(1, bearing))
        : 0
    p.look += (lookTarget - p.look) * ease(4, dt)
    if (
      p.def.chatter === "greet" &&
      toPlayer < 2.8 &&
      p.cooldown <= 0 &&
      !inTalk
    ) {
      say(
        bubbles,
        p.def.id,
        lines.greet[Math.floor(Math.random() * lines.greet.length)],
        headOf(p, anchor),
        2.4
      )
      p.cooldown = 20
      if (p.action === "none" && r.kind !== "chat") {
        p.action = "wave"
        p.actionTime = 0
      }
    }
    if (p.action === "wave" && p.actionTime > 1.6)
      p.action = r.kind === "stand" ? (r.action ?? "none") : "none"

    const bubble = bubbles.bubbles.get(p.def.id)
    if (bubble) headOf(p, bubble.anchor)
    pose(p, time)
  }
}

function pose(p: Person, time: number) {
  p.body.position.set(p.x, p.y, p.z)
  p.body.rotation.y = p.yaw
  if (!p.rig) return
  if (p.def.routine.kind === "ride") {
    ridingPose(
      {
        steer: 0,
        lean: 0,
        speed: 0,
        footDown: 1,
        bump: 0,
        time: time + p.phase,
      },
      p.pose
    )
    applyPose(p.rig, p.pose, 0)
  } else {
    const drop = standingPose(
      {
        gait: p.gait,
        run: p.run,
        phase: p.phase,
        air: 0,
        vy: 0,
        landing: 0,
        action: p.action,
        actionTime: p.actionTime,
        wading: false,
        time: time + p.phase,
      },
      p.pose
    )
    applyPose(p.rig, p.pose, drop)
  }
  p.rig.joints.Neck.rotateY(p.look * 0.8)
}

// three kids pass a ball around; the one nearest chases it and kicks it on
function stepKid(crowd: Crowd, p: Person, home: [number, number], dt: number) {
  const ball = crowd.ball.position
  const kids = crowd.people.filter((k) => k.def.routine.kind === "play")
  const nearest = kids.reduce((a, b) =>
    Math.hypot(a.x - ball.x, a.z - ball.z) <
    Math.hypot(b.x - ball.x, b.z - ball.z)
      ? a
      : b
  )
  let tx = home[0]
  let tz = home[1]
  let target = 1.4
  if (nearest === p) {
    tx = ball.x
    tz = ball.z
    target = 3.4
  }
  const d = Math.hypot(tx - p.x, tz - p.z)
  if (d < 0.35) target = 0
  else face(p, tx, tz, 8, dt)
  p.speed += (target - p.speed) * ease(4, dt)
  p.x += Math.cos(p.yaw) * p.speed * dt
  p.z -= Math.sin(p.yaw) * p.speed * dt
  p.phase += ((p.speed * dt) / 1.0) * Math.PI * 2
  p.gait = Math.min(1, p.speed / 1.2)
  p.run += ((p.speed > 2.2 ? 1 : 0) - p.run) * ease(5, dt)
  if (
    nearest === p &&
    d < 0.45 &&
    crowd.ballVelocity.length() < 2.5 &&
    p.action !== "kick"
  ) {
    const others = kids.filter((k) => k !== p)
    const mate = others[Math.floor(Math.random() * others.length)]
    const aim = new Vector3(mate.x - ball.x, 0, mate.z - ball.z).normalize()
    crowd.ballVelocity.set(aim.x * 6, 2.4, aim.z * 6)
    p.action = "kick"
    p.actionTime = 0
  }
  if (p.action === "kick" && p.actionTime > 0.5) p.action = "none"
}

function stepBall(
  crowd: Crowd,
  dt: number,
  bubbles: BubbleStore,
  lines: ChatterLines
) {
  const ball = crowd.ball.position
  const v = crowd.ballVelocity
  v.y -= 9.8 * dt
  ball.addScaledVector(v, dt)
  if (ball.y < 0.13) {
    ball.y = 0.13
    v.y = Math.abs(v.y) > 1 ? -v.y * 0.45 : 0
    v.x *= Math.exp(-1.6 * dt)
    v.z *= Math.exp(-1.6 * dt)
  }
  crowd.ball.rotation.x += v.z * dt * 4
  crowd.ball.rotation.z -= v.x * dt * 4
  const { x, z, halfX, halfZ, goalZ } = FIELD
  if (Math.abs(ball.x - x) > halfX) {
    if (ball.z > goalZ[0] && ball.z < goalZ[1] && ball.y < 2) {
      say(bubbles, "anak-0", lines.goal, anchor.set(ball.x, 1.6, ball.z), 2)
      ball.set(x, 0.5, z)
      v.set(0, 0, 0)
    } else {
      ball.x = x + Math.sign(ball.x - x) * halfX
      v.x = -v.x * 0.6
    }
  }
  if (Math.abs(ball.z - z) > halfZ) {
    ball.z = z + Math.sign(ball.z - z) * halfZ
    v.z = -v.z * 0.6
  }
}
