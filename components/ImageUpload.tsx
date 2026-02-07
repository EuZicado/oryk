
import React, { useRef } from 'react';
import { ImageState } from '../types';

interface ImageUploadProps {
  onUpload: (image: ImageState) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onUpload({
          url: reader.result as string,
          base64: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={triggerUpload}
      className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-yellow-400/50 hover:bg-zinc-900/50 transition-all duration-300"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-zinc-800 rounded-full group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <line x1="16" y1="5" x2="22" y2="5" />
            <line x1="19" y1="2" x2="19" y2="8" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-200">Click to upload image</p>
          <p className="text-sm text-zinc-500 mt-1">PNG, JPG, or WEBP (Max 10MB)</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
