
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-2 border-yellow-200/20 rounded-full animate-pulse"></div>
      </div>
      <div className="text-center animate-pulse">
        <h3 className="text-xl font-semibold text-white">Nano Banana is Thinking...</h3>
        <p className="text-zinc-400 mt-2">Reimagining your image with Gemini magic</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
