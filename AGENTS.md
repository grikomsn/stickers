# Agent Guidelines for Interactive Stickers

## Build & Test Commands

- Dev: `bun index.html --console` (starts dev server on :3000 with HMR and console streaming)
- Build: `bun build index.html --outdir=./dist --minify` (production build with minification)
- Test: `bun test` (run all tests) or `bun test <file.test.ts>` (single test)
- Install: `bun install` (never use npm/yarn/pnpm)

## Technology Stack

- **Runtime**: Bun v1.3.1+ (NOT Node.js - use `bun <file>` not `node`)
- **Framework**: React 19 with TypeScript 5
- **Animation**: Framer Motion 12
- **Bundling**: Bun's native HTML bundler (NOT vite/webpack - just `bun index.html`)

## Code Style

**Imports**: React first, then 3rd party, then local. Use named imports.
**Types**: Strict TypeScript with interfaces for props. Define types inline or in same file.
**Components**: Functional components with React.FC. Props interface above component.
**Naming**: PascalCase for components/types, camelCase for variables/functions, UPPER_SNAKE_CASE for constants.
**Functions**: Document complex logic with JSDoc (see isOverlapping, getRandomPosition in App.tsx).
**State**: useState for local, useCallback for handlers, useMemo for expensive calculations.
**Performance**: Use squared distance for comparisons, debounce event handlers, memoize where needed.
**Error Handling**: Return null for failed operations (see getRandomPosition). Use optional chaining.

## Project Structure

- `index.html` - HTML entry point (references ./src/main.tsx)
- `src/*.tsx` - React components (App.tsx = main logic, Sticker.tsx = individual component)
- `public/` - Static assets (images auto-copied to dist/ on build)
- `dist/` - Production build output (gitignored)
