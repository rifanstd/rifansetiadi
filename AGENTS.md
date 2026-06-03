# Agent Instructions

## Project Type
React 19 + TypeScript + Vite SPA (not Next.js). No SSR, no App Router.

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
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write all `.{ts,tsx}` |
| `npm run preview` | Preview production build |

Order when verifying: `lint` → `typecheck` → `build`

## TypeScript Strictness
- `noUnusedLocals: true` and `noUnusedParameters: true` are enabled
- `verbatimModuleSyntax: true` — use `import type { Foo }` for type-only imports
- `erasableSyntaxOnly: true` — no `enum`, `namespace`, or parameter properties

## shadcn/ui
- Add components: `npx shadcn@latest add <component>`
- Components live in `src/components/ui/`
- Utility `cn` is in `src/lib/utils.ts`
- Aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`

## Tailwind v4 Notes
- Theme variables are defined in `src/index.css` via `@theme inline`
- CSS variables for theming (light/dark) are in `:root` and `.dark`
- Prettier uses `prettier-plugin-tailwindcss` with `tailwindFunctions: ["cn", "cva"]`

## Styling Conventions
- Prettier: `semi: false`, `singleQuote: false`, `trailingComma: "es5"`, `endOfLine: "lf"`
- ThemeProvider wraps the app; users toggle dark mode with the `d` key
- Base color: `neutral`
