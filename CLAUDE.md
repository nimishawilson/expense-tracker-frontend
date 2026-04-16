# CLAUDE.md

We are building an app described in @spec.md. Read the file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (hot reload)
npm run build      # Production build to dist/
npm run watch      # Dev build with watch mode
npm test           # Run unit tests with Vitest
npx prettier --write .  # Format all files
```

Generate Angular artifacts:
```bash
ng generate component <name>   # Creates component with SCSS
ng generate service <name>
ng generate guard <name>
```

## Architecture

This is an **Angular 21 standalone-component app** (no NgModules). Key architectural points:

- **Standalone components**: All components use `imports: [...]` directly — no `NgModule` declarations.
- **Signals**: Prefer Angular signals (`signal()`, `computed()`, `effect()`) over RxJS subjects for local component state.
- **Routing**: Defined in `src/app/app.routes.ts`, consumed via `provideRouter()` in `src/app/app.config.ts`.
- **No HttpClient yet**: When adding API calls, wire up `provideHttpClient()` in `app.config.ts`.
- **Styles**: SCSS throughout. Component styles are scoped. Global styles in `src/styles.scss`. Per-component style budget: 4kB warning / 8kB error.

## Project Context

This app is being built per `spec.md`. Key design decisions from the spec:

- **Single Expense model** covers both personal and shared expenses.
- **Backend is source of truth** for all financial calculations — the frontend sends *intent* (split type + participants), never pre-calculated values.
- **Mobile-first** responsive design; must adapt to all screen sizes.
- **Balances are derived**, not stored client-side.
- **Settlements** are separate entities from expenses.

Planned screens: Dashboard, Expense List, Add/Edit Expense, Expense Detail, Balance, Settlement.

MVP scope excludes: groups, notifications, OCR, AI insights, multi-currency, offline mode.

## Code Style

- TypeScript strict mode is enabled (`strict`, `noImplicitOverride`, `noImplicitReturns`, `strictTemplates`).
- Prettier: single quotes, 100-char print width, Angular HTML parser for templates.
- Component selector prefix: `app-`.