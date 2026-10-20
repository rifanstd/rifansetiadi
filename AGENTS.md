# Repository Guidelines

## Project Overview

This repository contains a bilingual personal portfolio SPA for Rifan Setiadi. It is a React 19 + TypeScript application built with Vite. The UI is data-driven: portfolio content is stored in localized JSON files under `public/data/`, while reusable React sections render the loaded data. There is no backend, router library, SSR, or server-side data layer; pages are plain paths handled by the small router in `src/lib/router.ts`: `/` is the portfolio, `/work/<slug>` a case study and `/3d` the 3D kampung.

## Architecture & Data Flow

- `src/main.tsx` is the browser entry point. It imports global CSS, wraps the app in React `StrictMode` and `ThemeProvider`, and mounts `App` into `#root`.
- `src/App.tsx` provides `I18nProvider` and owns aggregate portfolio data plus loading and error states.
- On locale changes, `AppContent` fetches these five resources in parallel with `Promise.all`:
  - `/data/personal.json` or `/data/id/personal.json`
  - `/data/stats.json` or `/data/id/stats.json`
  - `/data/experience.json` or `/data/id/experience.json`
  - `/data/projects.json` or `/data/id/projects.json`
  - `/data/skills.json` or `/data/id/skills.json`
- Responses are checked for HTTP success and parsed into the `PortfolioData` shape from `src/types/portfolio.ts`. The interfaces provide compile-time contracts; JSON remains runtime input and is not schema-validated.
- Successful data renders the fixed page flow: `Navbar`, `Hero`, `Stats` (proof strip), `Projects` (selected work + filterable index), `Experience`, `About` (includes `Skills`), `Contact`, and `Footer`.
- `src/lib/router.ts` reads `location.pathname` through `usePathname` (history `popstate` plus its own change event). Links stay plain `<a href="/...">`; `App.tsx` installs one document click listener (`interceptLinks`) that turns same-site route links into `history.pushState` without a reload, leaving files such as the CV and in-page anchors (`#work`, `/#contact`) to the browser. Old hash links (`#/work/<slug>`, `#/3d`, `#/kampung`, `#/meja`) are rewritten to their paths on load. `vercel.json` rewrites every path to `index.html`, and Vite's dev and preview servers fall back the same way.
- `/work/<slug>` renders `CaseStudy` for the project with that `slug` and a `caseStudy` object instead of the home sections. After each route change `App.tsx` scrolls to the section named by the URL hash, or to the top.
- `/3d` lazy-loads `src/components/kampung/KampungWorld.tsx` (three.js lives only in that chunk), a living coastal kampung: townsfolk with routines, angkot/car/motor traffic, a borrowable motorbike, and portfolio places where a townsperson tells the content in speech bubbles (office → experience, shop → projects, warung → contact). It stays mounted through locale reloads so visitors keep their place.
- `I18nProvider` manages `en | id`, persists the selection in `localStorage` under `locale`, updates the document language, and supplies static UI translations from `src/i18n/translations/`.
- `ThemeProvider` manages `dark | light | system`, persists under `theme`, reacts to OS/storage changes, and supports the `d` keyboard shortcut outside editable elements.
- Components use typed props and local state for section-specific interaction. There is no global state library.

## Key Directories

- `src/components/` — portfolio sections and shared presentation components (`Navbar`, `Hero`, `About`, `Experience`, `Stats`, `Projects`, `Skills`, `Contact`, `Footer`, `CaseStudy`, `FadeIn`). `ProjectVisual` draws code-based concept illustrations (an object plus the published features, or a terminal for CLI tools) in `em` units so one font-size scales a composition; they deliberately do not imitate real app screens; a project's `image` field overrides it with a real screenshot.
- `src/components/courier/` — the player rig the kampung drives. `physics.ts` steps the rider on foot and the scooter as kinematic bodies through Rapier's character controller (autostep, slopes, snap to ground, pushing props) with our own velocities: bicycle-style steering around the rear axle (a turn is skipped if the rotated capsule would hit something), grip/drift, wall impacts, tipping over edges, and on foot walk/run, coyote-time jump, ledge mantle, kick and wave, plus the `E` get-on/get-off hop. Every number lives in a `CourierTuning` (the kampung's metre values are in `kampung/tuning.ts`); surfaces come in through `gripAt`/`wadingAt`. `CourierRig.tsx` renders `ojek.glb` and the jointed `rider.glb` (two clones: seated and on foot), runs the follow camera, and accepts a camera shot (`shotRef`), a hidden flag and a physics handle so worlds can stage conversations or put the player in a vehicle; with `camera.orbit` the camera follows a mouse drag and wheel zoom, and an `occluded` test lifts it over buildings. `riderPose.ts` poses the `Rig_*` pivots procedurally (rest pose standing; `RIDE_POSE` solved in Blender against the seated rider; looping talk/push/sweep gestures for townsfolk). `input.ts` holds held keys and one-shot presses that the step clears.
- `src/components/kampung/` — the `/3d` world (metres; x east along the main road, z south towards the sea). `roads.ts` defines the street network (axis-aligned roads plus `gang` alleys without pavements), cuts the pavements at crossings, and gives every pavement slab a chamfered edge (`slabPoints`, shared by the mesh and its `ConvexHullCollider`) so wheels and feet roll up the kerb; `pavementHeight` is the street surface height. `terrain.ts` holds the land outside the streets with one height function used by the terrain mesh, the sea shader and the beach colliders (shore, walkable bounds `WALK`, `SAWAH`, `PIER`). `layout.ts` places everything else: the hand-placed `SPECIAL` buildings, seeded house frontages along every road and gang (`HOUSES`), poles and wires, props, collision footprints (`COLLIDERS`), the halte, the ojek base and the portfolio `PLACES` with their camera shots. `kit.ts` loads the Blender kit from `public/models/kampung/*.glb`, clones assets by root name, tints the stable materials (`Dinding`, `Genteng`, `Jaket`, …), paints signs onto the blank `PapanNama`/`PapanTrayek` faces in the current language (recomputing their UVs facing out from the object) and hangs accessories off `Rig_Neck`. `batch.ts` bakes each kit asset into a few merged layers (walls, roof tiles, zinc, metal, glass, glow, the rest as vertex colours) and draws houses and props as instanced meshes per 48 m chunk, tinting walls and roofs per copy; `surfaces.ts` draws ground textures, the tile and zinc normal maps and a world-space plaster grain (`addGrain`); `landscape.ts` builds the terrain, the sea (depth-tinted, foam, wave normals), rice fields, hill forest, jetty, outrigger boats, Krakatau and the road surfaces. `Town.tsx` puts it all together with the static colliders. `townsfolkData.ts` + `townsfolkSim.ts` + `Townsfolk.tsx` run the people (walkers on pavements and gangs who stop for you, chatting neighbours, the bakso seller, ojek drivers, fishermen, kids passing a ball); `trafficSim.ts` + `Traffic.tsx` drive vehicles on closed `ROUTES` over the network (offset to the left lane, rounded corners, slowing for bends, following and giving way), with kinematic colliders, stopping for the player and at the halte, and carry the player as an angkot passenger. `dialogues.ts` builds conversations from `PortfolioData`; `KampungHud.tsx` shows them as typed speech bubbles beside the speaker with numbered replies and a plain "read summary" panel; `bubbles.ts` projects ambient chatter over heads from a ref store. `KampungMap.tsx` draws the corner minimap and the full map (`M`), both SVG in world metres; picking a place sets the guide arrow. The camera orbits with a mouse drag and zooms with the wheel (`CourierCamera.orbit`); walking keys follow the camera yaw through `tuning.cameraForward`, and `occlusion.ts` lets the camera rise over roofs that would hide the player. In `KampungWorld.tsx`, `Interactions` runs before the rig each physics step so `E` means talk, then board the angkot, before falling through to the motorbike. Files that differ only in case (`Traffic.tsx`/`trafficSim.ts`) must not share a stem: Windows treats them as the same module.
- `src/components/ui/` — shadcn/Radix UI primitives. These files are excluded from ESLint; preserve their generated style when possible.
- `src/hooks/` — reusable browser hooks, notably `useInView` and `useCounter`.
- `src/i18n/` — locale context and static English/Indonesian UI translations.
- `src/lib/` — shared utilities: `cn` in `src/lib/utils.ts`, the path router in `src/lib/router.ts`, `caseStudyHref`/`projectLinks` in `src/lib/projects.ts`, `scrollToSection` in `src/lib/scroll.ts`.
- `src/types/` — shared TypeScript contracts in `portfolio.ts`.
- `public/data/` — English portfolio JSON; `public/data/id/` is the Indonesian mirror.
- `public/images/` and `public/pdf/` — static assets such as the profile image and CV.
- `public/models/` — the original Blender models for the kampung (`ojek.glb`, `rider.glb`, `kampung/*.glb`), with how they were exported in `CREDITS.md`.
- `docs/superpowers/` — historical design specifications and implementation plans; verify current source before treating them as authoritative.

## Development Commands

Use npm; `package-lock.json` is the repository lockfile.

```bash
npm install
npm run dev          # Start the Vite development server
npm run lint         # Run ESLint
npm run typecheck    # Run tsc --noEmit
npm run build        # Run tsc -b, then vite build
npm run format       # Format TypeScript/TSX files in place
npm run preview      # Preview the production build
```

When verifying a change, run checks in this order: `npm run lint`, `npm run typecheck`, then `npm run build`. `npm run format` mutates files; use it as a formatter, not a read-only check.

## Code Conventions & Common Patterns

- Use functional React components with explicit typed props from `src/types/portfolio.ts` or nearby component types.
- Keep portfolio content in both `public/data/*.json` and `public/data/id/*.json`; preserve the existing JSON contracts when changing fields.
- Follow the existing local-state pattern for UI-only behavior such as expanded cards, visible timeline entries, copy feedback, and animation state.
- Use `useInView` and `useCounter` for viewport-triggered and animated numeric content rather than adding an animation dependency.
- Visual language: headings use Fraunces (`--font-heading`, from `@fontsource-variable/fraunces` imported in `main.tsx`), body uses IBM Plex Sans, and IBM Plex Mono is only for small metadata (periods, stacks, numbers). Separate areas with the warm `bg-surface` token and spacing rather than 1px borders; radius is `--radius: 0.5rem`. Keep amber (`primary` / `text-brand`) to one or two accents per screen. Avoid terminal prompts, status pills, glow, gradients and empty marketing copy.
- `FadeIn` is the only scroll reveal: it hides content only after JS confirms IntersectionObserver support, no reduced-motion preference, and that the element is below the fold, so content stays visible otherwise. Use it for large blocks, not every element; the `Stats` counter is the other deliberate animation.
- Use `cn(...)` for conditional class names. Tailwind v4 theme variables and light/dark CSS variables live in `src/index.css`; do not add a `tailwind.config.js`.
- Use the `@/*` aliases configured in TypeScript/Vite, such as `@/components`, `@/components/ui`, `@/hooks`, and `@/lib/utils`.
- Keep asynchronous data loading in the existing `App.tsx` flow: fetch all locale resources together, check each response, then update aggregate state. Preserve full-screen loading and error branches.
- Type-only imports must use `import type`. TypeScript enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noFallthroughCasesInSwitch`; do not introduce enums, namespaces, or parameter properties.
- Formatting uses no semicolons, double quotes, LF line endings, two-space indentation, ES5 trailing commas, and an 80-column print width. Prettier uses the Tailwind plugin with `cn` and `cva` as Tailwind functions.
- Prefer existing shadcn/Radix and Lucide patterns for UI and icons instead of introducing parallel primitives.
- 3D models live in `public/models/` (see `CREDITS.md`). The kampung kit is generated by Blender scripts outside the repo; keep the material and node names the code looks up (`Dinding`, `Genteng`, `Seng`, `PapanNama`, `Roda*`, `Rig_*`), and keep `--flatten false --instance false` when optimizing so assets stay under their named roots.
- In `src/components/kampung/` and `src/components/courier/`, mutate shared per-frame values only through refs (`courierRef.current`, `trafficRef.current`, …) inside effects, event handlers, `useFrame` and physics-step callbacks; the React Compiler lint rules reject mutating values returned from hooks or passed to them. Keep non-component helpers in `.ts` files (`terrain.ts`, `roads.ts`, `layout.ts`) so fast refresh lint passes. The world claims WASD by calling `preventDefault`, and `theme-provider.tsx` skips its `d` shortcut for prevented events.

## Important Files

- `src/main.tsx` — React bootstrap and provider composition.
- `src/App.tsx` — locale-aware portfolio loading, loading/error handling, and page composition.
- `src/types/portfolio.ts` — data model contracts.
- `src/i18n/context.tsx` and `src/i18n/translations/{en,id}.json` — locale state and UI strings.
- `src/components/theme-provider.tsx` — theme persistence, system preference handling, and keyboard toggle.
- `src/index.css` — Tailwind v4 imports, theme variables, base styles, and global effects.
- `package.json` and `package-lock.json` — npm scripts and dependency versions.
- `vite.config.ts` — React and Tailwind Vite plugins plus the `@` alias.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — strict TypeScript project configuration.
- `eslint.config.js`, `.prettierrc`, `.prettierignore` — lint and formatting policy.
- `components.json` — shadcn configuration (`radix-nova`, neutral base, CSS variables).
- `src/lib/router.ts` — path routes, link interception and legacy hash redirects.
- `vercel.json` — SPA fallback rewriting all routes to `/index.html`, which path routing needs.

## Runtime/Tooling Preferences

- Run with Node.js compatible with the locked Vite requirement: Node `^20.19.0` or `>=22.12.0`.
- Use npm rather than introducing another package manager or lockfile.
- The application is browser-only and expects `localStorage`, `navigator`, `IntersectionObserver`, and static assets served by Vite.
- Use Vite/Tailwind v4 configuration already present in `vite.config.ts` and `src/index.css`.
- Do not add SSR or Next.js conventions. Do not perform Git history mutations; the user commits manually.

## Testing & QA

No test framework, test script, test files, or coverage tooling is configured. Do not add or run a test suite unless the project requirements explicitly change.

For every meaningful change:

1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm run dev` and manually smoke-test the affected browser path when practical: both locales, JSON loading/error states, all sections, theme persistence, responsive navigation, and scroll/viewport interactions.

When changing content or assets, verify both localized JSON trees and every referenced image/CV URL. In particular, inspect existing `cvUrl` values rather than assuming they match files under `public/pdf/`.
