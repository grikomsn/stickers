# Agent Guidelines for Stickers Project

## Build/Lint/Test Commands
- **Dev server**: `bun run dev` (starts Vite at localhost:5173)
- **Build**: `bun run build` (TypeScript compilation + Vite build)
- **Lint**: `bun run lint` (ESLint check)
- **Preview**: `bun run preview` (preview production build)
- **No tests configured** - project doesn't have a test suite yet

## Code Style

### Package Manager & Runtime
- **Always use Bun**, never Node.js, npm, pnpm, or yarn
- Use `bun run <script>` not `npm run <script>`
- Use `bun install` not `npm install`

### Imports & Formatting
- Use double quotes for strings (see existing code)
- Group imports: React/libraries first, then local modules, then assets
- Import assets as ES modules: `import image from "./assets/image.png"`

### TypeScript
- Strict type checking enabled (React 19, TypeScript 5)
- Define interfaces for props and data structures
- Use React.FC for components with explicit prop types
- Use `useMemo`, `useCallback` for performance optimization

### Naming Conventions
- PascalCase for components and interfaces: `StickerData`, `App`
- camelCase for functions, variables, handlers: `handleDragEnd`, `stickerSize`
- UPPER_CASE for true constants: `MIN_DISTANCE`, `STICKER_SIZE`
- Descriptive names with context: `getRandomPosition`, `handleStickerPositionChange`

### Component Style
- Functional components with hooks (React 19)
- Memoize expensive calculations and callbacks
- Use Framer Motion for animations
- Inline styles via useMemo for performance
- Document complex functions with JSDoc comments

### Error Handling
- Handle edge cases gracefully (e.g., image load errors, failed collision detection)
- Use null returns for failures, check before use
- Provide fallbacks (e.g., resolve on image error to not block rendering)
