import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { PaperTexture } from '@paper-design/shaders-react';

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

  const imageWrapperStyle = useMemo(() => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    overflow: 'hidden' as const,
  }), []);

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    pointerEvents: 'none' as const,
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
    position: 'relative' as const,
    zIndex: 1,
  }), []);

  const textureOverlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    pointerEvents: 'none' as const,
    mixBlendMode: 'overlay' as const,
    opacity: 0.6,
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
    >
      <div style={imageWrapperStyle}>
        <img
          src={src}
          alt="sticker"
          style={imageStyle}
          draggable={false}
        />
        <PaperTexture
          style={textureOverlayStyle}
          fit="cover"
          colorFront="#9fadbc"
          colorBack="#ffffff"
          contrast={0.25}
          roughness={0.3}
          fiber={0.25}
          fiberSize={0.15}
          crumples={0.2}
          crumpleSize={0.3}
          folds={0.5}
          foldCount={4}
          fade={0}
          drops={0.15}
          speed={0}
        />
      </div>
    </motion.div>
  );
};

export default Sticker;
