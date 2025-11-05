import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

interface StickerProps {
  id: string;
  src: string;
  initialX: number;
  initialY: number;
  size: number;
  maxWidth: number;
  maxHeight: number;
  index: number;
  initialRotation: number;
  onPositionChange: (id: string, x: number, y: number) => void;
}

const Sticker: React.FC<StickerProps> = ({
  id,
  src,
  initialX,
  initialY,
  size,
  maxWidth,
  maxHeight,
  index,
  initialRotation,
  onPositionChange,
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  // Update position smoothly when initialX or initialY changes (on resize)
  useEffect(() => {
    x.set(initialX, { duration: 0.3, ease: "easeInOut" });
    y.set(initialY, { duration: 0.3, ease: "easeInOut" });
  }, [initialX, initialY, x, y]);

  const dragConstraints = useMemo(() => ({
    left: 0,
    right: maxWidth - size,
    top: 0,
    bottom: maxHeight - size,
  }), [maxWidth, maxHeight, size]);

  const handleDragEnd = useCallback(() => {
    const rotationChange = Math.random() * 10 - 5;
    setRotation(prev => prev + rotationChange);
    
    // Report new position back to parent to update relative ratios
    const currentX = x.get();
    const currentY = y.get();
    onPositionChange(id, currentX, currentY);
  }, [onPositionChange, id, x, y]);

  const transitionConfig = useMemo(() => ({
    duration: 0.5,
    delay: index * 0.05,
    ease: "backOut"
  }), [index]);

  const hoverTransition = useMemo(() => ({
    duration: 0.15,
    ease: "easeOut"
  }), []);

  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    cursor: 'grab',
    userSelect: 'none' as const,
  }), [size]);

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    pointerEvents: 'none' as const,
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
  }), []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    // If image fails to load, still render the component to prevent infinite loading
    setIsImageLoaded(true);
  }, []);

  // Don't render until image is loaded to prevent staggering
  if (!isImageLoaded) {
    return (
      <img
        src={src}
        alt="sticker"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      layout={false}
      style={{ x, y, ...containerStyle }}
      initial={{ 
        scale: 0, 
        opacity: 0,
        rotate: initialRotation
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotate: rotation
      }}
      transition={transitionConfig}
      onDragEnd={handleDragEnd}
      whileHover={{
        scale: 1.1,
        rotate: rotation + 5,
        transition: hoverTransition
      }}
      whileTap={{
        scale: 0.95,
        cursor: 'grabbing',
        transition: { duration: 0.1 }
      }}
    >
      <img
        src={src}
        alt="sticker"
        style={imageStyle}
        draggable={false}
      />
    </motion.div>
  );
};

export default Sticker;
