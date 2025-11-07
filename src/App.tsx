import React, { useState, useEffect, useCallback } from "react";
import { PaperTexture } from "@paper-design/shaders-react";
import Sticker from "./Sticker";

interface StickerData {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  relativeX: number;
  relativeY: number;
}

// Responsive sticker size based on viewport width
const getStickerSize = (width: number): number => {
  // Mobile: 100px, Tablet: 140px, Desktop: 180px
  if (width < 768) return 100; // Mobile
  if (width < 1024) return 140; // Tablet
  return 180; // Desktop
};

// Minimum distance scales with sticker size
const getMinDistance = (stickerSize: number): number => {
  return stickerSize * 1.1; // ~10% buffer around sticker
};

// Import sticker images so Bun's bundler can process them
import stickerAirpodsWhite from "./assets/sticker-airpods-white.png";
import stickerAirpods from "./assets/sticker-airpods.png";
import stickerApple from "./assets/sticker-apple.png";
import stickerFlipper from "./assets/sticker-flipper.png";
import stickerGithub from "./assets/sticker-github.png";
import stickerKeyboard from "./assets/sticker-keyboard.png";
import stickerLaptopBack from "./assets/sticker-laptop-back.png";
import stickerLaptopCode from "./assets/sticker-laptop-code.png";
import stickerLaptopThinkpad from "./assets/sticker-laptop-thinkpad.png";
import stickerLaptop from "./assets/sticker-laptop.png";
import stickerMacbook from "./assets/sticker-macbook.png";
import stickerMagicMouse from "./assets/sticker-magic-mouse.png";
import stickerNest from "./assets/sticker-nest.png";
import stickerOpenai from "./assets/sticker-openai.png";
import stickerReact from "./assets/sticker-react.png";
import stickerRobot from "./assets/sticker-robot.png";
import stickerTechnologist from "./assets/sticker-technologist.png";

const stickerFiles = [
  stickerAirpodsWhite,
  stickerAirpods,
  stickerApple,
  stickerFlipper,
  stickerGithub,
  stickerKeyboard,
  stickerLaptopBack,
  stickerLaptopCode,
  stickerLaptopThinkpad,
  stickerLaptop,
  stickerMacbook,
  stickerMagicMouse,
  stickerNest,
  stickerOpenai,
  stickerReact,
  stickerRobot,
  stickerTechnologist,
];

/**
 * Generates a random position for a sticker that doesn't overlap with existing stickers
 * Uses collision detection to ensure minimum spacing between stickers
 *
 * @param maxWidth Maximum width of the viewport
 * @param maxHeight Maximum height of the viewport
 * @param existingPositions Array of already placed sticker positions
 * @param stickerSize Current sticker size
 * @param minDistance Minimum distance between stickers
 * @param maxAttempts Maximum number of placement attempts before giving up
 * @returns Valid position {x, y} or null if no valid position found
 */
const getRandomPosition = (
  maxWidth: number,
  maxHeight: number,
  existingPositions: { x: number; y: number }[],
  stickerSize: number,
  minDistance: number,
  maxAttempts = 100
): { x: number; y: number } | null => {
  const halfSize = stickerSize / 2;
  const minDistSquared = minDistance * minDistance;

  // Try up to maxAttempts times to find a non-overlapping position
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random position within bounds
    const x = Math.random() * (maxWidth - stickerSize);
    const y = Math.random() * (maxHeight - stickerSize);
    const centerX = x + halfSize;
    const centerY = y + halfSize;

    // Check collision with all existing stickers
    let hasOverlap = false;
    const len = existingPositions.length;
    for (let i = 0; i < len; i++) {
      const pos = existingPositions[i];
      const existingCenterX = pos.x + halfSize;
      const existingCenterY = pos.y + halfSize;

      // Inline distance calculation for performance
      const dx = existingCenterX - centerX;
      const dy = existingCenterY - centerY;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < minDistSquared) {
        hasOverlap = true;
        break; // Early exit on first collision
      }
    }

    if (!hasOverlap) {
      return { x, y };
    }
  }

  // Failed to find valid position after max attempts
  return null;
};

const App: React.FC = () => {
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Calculate responsive sticker size and min distance
  const stickerSize = getStickerSize(dimensions.width);

  /**
   * Updates sticker position and recalculates relative ratios
   * Called when user drags a sticker to a new position
   * Stores position as ratio (0-1) for proportional scaling on resize
   */
  const handleStickerPositionChange = useCallback(
    (id: string, x: number, y: number) => {
      setStickers((prev) =>
        prev.map((sticker) => {
          if (sticker.id === id) {
            const availableWidth = dimensions.width - stickerSize;
            const availableHeight = dimensions.height - stickerSize;

            return {
              ...sticker,
              x,
              y,
              // Store as ratio: position / available_space
              // This enables proportional scaling when viewport changes
              relativeX: x / availableWidth,
              relativeY: y / availableHeight,
            };
          }
          return sticker;
        })
      );
    },
    [dimensions, stickerSize]
  );

  useEffect(() => {
    // Preload all images before rendering stickers
    const preloadImages = (): Promise<void> => {
      return new Promise((resolve) => {
        const imagePromises = stickerFiles.map((src) => {
          return new Promise<void>((imgResolve) => {
            const img = new Image();
            img.onload = () => imgResolve();
            img.onerror = () => imgResolve(); // Resolve even on error to not block rendering
            img.src = src;
          });
        });

        Promise.all(imagePromises).then(() => resolve());
      });
    };

    const initializeStickers = async () => {
      // Wait for all images to load
      await preloadImages();

      const initialStickers: StickerData[] = [];
      const positions: { x: number; y: number }[] = [];

      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;
      const initialStickerSize = getStickerSize(initialWidth);
      const initialMinDistance = getMinDistance(initialStickerSize);
      const availableWidth = initialWidth - initialStickerSize;
      const availableHeight = initialHeight - initialStickerSize;

      for (let i = 0; i < stickerFiles.length; i++) {
        const position = getRandomPosition(
          initialWidth,
          initialHeight,
          positions,
          initialStickerSize,
          initialMinDistance
        );

        if (position) {
          positions.push(position);
          const rotation = Math.random() * 30 - 15;
          initialStickers.push({
            id: `sticker-${i}`,
            src: stickerFiles[i],
            x: position.x,
            y: position.y,
            rotation,
            relativeX: position.x / availableWidth,
            relativeY: position.y / availableHeight,
          });
        }
      }

      setStickers(initialStickers);
      setImagesLoaded(true);
    };

    initializeStickers();

    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        setDimensions({
          width: newWidth,
          height: newHeight,
        });

        // Scale sticker positions proportionally
        setStickers((prevStickers) => {
          const newStickerSize = getStickerSize(newWidth);
          return prevStickers.map((sticker) => {
            const availableWidth = newWidth - newStickerSize;
            const availableHeight = newHeight - newStickerSize;

            // Calculate new position using relative ratios
            const newX = sticker.relativeX * availableWidth;
            const newY = sticker.relativeY * availableHeight;

            // Clamp to bounds as safety check
            const clampedX = Math.max(0, Math.min(newX, availableWidth));
            const clampedY = Math.max(0, Math.min(newY, availableHeight));

            return {
              ...sticker,
              x: clampedX,
              y: clampedY,
            };
          });
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <PaperTexture
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
        fit="cover"
        colorFront="#9fadbc"
        colorBack="#ffffff"
        contrast={0.3}
        roughness={0.4}
        fiber={0.3}
        fiberSize={0.2}
        crumples={0.3}
        crumpleSize={0.35}
        folds={0.65}
        foldCount={5}
        fade={0}
        drops={0.2}
        speed={0}
      />
      {imagesLoaded &&
        stickers.map((sticker, index) => (
          <Sticker
            key={sticker.id}
            id={sticker.id}
            src={sticker.src}
            initialX={sticker.x}
            initialY={sticker.y}
            size={stickerSize}
            maxWidth={dimensions.width}
            maxHeight={dimensions.height}
            index={index}
            initialRotation={sticker.rotation}
            onPositionChange={handleStickerPositionChange}
          />
        ))}
    </div>
  );
};

export default App;
