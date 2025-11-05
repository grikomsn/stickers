import React, { useState, useEffect, useCallback } from 'react';
import Sticker from './Sticker';
import useImagePreload from './hooks/useImagePreload';

interface StickerData {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  relativeX: number;
  relativeY: number;
}

const STICKER_SIZE = 180;
const MIN_DISTANCE = 200;

// Import sticker images so Bun's bundler can process them
import stickerAirpodsWhite from '../public/sticker-airpods-white.png';
import stickerAirpods from '../public/sticker-airpods.png';
import stickerApple from '../public/sticker-apple.png';
import stickerFlipper from '../public/sticker-flipper.png';
import stickerGithub from '../public/sticker-github.png';
import stickerKeyboard from '../public/sticker-keyboard.png';
import stickerLaptopBack from '../public/sticker-laptop-back.png';
import stickerLaptopCode from '../public/sticker-laptop-code.png';
import stickerLaptopThinkpad from '../public/sticker-laptop-thinkpad.png';
import stickerLaptop from '../public/sticker-laptop.png';
import stickerMacbook from '../public/sticker-macbook.png';
import stickerMagicMouse from '../public/sticker-magic-mouse.png';
import stickerNest from '../public/sticker-nest.png';
import stickerOpenai from '../public/sticker-openai.png';
import stickerReact from '../public/sticker-react.png';
import stickerRobot from '../public/sticker-robot.png';
import stickerTechnologist from '../public/sticker-technologist.png';

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
 * Checks if two points are overlapping based on minimum distance threshold
 * Uses squared distance calculation to avoid expensive Math.sqrt() calls
 * 
 * @param x1 X coordinate of first point
 * @param y1 Y coordinate of first point
 * @param x2 X coordinate of second point
 * @param y2 Y coordinate of second point
 * @param minDistance Minimum required distance between points
 * @returns true if points are closer than minDistance, false otherwise
 */
const isOverlapping = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minDistance: number
): boolean => {
  // Calculate squared distance: d² = (x₂-x₁)² + (y₂-y₁)²
  // This is faster than d = √((x₂-x₁)² + (y₂-y₁)²) and sufficient for comparison
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distanceSquared = dx * dx + dy * dy;
  const minDistanceSquared = minDistance * minDistance;
  
  return distanceSquared < minDistanceSquared;
};

/**
 * Generates a random position for a sticker that doesn't overlap with existing stickers
 * Uses collision detection to ensure minimum spacing between stickers
 * 
 * @param maxWidth Maximum width of the viewport
 * @param maxHeight Maximum height of the viewport
 * @param existingPositions Array of already placed sticker positions
 * @param maxAttempts Maximum number of placement attempts before giving up
 * @returns Valid position {x, y} or null if no valid position found
 */
const getRandomPosition = (
  maxWidth: number,
  maxHeight: number,
  existingPositions: { x: number; y: number }[],
  maxAttempts = 100
): { x: number; y: number } | null => {
  const halfSize = STICKER_SIZE / 2;
  const minDistSquared = MIN_DISTANCE * MIN_DISTANCE;
  
  // Try up to maxAttempts times to find a non-overlapping position
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random position within bounds
    const x = Math.random() * (maxWidth - STICKER_SIZE);
    const y = Math.random() * (maxHeight - STICKER_SIZE);
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
  const { isLoaded: imagesLoaded } = useImagePreload(stickerFiles);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  /**
   * Updates sticker position and recalculates relative ratios
   * Called when user drags a sticker to a new position
   * Stores position as ratio (0-1) for proportional scaling on resize
   */
  const handleStickerPositionChange = useCallback((id: string, x: number, y: number) => {
    setStickers(prev => prev.map(sticker => {
      if (sticker.id === id) {
        const availableWidth = dimensions.width - STICKER_SIZE;
        const availableHeight = dimensions.height - STICKER_SIZE;
        
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
    }));
  }, [dimensions]);

  useEffect(() => {
    if (!imagesLoaded) {
      return undefined;
    }

    const initialStickers: StickerData[] = [];
    const positions: { x: number; y: number }[] = [];
    
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const availableWidth = initialWidth - STICKER_SIZE;
    const availableHeight = initialHeight - STICKER_SIZE;

    for (let i = 0; i < stickerFiles.length; i++) {
      const position = getRandomPosition(
        initialWidth,
        initialHeight,
        positions
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
        setStickers(prevStickers => 
          prevStickers.map(sticker => {
            const availableWidth = newWidth - STICKER_SIZE;
            const availableHeight = newHeight - STICKER_SIZE;
            
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
          })
        );
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [imagesLoaded]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {stickers.map((sticker, index) => (
        <Sticker
          key={sticker.id}
          id={sticker.id}
          src={sticker.src}
          initialX={sticker.x}
          initialY={sticker.y}
          size={STICKER_SIZE}
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
