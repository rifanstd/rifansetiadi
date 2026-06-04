# Agent Instructions

## Project Type
React 19 + TypeScript + Vite SPA (not Next.js). No SSR, no App Router.

## Architecture
Single-page portfolio with data-driven rendering.
- All content lives in `public/data/*.json` (personal, stats, experience, projects, skills).
- `App.tsx` fetches all five JSON files on mount; components receive data as props.
- Data types are in `src/types/portfolio.ts`.
- Custom hooks in `src/hooks/` (`useCounter`, `useInView`).

## Stack & Versions
- Tailwind CSS v4 with `@theme inline` CSS config — no `tailwind.config.js`
- shadcn/ui v4 with `radix-nova` style
- `lucide-react` for icons
- `@fontsource-variable/inter` for font

## Development Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check then build (`tsc -b && vite build`) |
| `npm run lint` | ESLint (ignores `src/components/ui/**`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write all `.{ts,tsx}` |
| `npm run preview` | Preview production build |

Order when verifying: `lint` → `typecheck` → `build`

There is no test framework configured. Do not attempt to run tests.

## TypeScript Strictness
- `noUnusedLocals: true` and `noUnusedParameters: true` are enabled
- `verbatimModuleSyntax: true` — use `import type { Foo }` for type-only imports
- `erasableSyntaxOnly: true` — no `enum`, `namespace`, or parameter properties

## shadcn/ui
- Add components: `npx shadcn@latest add <component>`
- Components live in `src/components/ui/`
- Utility `cn` is in `src/lib/utils.ts`
- Aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`
- shadcn-generated components in `src/components/ui/` are ignored by ESLint — don't fix lint issues there.

## Tailwind v4 Notes
- Theme variables are defined in `src/index.css` via `@theme inline`
- CSS variables for theming (light/dark) are in `:root` and `.dark`
- Prettier uses `prettier-plugin-tailwindcss` with `tailwindFunctions: ["cn", "cva"]`

## Theme & Dark Mode
- Custom `ThemeProvider` in `src/components/theme-provider.tsx` (not from a library).
- Users toggle dark mode with the `d` key (only when no input/editable element is focused).
- Persists to `localStorage` key `"theme"`. Supports `"dark"`, `"light"`, `"system"`.

## Styling Conventions
- Prettier: `semi: false`, `singleQuote: false`, `trailingComma: "es5"`, `endOfLine: "lf"`
- Base color: `neutral`

## Git / Workflow
- **DO NOT perform any git mutations** — no `git commit`, `git push`, `git reset`, `git rebase`, `git merge`, or any other git write operations.
- The user commits manually. Only read git state (`git status`, `git log`, `git diff`, etc.) if needed.
