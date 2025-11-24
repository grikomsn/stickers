import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';

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
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  // Update position smoothly when initialX or initialY changes (on resize)
  useEffect(() => {
    const xAnimation = animate(x, initialX, {
      duration: 0.3,
      ease: 'easeInOut',
    });
    const yAnimation = animate(y, initialY, {
      duration: 0.3,
      ease: 'easeInOut',
    });

    return () => {
      xAnimation.stop();
      yAnimation.stop();
    };
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
    ease: 'easeOut' as const,
  }), [index]);

  const hoverTransition = useMemo(() => ({
    duration: 0.15,
    ease: 'easeOut' as const,
  }), []);

  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    cursor: 'grab',
    userSelect: 'none' as const,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'none' as const,
  }), [size]);

  const imageWrapperStyle = useMemo(() => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    overflow: 'visible' as const,
    background: 'transparent',
  }), []);

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    pointerEvents: 'none' as const,
    position: 'relative' as const,
    zIndex: 1,
  }), []);

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
      whileDrag={{
        cursor: 'grabbing',
      }}
    >
      <div style={imageWrapperStyle}>
        <img
          src={src}
          alt="sticker"
          style={imageStyle}
          draggable={false}
        />
      </div>
    </motion.div>
  );
};

export default Sticker;
