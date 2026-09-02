# Repository Guidelines

## Project Overview

This repository contains a bilingual personal portfolio SPA for Rifan Setiadi. It is a React 19 + TypeScript application built with Vite. The UI is data-driven: portfolio content is stored in localized JSON files under `public/data/`, while reusable React sections render the loaded data. There is no backend, router, SSR, or server-side data layer.

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
- Successful data renders the fixed page flow: `Navbar`, `Hero`, `About`, `Experience`, `Stats`, `Projects`, `Skills`, `Contact`, and `Footer`.
- `I18nProvider` manages `en | id`, persists the selection in `localStorage` under `locale`, updates the document language, and supplies static UI translations from `src/i18n/translations/`.
- `ThemeProvider` manages `dark | light | system`, persists under `theme`, reacts to OS/storage changes, and supports the `d` keyboard shortcut outside editable elements.
- Components use typed props and local state for section-specific interaction. There is no global state library.

## Key Directories

- `src/components/` — portfolio sections and shared presentation components (`Navbar`, `Hero`, `About`, `Experience`, `Stats`, `Projects`, `Skills`, `Contact`, `Footer`, `FadeIn`).
- `src/components/ui/` — shadcn/Radix UI primitives. These files are excluded from ESLint; preserve their generated style when possible.
- `src/hooks/` — reusable browser hooks, notably `useInView` and `useCounter`.
- `src/i18n/` — locale context and static English/Indonesian UI translations.
- `src/lib/` — shared utilities, including `cn` in `src/lib/utils.ts`.
- `src/types/` — shared TypeScript contracts in `portfolio.ts`.
- `public/data/` — English portfolio JSON; `public/data/id/` is the Indonesian mirror.
- `public/images/` and `public/pdf/` — static assets such as the profile image and CV.
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
- Use `cn(...)` for conditional class names. Tailwind v4 theme variables and light/dark CSS variables live in `src/index.css`; do not add a `tailwind.config.js`.
- Use the `@/*` aliases configured in TypeScript/Vite, such as `@/components`, `@/components/ui`, `@/hooks`, and `@/lib/utils`.
- Keep asynchronous data loading in the existing `App.tsx` flow: fetch all locale resources together, check each response, then update aggregate state. Preserve full-screen loading and error branches.
- Type-only imports must use `import type`. TypeScript enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noFallthroughCasesInSwitch`; do not introduce enums, namespaces, or parameter properties.
- Formatting uses no semicolons, double quotes, LF line endings, two-space indentation, ES5 trailing commas, and an 80-column print width. Prettier uses the Tailwind plugin with `cn` and `cva` as Tailwind functions.
- Prefer existing shadcn/Radix and Lucide patterns for UI and icons instead of introducing parallel primitives.

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
- `vercel.json` — SPA fallback rewriting all routes to `/index.html`.

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
