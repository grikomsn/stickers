# Interactive Stickers

A beautiful, interactive sticker board built with React, Bun, and Framer Motion. Drag, drop, and play with animated stickers that respond to your interactions.

## Features

- **Drag & Drop** - Move stickers anywhere on the screen with smooth animations
- **Smart Positioning** - No overlapping on initial placement with collision detection
- **Adaptive Layout** - Stickers maintain relative positions when window resizes
- **Interactive Animations** - Hover effects, rotation on drag, and smooth transitions
- **Performance Optimized** - Fast collision detection, debounced resize, memoized calculations
- **Boundary Constraints** - Stickers stay within viewport with no inertia
- **Responsive** - Works beautifully on any screen size

## Tech Stack

- [Bun](https://bun.sh) v1.3.1+ - Fast JavaScript runtime & package manager
- [Vite 7](https://vite.dev) - Lightning fast dev server & build pipeline
- [React 19](https://react.dev) - UI framework
- [Framer Motion 12](https://www.framer.com/motion/) - Animation library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety

## Getting Started

### Prerequisites

Make sure you have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Clone the repository
git clone https://github.com/grikomsn/stickers.git
cd stickers

# Install dependencies
bun install
```

### Development

```bash
# Start the Vite dev server with hot reload
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite automatically reloads changes and leverages the new React Compiler for optimized rendering.

### Build

```bash
# Build for production
bun run build

# (Optional) Preview the production build locally
bun run preview
```

Output will be in the `dist/` directory.

### Docker Deployment

Run the application using Docker with multi-stage builds for optimized image size.

#### Using Docker

```bash
# Build the Docker image
docker build -t stickers .

# Run the container
docker run -d -p 3000:3000 --name stickers stickers

# Access the application at http://localhost:3000
```

#### Using Docker Compose

```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

For detailed Docker deployment instructions, see [DOCKER.md](DOCKER.md).

#### Pull from GitHub Container Registry

Pre-built images are automatically published to GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/grikomsn/stickers:latest

# Run it
docker run -d -p 3000:3000 ghcr.io/grikomsn/stickers:latest
```

## How It Works

### Initial Placement

Stickers are randomly positioned using a collision detection algorithm that ensures no overlaps. The algorithm:

- Calculates center points for each sticker
- Uses squared distance comparison (avoiding expensive `sqrt()` calls)
- Maintains minimum 200px distance between stickers
- Attempts up to 100 placements per sticker

### Drag Interaction

- Grab any sticker and drag it around
- Sticker rotates slightly (±5°) on each drag interaction
- No momentum/inertia - stops exactly where you release
- Updates relative position ratios for resize adaptation

### Responsive Behavior

When you resize the browser window:

- Stickers scale proportionally to maintain relative positions
- A sticker at 50% screen width stays at 50% on all screen sizes
- Smooth 0.3s animation transitions to new positions
- Drag constraints update automatically

### Performance

- **Debounced resize** - 150ms delay prevents excessive recalculations
- **Optimized collision detection** - Squared distance + early exits
- **Memoized calculations** - Using React's `useMemo` and `useCallback`
- **Fast animations** - Hover: 0.15s, Tap: 0.1s

## Project Structure

```
stickers/
├── bun.lock             # Bun lockfile
├── public/              # Static assets served as-is (favicon, OG image)
├── src/
│   ├── assets/          # Sticker images bundled by Vite
│   ├── App.tsx          # Main app with state & collision detection
│   ├── Sticker.tsx      # Individual sticker component with animations
│   ├── main.tsx         # React entry point
│   └── vite-env.d.ts    # Vite type definitions
├── index.html           # Vite HTML entry point
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration (React Compiler enabled)
```

## Customization

### Add Your Own Stickers

1. Place PNG images in the `src/assets/` directory
2. Import the new files alongside the existing sticker imports in `src/App.tsx`:

```typescript
import mySticker from "./assets/my-sticker.png";
```

3. Add the imported sticker to the `stickerFiles` array:

```typescript
const stickerFiles = [
  // ... existing stickers
  mySticker,
];
```

### Adjust Sticker Size

Change the constant in `src/App.tsx`:

```typescript
const STICKER_SIZE = 180; // Default size in pixels
```

### Modify Spacing

Adjust minimum distance between stickers:

```typescript
const MIN_DISTANCE = 200; // Default 200px
```

## Browser Support

Works on all modern browsers that support:

- ES Modules
- CSS Grid
- Framer Motion (React 18+)

Tested on:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Metrics

- Initial load: < 500ms
- Collision detection: ~100ms for 17 stickers
- Drag smoothness: 60fps
- Resize adaptation: < 150ms (debounced)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Sticker designs inspired by tech & developer culture
- Built with modern web technologies and best practices
- Optimized for performance and user experience

## Author

Built with ❤️ by Griko Nibras

---

**Star ⭐ this repo if you find it helpful!**
