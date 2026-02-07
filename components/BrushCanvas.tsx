
import React, { useRef, useEffect, useState } from 'react';

interface BrushCanvasProps {
  imageSrc: string;
  brushSize: number;
  onMaskChange: (maskDataUrl: string | null) => void;
  isActive: boolean;
}

const BrushCanvas: React.FC<BrushCanvasProps> = ({ imageSrc, brushSize, onMaskChange, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      // Find the parent's actual dimensions to match the image
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      // We must not clear the content if we are just resizing the window, 
      // but in this simple implementation, we reset to ensure scaling stays correct.
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasContent(false);
      onMaskChange(null);
    };

    // Small delay to ensure the image has rendered and parent has correct size
    const timer = setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, [imageSrc]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return;
    setIsDrawing(true);
    const pos = getPos(e);
    setLastPos(pos);
    draw(pos.x, pos.y);
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    // We use a solid color for the mask so the compositor can use its alpha channel
    ctx.strokeStyle = 'rgba(168, 85, 247, 1.0)'; 
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPos) {
      ctx.moveTo(lastPos.x, lastPos.y);
    } else {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastPos({ x, y });
    setHasContent(true);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    draw(pos.x, pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
    if (hasContent) {
      onMaskChange(canvasRef.current?.toDataURL() || null);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onMaskChange(null);
  };

  return (
    <div className="absolute inset-0 z-20">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={handleMouseMove}
        onTouchEnd={stopDrawing}
        className={`w-full h-full cursor-crosshair transition-opacity duration-300 ${isActive ? 'opacity-70' : 'opacity-0 pointer-events-none'}`}
        style={{ touchAction: 'none' }}
      />
      {isActive && hasContent && (
        <button 
          onClick={(e) => { e.stopPropagation(); clear(); }}
          className="absolute bottom-4 right-4 z-30 px-3 py-1 bg-zinc-900/90 border border-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 hover:text-red-400 transition-all shadow-xl"
        >
          Clear Brush
        </button>
      )}
    </div>
  );
};

export default BrushCanvas;
