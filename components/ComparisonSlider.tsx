
import React, { useState, useRef } from 'react';

interface ComparisonSliderProps {
  original: string;
  edited: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, edited }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl cursor-ew-resize select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img src={original} className="absolute inset-0 w-full h-full object-contain bg-zinc-950" alt="Antes" />
      <div 
        className="absolute inset-0 w-full h-full z-10"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <img src={edited} className="w-full h-full object-contain bg-zinc-950" alt="Depois" />
      </div>
      
      {/* Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m18 8 4 4-4 4M6 8l-4 4 4 4" />
          </svg>
        </div>
      </div>

      <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-bold text-white/50 z-30">ORIGINAL</div>
      <div className="absolute top-4 right-4 px-2 py-1 bg-purple-600/60 backdrop-blur rounded text-[9px] font-bold text-white z-30">ØRYK RENDER</div>
    </div>
  );
};

export default ComparisonSlider;
